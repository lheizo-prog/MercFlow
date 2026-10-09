package service

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"mime/multipart"
	"net/http"
	"time"
)

type LabelReaderBoundingBox struct {
	X1 int `json:"x1"`
	Y1 int `json:"y1"`
	X2 int `json:"x2"`
	Y2 int `json:"y2"`
}

type LabelReaderDetectedLabel struct {
	LabelIndex          int                    `json:"label_index"`
	BoundingBox         LabelReaderBoundingBox `json:"bounding_box"`
	DetectionConfidence float64                `json:"detection_confidence"`
	RawText             string                 `json:"raw_text"`
	ParsedCode          string                 `json:"parsed_code"`
	Quality             string                 `json:"quality"`
	Confidence          float64                `json:"confidence"`
	CandidateVariations []string               `json:"candidate_variations"`
}

type LabelReaderResponse struct {
	Status           string                     `json:"status"`
	ProcessingTimeMs int                        `json:"processing_time_ms"`
	Labels           []LabelReaderDetectedLabel `json:"labels"`
}

type LabelReaderClient struct {
	baseURL    string
	httpClient *http.Client
}

func NovoLabelReaderClient(baseURL string) *LabelReaderClient {
	if baseURL == "" {
		baseURL = "http://localhost:8001"
	}
	return &LabelReaderClient{
		baseURL: baseURL,
		httpClient: &http.Client{
			Timeout: 45 * time.Second,
		},
	}
}

func (c *LabelReaderClient) ProcessImage(imageBytes []byte, filename string) (*LabelReaderResponse, error) {
	if len(imageBytes) == 0 {
		return nil, errors.New("imagem vazia")
	}

	body := &bytes.Buffer{}
	writer := multipart.NewWriter(body)

	part, err := writer.CreateFormFile("image", filename)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar multipart: %w", err)
	}

	if _, err := io.Copy(part, bytes.NewReader(imageBytes)); err != nil {
		return nil, fmt.Errorf("erro ao copiar bytes da imagem: %w", err)
	}

	if err := writer.Close(); err != nil {
		return nil, fmt.Errorf("erro ao fechar writer multipart: %w", err)
	}

	endpoint := fmt.Sprintf("%s/process-image", c.baseURL)
	req, err := http.NewRequest(http.MethodPost, endpoint, body)
	if err != nil {
		return nil, fmt.Errorf("erro ao criar requisição: %w", err)
	}
	req.Header.Set("Content-Type", writer.FormDataContentType())

	resp, err := c.httpClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("erro ao chamar microsserviço de OCR: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("microsserviço de OCR retornou status %d: %s", resp.StatusCode, string(respBytes))
	}

	var resultado LabelReaderResponse
	if err := json.NewDecoder(resp.Body).Decode(&resultado); err != nil {
		return nil, fmt.Errorf("erro ao decodificar resposta do OCR: %w", err)
	}

	return &resultado, nil
}

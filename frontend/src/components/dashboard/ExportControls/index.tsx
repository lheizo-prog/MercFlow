import { useState } from "react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { saveAs } from "file-saver";

interface Props {
  targetId: string; // id do elemento DOM a ser capturado
  filename?: string;
}

export function ExportControls({ targetId, filename = "comparativo" }: Props) {
  const [exportando, setExportando] = useState(false);
  async function capturar(): Promise<HTMLCanvasElement | null> {
    const elemento = document.getElementById(targetId);
    if (!elemento) {
      console.error("Elemento alvo nao encontrado:", targetId);
      return null;
    }
    return await html2canvas(elemento, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
      logging: false,
    });
  }

  async function exportarJPEG() {
    setExportando(true);
    try {
      const canvas = await capturar();
      if (!canvas) return;
      canvas.toBlob((blob) => {
        if (blob) saveAs(blob, `${filename}.jpg`);
      }, "image/jpeg", 0.92);
    } catch (e) {
      console.error("Erro ao exportar JPEG:", e);
    } finally {
      setExportando(false);
    }
  }

  async function exportarPDF() {
    setExportando(true);
    try {
      const canvas = await capturar();
      if (!canvas) return;
      const imgData = canvas.toDataURL("image/jpeg", 0.92);

      // Calcula orientacao: portrait ou landscape conforme aspecto
      const orientacao = canvas.width > canvas.height ? "landscape" : "portrait";
      const pdf = new jsPDF({
        orientation: orientacao,
        unit: "mm",
        format: "a4",
      });

      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 10;
      const usableW = pageWidth - margin * 2;
      const usableH = pageHeight - margin * 2;

      const ratio = canvas.width / canvas.height;
      let imgW = usableW;
      let imgH = imgW / ratio;
      if (imgH > usableH) {
        imgH = usableH;
        imgW = imgH * ratio;
      }
      const offsetX = (pageWidth - imgW) / 2;
      const offsetY = margin;

      pdf.addImage(imgData, "JPEG", offsetX, offsetY, imgW, imgH);
      pdf.save(`${filename}.pdf`);
    } catch (e) {
      console.error("Erro ao exportar PDF:", e);
    } finally {
      setExportando(false);
    }
  }

  return (
    <div className="position-relative d-inline-block">
      <div className="btn-group" role="group">
        <button
          type="button"
          className="btn btn-sm btn-outline-success"
          onClick={exportarPDF}
          disabled={exportando}
          title="Exportar como PDF"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
            <path d="M14 14V4.5L9.5 0H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h8.5zM9.5 3A1.5 1.5 0 0 0 8 1.5V3h1.5z"/>
          </svg>
          <span className="d-none d-sm-inline">PDF</span>
        </button>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary"
          onClick={exportarJPEG}
          disabled={exportando}
          title="Exportar como imagem"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" fill="currentColor" viewBox="0 0 16 16" className="me-1">
            <path d="M6.002 5.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0z"/>
            <path d="M2.002 1a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3a2 2 0 0 0-2-2h-12zm12 1a1 1 0 0 1 1 1v6.5l-3.777-1.947a.5.5 0 0 0-.577.093l-3.71 3.71-2.66-1.772a.5.5 0 0 0-.63.062L1.002 12V3a1 1 0 0 1 1-1h12z"/>
          </svg>
          <span className="d-none d-sm-inline">JPEG</span>
        </button>
      </div>
      {exportando && (
        <span className="ms-2 small text-body-secondary">
          <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true" />
          <span className="ms-1">Exportando...</span>
        </span>
      )}
    </div>
  );
}



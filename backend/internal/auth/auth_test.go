package auth

import "testing"

func TestCheckCredentials(t *testing.T) {
	if !CheckCredentials("admin", "admin123") {
		t.Fatal("Credenciais padrão do admin devem funcionar")
	}

	if CheckCredentials("admin", "senha-errada") {
		t.Fatal("Senha incorreta não deve ser aceita")
	}
}

func TestGenerateAndValidateToken(t *testing.T) {
	token, err := GenerateToken("admin")
	if err != nil {
		t.Fatalf("gerar token falhou: %v", err)
	}

	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("validar token falhou: %v", err)
	}

	if claims.Username != "admin" {
		t.Fatalf("username inesperado: %s", claims.Username)
	}
}

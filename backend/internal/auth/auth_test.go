package auth

import (
	"os"
	"testing"
)

func init() {
	// Configurar variáveis de ambiente para testes
	os.Setenv("ADMIN_USERNAME", "admin")
	os.Setenv("ADMIN_PASSWORD", "admin12345678")
	os.Setenv("JWT_SECRET", "test-jwt-secret-key-32-characters!")
}

func TestCheckCredentials(t *testing.T) {
	if !CheckCredentials("admin", "admin12345678") {
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

func TestHasPermission(t *testing.T) {
	perms := []string{"dashboard.read", "lancamento.create"}

	if !HasPermission(perms, "dashboard.read") {
		t.Fatal("permissão esperada não foi reconhecida")
	}

	if HasPermission(perms, "produto.create") {
		t.Fatal("permissão inexistente não deve ser aceita")
	}
}

func TestGenerateTokenForUser(t *testing.T) {
	user := User{
		ID:          7,
		Username:    "admin",
		Nome:        "Administrador",
		LojaID:      1,
		Role:        "admin",
		Permissions: []string{"dashboard.read", "lancamento.create", "produto.create"},
	}

	token, err := GenerateTokenForUser(user)
	if err != nil {
		t.Fatalf("gerar token do usuário falhou: %v", err)
	}

	claims, err := ValidateToken(token)
	if err != nil {
		t.Fatalf("validar token do usuário falhou: %v", err)
	}

	if claims.UserID != 7 {
		t.Fatalf("user id inesperado: %d", claims.UserID)
	}

	if claims.LojaID != 1 {
		t.Fatalf("loja id inesperado: %d", claims.LojaID)
	}

	if !HasPermission(claims.Permissions, "produto.create") {
		t.Fatal("permissão do usuário não foi carregada no token")
	}
}

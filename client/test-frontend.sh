#!/usr/bin/env bash
# ==============================================================================
# Script de Teste Automatizado do Frontend (Dia 1)
# ==============================================================================
# Este script valida:
# 1. Existência e integridade das variáveis de ambiente (.env)
# 2. Execução do Linter (oxlint)
# 3. Compilação TypeScript e Build de Produção (Vite)
# 4. Criação da imagem Docker (Multi-stage build)
# 5. Execução do container Nginx e teste HTTP das rotas SPA (/login, /register, etc.)
# ==============================================================================

set -e

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}   Iniciando Bateria de Testes do Frontend (Dia 1)   ${NC}"
echo -e "${BLUE}======================================================${NC}\n"

# ------------------------------------------------------------------------------
# 1. Verificação de Arquivo .env
# ------------------------------------------------------------------------------
echo -e "${YELLOW}[1/5] Verificando arquivo .env...${NC}"
if [ ! -f .env ]; then
  echo -e "${YELLOW}Arquivo .env não encontrado. Criando arquivo .env temporário para testes...${NC}"
  echo "VITE_SUPABASE_URL=https://mockproject.supabase.co" > .env
  echo "VITE_SUPABASE_ANON_KEY=mock_anon_key_for_testing_purposes" >> .env
  CREATED_TEMP_ENV=true
else
  echo -e "${GREEN}✓ Arquivo .env encontrado.${NC}"
  CREATED_TEMP_ENV=false
fi

# ------------------------------------------------------------------------------
# 2. Teste de Linter
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[2/5] Executando Linter (npm run lint)...${NC}"
if npm run lint; then
  echo -e "${GREEN}✓ Linter passou sem erros!${NC}"
else
  echo -e "${RED}✗ Falha no Linter.${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# 3. Teste de Compilação TypeScript e Build Vite
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[3/5] Executando Build de Produção (npm run build)...${NC}"
if npm run build; then
  echo -e "${GREEN}✓ Build gerado com sucesso na pasta dist/!${NC}"
else
  echo -e "${RED}✗ Falha no build TypeScript/Vite.${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# 4. Teste de Build da Imagem Docker
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[4/5] Construindo Imagem Docker (client/Dockerfile)...${NC}"
IMAGE_NAME="crud-client-test"
if docker build -t "$IMAGE_NAME" .; then
  echo -e "${GREEN}✓ Imagem Docker construída com sucesso!${NC}"
else
  echo -e "${RED}✗ Falha ao construir imagem Docker.${NC}"
  exit 1
fi

# ------------------------------------------------------------------------------
# 5. Teste de Execução do Container e Rotas Nginx (SPA Fallback)
# ------------------------------------------------------------------------------
echo -e "\n${YELLOW}[5/5] Testando Container Nginx e Rotas SPA...${NC}"
TEST_PORT=5173

# Parar container antigo se existir
docker rm -f "$IMAGE_NAME-runner" >/dev/null 2>&1 || true

echo "Iniciando container de teste na porta $TEST_PORT..."
CONTAINER_ID=$(docker run -d --name "$IMAGE_NAME-runner" -p "$TEST_PORT:80" "$IMAGE_NAME")

# Função de limpeza para garantir que o container será parado
cleanup() {
  echo -e "\n${BLUE}Limpando container de teste...${NC}"
  docker rm -f "$CONTAINER_ID" >/dev/null 2>&1 || true
  if [ "$CREATED_TEMP_ENV" = true ]; then
    rm -f .env
  fi
}
trap cleanup EXIT

# Aguarda 2 segundos para o Nginx subir
sleep 2

# Lista de rotas para validar
ROUTES=("/" "/login" "/register" "/dashboard" "/tasks")
ALL_ROUTES_PASSED=true

for ROUTE in "${ROUTES[@]}"; do
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "http://localhost:${TEST_PORT}${ROUTE}" || echo "000")
  if [ "$HTTP_STATUS" -eq 200 ]; then
    echo -e "${GREEN}✓ Rota http://localhost:${TEST_PORT}${ROUTE} -> HTTP ${HTTP_STATUS} (OK)${NC}"
  else
    echo -e "${RED}✗ Rota http://localhost:${TEST_PORT}${ROUTE} -> HTTP ${HTTP_STATUS} (Esperado 200)${NC}"
    ALL_ROUTES_PASSED=false
  fi
done

if [ "$ALL_ROUTES_PASSED" = true ]; then
  echo -e "\n${GREEN}======================================================${NC}"
  echo -e "${GREEN}   ✓ TODOS OS TESTES DO DIA 1 PASSARAM COM SUCESSO!   ${NC}"
  echo -e "${GREEN}======================================================${NC}"
else
  echo -e "\n${RED}======================================================${NC}"
  echo -e "${RED}   ✗ ALGUNS TESTES DE ROTAS FALHARAM!                 ${NC}"
  echo -e "${RED}======================================================${NC}"
  exit 1
fi

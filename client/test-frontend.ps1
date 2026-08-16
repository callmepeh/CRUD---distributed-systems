# ==============================================================================
# Script de Teste Automatizado do Frontend em PowerShell (Dia 1)
# ==============================================================================

Write-Host "======================================================" -ForegroundColor Cyan
Write-Host "   Iniciando Bateria de Testes do Frontend (Dia 1)   " -ForegroundColor Cyan
Write-Host "======================================================`n" -ForegroundColor Cyan

# 1. Verificar .env
Write-Host "[1/5] Verificando arquivo .env..." -ForegroundColor Yellow
$tempEnv = $false
if (-not (Test-Path .env)) {
    Write-Host "Criando arquivo .env temporario..." -ForegroundColor Yellow
    Set-Content -Path .env -Value "VITE_SUPABASE_URL=https://mockproject.supabase.co`nVITE_SUPABASE_ANON_KEY=mock_anon_key_for_testing"
    $tempEnv = $true
} else {
    Write-Host "Arquivo .env encontrado." -ForegroundColor Green
}

$imageName = "crud-client-test"
$testPort = 5173

try {
    # 2. Linter
    Write-Host "`n[2/5] Executando Linter (npm run lint)..." -ForegroundColor Yellow
    npm run lint
    if ($LASTEXITCODE -ne 0) { throw "Falha no Linter" }
    Write-Host "Linter passou sem erros!" -ForegroundColor Green

    # 3. Build
    Write-Host "`n[3/5] Executando Build de Producao (npm run build)..." -ForegroundColor Yellow
    npm run build
    if ($LASTEXITCODE -ne 0) { throw "Falha no Build" }
    Write-Host "Build gerado com sucesso na pasta dist/!" -ForegroundColor Green

    # 4. Docker Build
    Write-Host "`n[4/5] Construindo Imagem Docker..." -ForegroundColor Yellow
    docker build -t $imageName .
    if ($LASTEXITCODE -ne 0) { throw "Falha no Docker Build" }
    Write-Host "Imagem Docker construida com sucesso!" -ForegroundColor Green

    # 5. Docker Run e Teste de Rotas
    Write-Host "`n[5/5] Testando Container Nginx e Rotas SPA..." -ForegroundColor Yellow
    
    $null = & docker rm -f "$imageName-runner" 2>&1
    
    $containerId = docker run -d --name "$imageName-runner" -p "$($testPort):80" $imageName
    Start-Sleep -Seconds 2

    $routes = @("/", "/login", "/register", "/dashboard", "/tasks")
    $allPassed = $true

    foreach ($route in $routes) {
        try {
            $url = "http://localhost:$testPort$route"
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 5
            if ($response.StatusCode -eq 200) {
                Write-Host "[OK] Rota $url -> HTTP 200 (OK)" -ForegroundColor Green
            } else {
                Write-Host "[ERRO] Falha na rota $url -> HTTP $($response.StatusCode)" -ForegroundColor Red
                $allPassed = $false
            }
        } catch {
            Write-Host "[ERRO] Falha ao acessar rota http://localhost:$testPort$route" -ForegroundColor Red
            $allPassed = $false
        }
    }

    if ($allPassed) {
        Write-Host "`n======================================================" -ForegroundColor Green
        Write-Host "   TODOS OS TESTES DO DIA 1 PASSARAM COM SUCESSO!   " -ForegroundColor Green
        Write-Host "======================================================" -ForegroundColor Green
    } else {
        Write-Host "`n======================================================" -ForegroundColor Red
        Write-Host "   ALGUNS TESTES DE ROTAS FALHARAM!                 " -ForegroundColor Red
        Write-Host "======================================================" -ForegroundColor Red
    }
} catch {
    Write-Host "`nErro durante os testes: $_" -ForegroundColor Red
} finally {
    Write-Host "`nLimpando container de teste..." -ForegroundColor Cyan
    $null = & docker rm -f "$imageName-runner" 2>&1
    if ($tempEnv) {
        Remove-Item .env -Force
    }
}

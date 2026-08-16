#rodar no docker: docker run --rm -v ${PWD}/server:/app crud-server pytest -v
"""
localmente: 
cd server
python -m venv .venv (se não tiver venv)
.\.venv\Scripts\Activate.ps1 (se não tiver ativado venv)
pip install -r requirements.txt (se não tiver dependências instaladas)
pytest -v
"""

import pytest
from uuid import UUID
from unittest.mock import MagicMock
from fastapi.testclient import TestClient
from types import SimpleNamespace

from app.main import app
from app.auth import get_current_user
from app.database import get_supabase_client

# Mock do cliente Supabase — evita RuntimeError quando .env não está disponível no CI.
# auth.get_user() levanta AuthApiError para simular token inválido/ausente.
_mock_db = MagicMock()
# auth.py captura `except Exception`, então qualquer exceção simula token inválido
_mock_db.auth.get_user.side_effect = Exception("invalid token")

# 1. Fixture do TestClient base (não autenticado, mas com Supabase mockado)
@pytest.fixture
def client():
    app.dependency_overrides.clear()
    # Sobrescreve o client Supabase com um mock para não depender de .env
    app.dependency_overrides[get_supabase_client] = lambda: _mock_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

# 2. Dados simulados do Usuário A e Usuário B
@pytest.fixture
def user_a():
    return SimpleNamespace(
        id=UUID("11111111-1111-1111-1111-111111111111"),
        email="usuario_a@exemplo.com"
    )

@pytest.fixture
def user_b():
    return SimpleNamespace(
        id=UUID("22222222-2222-2222-2222-222222222222"),
        email="usuario_b@exemplo.com"
    )

# 3. TestClient autenticado como Usuário A (Supabase e auth mockados)
@pytest.fixture
def client_user_a(user_a):
    app.dependency_overrides[get_supabase_client] = lambda: _mock_db
    app.dependency_overrides[get_current_user] = lambda: user_a
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

# 4. TestClient autenticado como Usuário B (Supabase e auth mockados)
@pytest.fixture
def client_user_b(user_b):
    app.dependency_overrides[get_supabase_client] = lambda: _mock_db
    app.dependency_overrides[get_current_user] = lambda: user_b
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

import pytest
from uuid import UUID
from fastapi.testclient import TestClient
from types import SimpleNamespace

from app.main import app
from app.auth import get_current_user

# 1. Fixture do TestClient base (não autenticado)
@pytest.fixture
def client():
    # Limpa overrides anteriores para garantir isolamento
    app.dependency_overrides.clear()
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

# 3. TestClient autenticado como Usuário A
@pytest.fixture
def client_user_a(user_a):
    app.dependency_overrides[get_current_user] = lambda: user_a
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

# 4. TestClient autenticado como Usuário B
@pytest.fixture
def client_user_b(user_b):
    app.dependency_overrides[get_current_user] = lambda: user_b
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()

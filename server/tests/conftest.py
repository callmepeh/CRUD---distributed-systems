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
from fastapi import Header
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

# ---------------------------------------------------------------------------
# Infraestrutura extra para tests/test_tasks.py: o _mock_db (MagicMock) acima
# é suficiente para testar auth.py (só precisa simular erro/sucesso do
# get_user), mas não serve para testar routers/tasks.py de verdade, pois lá
# o código encadeia .table("tasks").select("*").eq("user_id", ...).execute()
# e realmente precisa devolver dados filtrados. Por isso criamos um fake em
# memória que implementa só esse subconjunto da API do supabase-py.
# ---------------------------------------------------------------------------


class _FakeQuery:
    """Emula o query builder do supabase-py (postgrest) sobre uma lista em memória."""

    def __init__(self, table, action, payload=None):
        self._table = table
        self._action = action  # "insert" | "select" | "update" | "delete"
        self._payload = payload
        self._filters: list[tuple[str, str]] = []

    def select(self, _columns="*"):
        return self

    def eq(self, column, value):
        self._filters.append((column, str(value)))
        return self

    def order(self, _column, desc=False):  # noqa: ARG002 - assinatura compatível
        return self

    def _matches(self, row: dict) -> bool:
        return all(str(row.get(col)) == val for col, val in self._filters)

    def execute(self):
        rows = self._table.rows

        if self._action == "insert":
            row = dict(self._payload)
            rows.append(row)
            return SimpleNamespace(data=[row])

        if self._action == "select":
            return SimpleNamespace(data=[r for r in rows if self._matches(r)])

        if self._action == "update":
            updated = []
            for row in rows:
                if self._matches(row):
                    row.update(self._payload)
                    updated.append(row)
            return SimpleNamespace(data=updated)

        if self._action == "delete":
            deleted = [r for r in rows if self._matches(r)]
            rows[:] = [r for r in rows if not self._matches(r)]
            return SimpleNamespace(data=deleted)

        raise NotImplementedError(self._action)  # pragma: no cover


class _FakeTable:
    def __init__(self):
        self.rows: list[dict] = []

    def insert(self, payload):
        return _FakeQuery(self, "insert", payload)

    def select(self, columns="*"):
        return _FakeQuery(self, "select").select(columns)

    def update(self, payload):
        return _FakeQuery(self, "update", payload)

    def delete(self):
        return _FakeQuery(self, "delete")


class FakeSupabaseClient:
    """Fake mínimo do client Supabase, com estado em memória por instância."""

    def __init__(self):
        self._tables: dict[str, _FakeTable] = {}

    def table(self, name: str) -> _FakeTable:
        return self._tables.setdefault(name, _FakeTable())


@pytest.fixture
def fake_db():
    """Uma instância nova (dados zerados) do fake do Supabase por teste."""
    return FakeSupabaseClient()


# 5. TestClients de tasks.
#
# ATENÇÃO: `app.dependency_overrides` é um dict ÚNICO e global por app.
# Se cada client (A e B) chamasse `app.dependency_overrides[get_current_user] = ...`
# com uma constante fixa, o segundo client criado sobrescreveria o override
# do primeiro — os dois ficariam autenticados como o MESMO usuário, e os
# testes de isolamento (PUT/DELETE de tarefa de outro usuário) passariam
# mesmo com um bug real de segurança no endpoint. Por isso o override é
# *um só*, compartilhado, e decide qual usuário retornar por requisição, a
# partir de um header de teste (X-Test-User) — assim os dois TestClients
# podem coexistir com identidades diferentes no mesmo teste.

@pytest.fixture
def _tasks_env(fake_db, user_a, user_b):
    def resolve_current_user(
        x_test_user: str | None = Header(default=None, alias="X-Test-User")
    ):
        return user_b if x_test_user == "b" else user_a

    app.dependency_overrides[get_supabase_client] = lambda: fake_db
    app.dependency_overrides[get_current_user] = resolve_current_user
    yield fake_db
    app.dependency_overrides.clear()

@pytest.fixture
def client_tasks(fake_db):
    """Client sem autenticação, mas com Supabase fake (para testar 401 em /tasks)."""
    app.dependency_overrides[get_supabase_client] = lambda: fake_db
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def client_user_a_tasks(_tasks_env):
    with TestClient(app, headers={"X-Test-User": "a"}) as test_client:
        yield test_client


@pytest.fixture
def client_user_b_tasks(_tasks_env):
    with TestClient(app, headers={"X-Test-User": "b"}) as test_client:
        yield test_client

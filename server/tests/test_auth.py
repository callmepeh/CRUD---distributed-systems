from fastapi import Depends
from app.main import app
from app.auth import get_current_user

# Rota temporária para validar a dependência de autenticação
@app.get("/api/me", tags=["auth"])
def get_me(current_user=Depends(get_current_user)):
    return {"id": str(current_user.id), "email": current_user.email}

def test_health_check(client):
    """Valida se o endpoint de health check do backend responde 200 OK (Marco Dia 1)"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}

def test_acesso_sem_token_retorna_401(client):
    """Requisição sem cabeçalho Authorization deve retornar 401"""
    response = client.get("/api/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Token de autenticação ausente."

def test_acesso_com_token_invalido_retorna_401(client):
    """Requisição com token inválido deve retornar 401"""
    headers = {"Authorization": "Bearer token_falso_invalido_123"}
    response = client.get("/api/me", headers=headers)
    assert response.status_code == 401
    assert response.json()["detail"] == "Token inválido ou expirado."
    
def test_acesso_com_usuario_autenticado(client_user_a, user_a):
    """Requisição com usuário autenticado (override) deve retornar 200 com os dados do usuário"""
    response = client_user_a.get("/api/me")
    assert response.status_code == 200
    assert response.json()["id"] == str(user_a.id)
    assert response.json()["email"] == user_a.email
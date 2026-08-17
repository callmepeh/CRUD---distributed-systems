from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_health_check():
    """Valida se o endpoint de health check do backend responde 200 OK (Marco Dia 1)"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


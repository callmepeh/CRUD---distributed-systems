# Placeholder: main — Ponto de entrada FastAPI e CORS

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import tasks, subjects

app = FastAPI(
    title="CRUD de Tarefas - API",
    description="API REST do sistema de gerenciamento de tarefas.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.FRONTEND_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tasks.router)
app.include_router(subjects.router)

@app.get("/health", tags=["health"])
def health_check():
    return {"status": "ok"}

# models.py — Schemas Pydantic alinhados com a tabela 'tarefas' do Supabase
from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field


class TaskPriority(str, Enum):
    BAIXA = "Baixa"
    MEDIA = "Média"
    ALTA = "Alta"


class TaskStatus(str, Enum):
    PENDENTE = "Pendente"
    EM_ANDAMENTO = "Em andamento"
    CONCLUIDA = "Concluída"


class TaskBase(BaseModel):
    titulo: str = Field(..., min_length=1, max_length=255, description="Título da tarefa")
    descricao: str | None = Field(None, description="Descrição da tarefa")
    data_limite: str | None = Field(None, description="Data limite (YYYY-MM-DD)")
    prioridade: TaskPriority = Field(default=TaskPriority.MEDIA)
    status: TaskStatus = Field(default=TaskStatus.PENDENTE)
    categoria: str = Field(default="Geral", max_length=50)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(BaseModel):
    titulo: str | None = Field(None, min_length=1, max_length=255)
    descricao: str | None = None
    data_limite: str | None = None
    prioridade: TaskPriority | None = None
    status: TaskStatus | None = None
    categoria: str | None = None


class TaskOut(BaseModel):
    id: UUID
    user_id: UUID
    titulo: str
    descricao: str | None = None
    data_limite: str | None = None
    prioridade: TaskPriority
    status: TaskStatus
    categoria: str = "Geral"
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

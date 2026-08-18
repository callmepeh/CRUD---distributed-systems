# Placeholder: models — Schemas Pydantic (Tarefas, Disciplinas)
from datetime import datetime
from enum import Enum
from uuid import UUID

from pydantic import BaseModel, Field

class TaskPriority(str, Enum):
    BAIXA = "baixa"
    MEDIA = "media"
    ALTA = "alta"

# fix: alinhando a tabela no supabase: CREATE TYPE task_status AS ENUM ('pendente', 'em andamento', 'concluida');
class TaskStatus(str, Enum):
    PENDENTE = "pendente"
    EM_ANDAMENTO = "em andamento"
    CONCLUIDA = "concluida"

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200, description="Título da tarefa")
    description: str | None = Field(None, max_length=2000, description="Descrição da tarefa")
    due_date: datetime | None = Field(None, description="Data limite da tarefa")
    priority: TaskPriority = Field(default=TaskPriority.MEDIA)
    status: TaskStatus = Field(default=TaskStatus.PENDENTE)

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: str | None = Field(None, min_length=1, max_length=200)
    description: str | None = Field(None, max_length=2000)
    due_date: datetime | None = None
    priority: TaskPriority | None = None
    status: TaskStatus | None = None

class TaskOut(TaskBase):
    id: UUID
    user_id: UUID
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True

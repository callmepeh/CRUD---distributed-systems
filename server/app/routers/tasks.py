# Placeholder: tasks — Endpoints CRUD de Tarefas
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from supabase import Client

from app.auth import get_current_user
from app.database import get_supabase_client
from app.models import TaskCreate, TaskOut, TaskUpdate

router = APIRouter(prefix="/tasks", tags=["tasks"])

TABLE = "tasks"

def _get_task_or_404(task_id: UUID, db: Client) -> dict:
    result = db.table(TABLE).select("*").eq("id", str(task_id)).execute()
    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada.",
        )
    return result.data[0]


def _ensure_owner(task: dict, user_id: str) -> None:
    # 404 em vez de 403: não confirmamos para um usuário não autorizado
    # se a tarefa existe ou não, evitando vazar essa informação.
    if str(task["user_id"]) != str(user_id):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Tarefa não encontrada.",
        )


@router.post("", response_model=TaskOut, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreate,
    user=Depends(get_current_user),
    db: Client = Depends(get_supabase_client),
):
    data = payload.model_dump(mode="json")
    data["user_id"] = str(user.id)

    try:
        result = db.table(TABLE).insert(data).execute()
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não foi possível criar a tarefa: {exc}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não foi possível criar a tarefa.",
        )

    return result.data[0]


@router.get("", response_model=list[TaskOut])
def list_tasks(
    user=Depends(get_current_user),
    db: Client = Depends(get_supabase_client),
):
    result = (
        db.table(TABLE)
        .select("*")
        .eq("user_id", str(user.id))
        .order("created_at", desc=True)
        .execute()
    )
    return result.data


@router.get("/{task_id}", response_model=TaskOut)
def get_task(
    task_id: UUID,
    user=Depends(get_current_user),
    db: Client = Depends(get_supabase_client),
):
    task = _get_task_or_404(task_id, db)
    _ensure_owner(task, user.id)
    return task


def _update_task(
    task_id: UUID,
    payload: TaskUpdate,
    user,
    db: Client,
) -> dict:
    task = _get_task_or_404(task_id, db)
    _ensure_owner(task, user.id)

    data = payload.model_dump(mode="json", exclude_unset=True)
    if not data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Nenhum campo para atualizar foi enviado.",
        )

    try:
        result = (
            db.table(TABLE)
            .update(data)
            .eq("id", str(task_id))
            .execute()
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Não foi possível atualizar a tarefa: {exc}",
        )

    if not result.data:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Não foi possível atualizar a tarefa.",
        )

    return result.data[0]


@router.put("/{task_id}", response_model=TaskOut)
def update_task_put(
    task_id: UUID,
    payload: TaskUpdate,
    user=Depends(get_current_user),
    db: Client = Depends(get_supabase_client),
):
    return _update_task(task_id, payload, user, db)


@router.patch("/{task_id}", response_model=TaskOut)
def update_task_patch(
    task_id: UUID,
    payload: TaskUpdate,
    user=Depends(get_current_user),
    db: Client = Depends(get_supabase_client),
):
    return _update_task(task_id, payload, user, db)


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(
    task_id: UUID,
    user=Depends(get_current_user),
    db: Client = Depends(get_supabase_client),
):
    task = _get_task_or_404(task_id, db)
    _ensure_owner(task, user.id)

    db.table(TABLE).delete().eq("id", str(task_id)).execute()
    return None

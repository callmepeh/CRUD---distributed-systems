"""Testes das rotas CRUD de tarefas (server/app/routers/tasks.py).

Cobertura mínima exigida no plano (Dia 3):
- POST válido / sem autenticação / com dados inválidos
- GET autenticado / sem autenticação
- PUT da própria tarefa e da tarefa de outro usuário (deve falhar)
- DELETE da própria tarefa e da de outro usuário (deve falhar)
"""


def _payload(**overrides):
    data = {
        "titulo": "Estudar para a prova de Redes",
        "descricao": "Revisar camada de transporte.",
        "prioridade": "Alta",
        "status": "Pendente",
        "categoria": "Estudos",
    }
    data.update(overrides)
    return data


# --- POST -------------------------------------------------------------


def test_post_task_valido_cria_tarefa_do_usuario_autenticado(client_user_a_tasks, user_a):
    response = client_user_a_tasks.post("/tasks", json=_payload())

    assert response.status_code == 201
    body = response.json()
    assert body["titulo"] == "Estudar para a prova de Redes"
    assert body["user_id"] == str(user_a.id)
    assert body["status"] == "Pendente"
    assert "id" in body and "created_at" in body


def test_post_task_sem_autenticacao_retorna_401(client_tasks):
    response = client_tasks.post("/tasks", json=_payload())
    assert response.status_code == 401


def test_post_task_com_dados_invalidos_retorna_422(client_user_a_tasks):
    # titulo vazio viola min_length=1 definido em TaskCreate (app/models.py)
    response = client_user_a_tasks.post("/tasks", json=_payload(titulo=""))
    assert response.status_code == 422


# --- GET ----------------------------------------------------------------


def test_get_tasks_autenticado_lista_apenas_as_proprias_tarefas(
    client_user_a_tasks, client_user_b_tasks
):
    client_user_a_tasks.post("/tasks", json=_payload(titulo="Tarefa do usuário A"))
    client_user_b_tasks.post("/tasks", json=_payload(titulo="Tarefa do usuário B"))

    response = client_user_a_tasks.get("/tasks")

    assert response.status_code == 200
    titulos = [task["titulo"] for task in response.json()]
    assert titulos == ["Tarefa do usuário A"]


def test_get_tasks_sem_autenticacao_retorna_401(client_tasks):
    response = client_tasks.get("/tasks")
    assert response.status_code == 401


# --- PUT ------------------------------------------------------------------


def test_put_da_propria_tarefa_atualiza_com_sucesso(client_user_a_tasks):
    created = client_user_a_tasks.post("/tasks", json=_payload()).json()

    response = client_user_a_tasks.put(
        f"/tasks/{created['id']}", json={"status": "Concluída"}
    )

    assert response.status_code == 200
    assert response.json()["status"] == "Concluída"
    assert response.json()["id"] == created["id"]


def test_put_da_tarefa_de_outro_usuario_falha(client_user_a_tasks, client_user_b_tasks):
    created = client_user_a_tasks.post("/tasks", json=_payload()).json()

    response = client_user_b_tasks.put(
        f"/tasks/{created['id']}", json={"status": "Concluída"}
    )

    assert response.status_code == 404
    # confirma que a tarefa do usuário A não foi alterada
    ainda_pendente = client_user_a_tasks.get(f"/tasks/{created['id']}").json()
    assert ainda_pendente["status"] == "Pendente"


# --- DELETE -----------------------------------------------------------------


def test_delete_da_propria_tarefa_remove_com_sucesso(client_user_a_tasks):
    created = client_user_a_tasks.post("/tasks", json=_payload()).json()

    response = client_user_a_tasks.delete(f"/tasks/{created['id']}")
    assert response.status_code == 204

    ainda_existe = client_user_a_tasks.get(f"/tasks/{created['id']}")
    assert ainda_existe.status_code == 404


def test_delete_da_tarefa_de_outro_usuario_falha(client_user_a_tasks, client_user_b_tasks):
    created = client_user_a_tasks.post("/tasks", json=_payload()).json()

    response = client_user_b_tasks.delete(f"/tasks/{created['id']}")
    assert response.status_code == 404

    # a tarefa do usuário A deve continuar existindo
    ainda_existe = client_user_a_tasks.get(f"/tasks/{created['id']}")
    assert ainda_existe.status_code == 200

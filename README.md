# CRUD - Gerenciador de Tarefas - Cliente e Servidor

Este repositório contém o Trabalho I da disciplina de Sistemas Distribuídos (UFPI/CSHNB - 2026.2). Trata-se de uma aplicação Web com funcionalidades de CRUD, desenvolvida com React no frontend, FastAPI (Python) no backend e Supabase para modelagem do banco de dados e autenticação.

- Padrão de commits: <https://www.conventionalcommits.org/pt-br/v1.0.0/>

---

## 1. Instruções de instalação e execução

### Frontend (React + Vite + TypeScript)

```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

Para autenticação, crie um arquivo `client/.env` a partir do `.env.example`:

```env
VITE_SUPABASE_URL=https://<seu-projeto>.supabase.co
VITE_SUPABASE_ANON_KEY=<sua-anon-key>
```

### Docker Compose

Para subir o projeto completo:

```bash
docker compose up --build
```

---

## 2. Prints da interface

> Adicionar capturas de tela das páginas: Login, Cadastro, Dashboard e Tasks.

---

## 3. Estrutura do código

```
client/
├── src/
│   ├── components/           # Layout, Sidebar, StatCard, TaskModal, ProtectedRoute
│   ├── context/              # AuthContext (sessão global via onAuthStateChange)
│   ├── pages/                # Login, Register, Dashboard, Tasks
│   ├── services/             # supabase.ts, api.ts (axios + token JWT), taskApi.ts
│   └── types.ts              # Tipos do domínio (Task, Priority, Status)
├── Dockerfile
└── package.json
```

> As páginas **Dashboard** e **Tasks** usam chamadas à API FastAPI (`services/taskApi.ts` + `services/api.ts`) com token JWT no header `Authorization`.

---

## 4. Como instalar as dependências de teste

# 5. Como executar os testes;

# 6. Quantidade de testes implementados;

# 7. Resultado da execução dos testes;

# 8. Breve descrição do que cada grupo de testes valida.

---

## Design e métricas de IHC (Frontend)

O layout segue as **heurísticas de usabilidade de Nielsen** e boas práticas de
Interação Humano-Computador (IHC):

| Heurística | Onde foi aplicada |
| --- | --- |
| **Visibilidade do estado do sistema** | Mensagens de sucesso/erro em todas as ações de CRUD |
| **Controle e liberdade do usuário** | Botão cancelar no modal, confirmação antes de excluir, logout acessível |
| **Consistência e padrões** | Paleta única (azul/slate), badges de status/prioridade, componentes reutilizáveis |
| **Prevenção de erros** | Validação de título/data no formulário, botão desabilitado durante loading |
| **Reconhecimento em vez de lembrança** | Labels visíveis nos formulários, filtros de status em pílulas |
| **Estética e design minimalista** | Hierarquia clara, espaçamento generoso, sem excesso de informação |
| **Acessibilidade** | Labels e `aria-label` nos botões de ícone, contraste adequado, foco visível |

Também foram consideradas as métricas de **eficácia** (ações completadas com
feedback), **eficiência** (atalhos visuais: concluir tarefa com 1 clique) e
**satisfação** (design limpo e responsivo).
- Padrão de commits: <https://www.conventionalcommits.org/pt-br/v1.0.0/> 
- Pipeline de CI: .github/workflows/ci.yml(.github/workflows/ci.yml) (executa a cada push/PR para desenvolvimento e main; status no badge acima ou na aba [Actions](https://github.com/callmepeh/CRUD---distributed-systems/actions))

# 1. Instruções de instalação e execução

## 1.1. Pré-requisitos

- Um projeto criado no [Supabase](https://supabase.com/dashboard) (banco PostgreSQL + autenticação por e-mail/senha), com:
  - Tabela `tarefas` (`id`, `user_id`, `titulo`, `descricao`, `data_limite`, `prioridade`, `status`, `categoria`, `created_at`, `updated_at`);
  - **Row Level Security (RLS)** habilitada na tabela `tarefas`, com policies restringindo `SELECT`/`INSERT`/`UPDATE`/`DELETE` a `auth.uid() = user_id` — isso garante, no nível do próprio banco, que um usuário nunca acesse tarefas de outro;
  - Provedor **Email** habilitado em *Authentication → Providers*.
- Para rodar localmente sem Docker: Python 3.12+ e Node.js 20+.
- Para rodar via container: apenas [Docker](https://www.docker.com/) e Docker Compose.

## 1.2. Variáveis de ambiente

Copie os arquivos de exemplo e preencha com as credenciais do seu projeto Supabase:

```bash
cp server/.env.example server/.env
cp client/.env.example client/.env
```

`server/.env`:
```
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_JWT_SECRET=
SECRET_KEY=
```

`client/.env`:
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_URL=
```

O backend (`server/app/auth.py`) valida o JWT emitido pelo Supabase no header `Authorization: Bearer <token>`, buscando a chave pública do projeto no endpoint JWKS do Supabase e validando a assinatura (`ES256`). Token ausente/inválido/expirado → `401 Unauthorized`. Como reforço à RLS, a API também confere a posse da tarefa antes de editar/excluir; se pertence a outro usuário, responde `404 Not Found` (para não revelar nem a existência da tarefa a quem não é o dono).

## 1.3. Rodando com Docker (recomendado)

Com os `.env` configurados (passo 1.2), a partir da raiz do repositório:

```bash
docker-compose up --build
```

- Frontend: <http://localhost:5173>
- Backend (API): <http://localhost:8000> — documentação automática em <http://localhost:8000/docs>

Por baixo dos panos:
- `server/Dockerfile`: imagem `python:3.12-slim`, instala `requirements.txt` e roda `uvicorn app.main:app --host 0.0.0.0 --port 8000`, expondo a porta `8000`.
- `client/Dockerfile`: build multi-stage — estágio `node:22-alpine` roda `npm ci && npm run build`; o `dist/` gerado é servido pelo estágio `nginx:alpine` na porta `80` (mapeada para `5173` no host), com `nginx.conf` configurado para fallback de SPA.
- `docker-compose.yml` orquestra os serviços `server` e `client`, cada um lendo variáveis do respectivo `.env` (`env_file`), com `client` dependendo de `server` subir primeiro. O Supabase **não** é containerizado — é um serviço em nuvem, acessado pelas credenciais do `.env`.
- Os arquivos `.env` não são versionados (estão no `.gitignore`); apenas os `.env.example` ficam no repositório como referência.

## 1.4. Rodando localmente (sem Docker)

**Backend:**
```bash
cd server
python -m venv .venv
source .venv/bin/activate        # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

**Frontend** (em outro terminal):
```bash
cd client
npm install
npm run dev        # http://localhost:5173
```

# 2. Prints da interface

# 3. Estrutura do código

# 4. Como instalar as dependências de teste

O Pytest e o `httpx` (necessário para o `TestClient` do FastAPI) já estão listados em `server/requirements.txt`, junto das demais dependências do backend. Basta criar um ambiente virtual e instalar tudo de uma vez:

```bash
cd server
python -m venv .venv
source .venv/bin/activate        # Windows: .\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Não é necessário nenhum banco Supabase real rodando para executar os testes: eles usam mocks/fakes do client Supabase (`tests/conftest.py`), então funcionam mesmo offline ou com um `server/.env` de exemplo.

# 5. Como executar os testes

Com o ambiente virtual ativado, dentro da pasta `server/`:

```bash
pytest -v
```

O arquivo `server/pytest.ini` já configura `testpaths = tests`, então também é possível rodar apenas `pytest` na raiz de `server/`. É a mesma execução (`pytest --maxfail=1 -q`) rodada automaticamente pelo GitHub Actions a cada push/PR.

Também é possível rodar os testes dentro do container Docker do backend, sem precisar de Python instalado na máquina:

```bash
docker run --rm -v ${PWD}/server:/app crud-server pytest -v
```

# 6. Quantidade de testes implementados

**13 testes**, divididos em dois arquivos:

| Arquivo | Quantidade |
|---|---|
| `tests/test_auth.py` | 4 |
| `tests/test_tasks.py` | 9 |
| **Total** | **13** |

# 7. Resultado da execução dos testes

Última execução local (`pytest -v`), idêntica à rodada no CI:

```
collected 13 items

tests/test_auth.py::test_health_check PASSED                             [  7%]
tests/test_auth.py::test_acesso_sem_token_retorna_401 PASSED             [ 15%]
tests/test_auth.py::test_acesso_com_token_invalido_retorna_401 PASSED    [ 23%]
tests/test_auth.py::test_acesso_com_usuario_autenticado PASSED           [ 30%]
tests/test_tasks.py::test_post_task_valido_cria_tarefa_do_usuario_autenticado PASSED [ 38%]
tests/test_tasks.py::test_post_task_sem_autenticacao_retorna_401 PASSED  [ 46%]
tests/test_tasks.py::test_post_task_com_dados_invalidos_retorna_422 PASSED [ 53%]
tests/test_tasks.py::test_get_tasks_autenticado_lista_apenas_as_proprias_tarefas PASSED [ 61%]
tests/test_tasks.py::test_get_tasks_sem_autenticacao_retorna_401 PASSED  [ 69%]
tests/test_tasks.py::test_put_da_propria_tarefa_atualiza_com_sucesso PASSED [ 76%]
tests/test_tasks.py::test_put_da_tarefa_de_outro_usuario_falha PASSED    [ 84%]
tests/test_tasks.py::test_delete_da_propria_tarefa_remove_com_sucesso PASSED [ 92%]
tests/test_tasks.py::test_delete_da_tarefa_de_outro_usuario_falha PASSED [100%]

13 passed in 0.09s
```

O status atualizado também pode ser conferido a qualquer momento pelo badge no topo deste README ou na aba [Actions](https://github.com/callmepeh/CRUD---distributed-systems/actions) do repositório (job `backend-tests` do workflow `ci.yml`).

# 8. Breve descrição do que cada grupo de testes valida

**`tests/test_auth.py` — autenticação e proteção de rotas**

- `test_health_check`: confirma que a API sobe e o endpoint `GET /health` responde `200 OK` (marco de integração do Dia 1).
- `test_acesso_sem_token_retorna_401`: requisição a uma rota protegida sem header `Authorization` deve retornar `401`.
- `test_acesso_com_token_invalido_retorna_401`: requisição com um token malformado/inválido também deve retornar `401`.
- `test_acesso_com_usuario_autenticado`: com a dependência de autenticação sobrescrita (usuário simulado), a rota retorna `200` com os dados do usuário autenticado — valida que a dependency `get_current_user` é de fato usada e retorna o usuário certo.

**`tests/test_tasks.py` — CRUD de tarefas e isolamento entre usuários**

- **Criação (`POST /tasks`)**: cria tarefa com sucesso para um usuário autenticado; falha com `401` sem autenticação; falha com `422` quando o payload é inválido (ex.: sem título).
- **Listagem (`GET /tasks`)**: usuário autenticado só recebe as próprias tarefas (nunca as de outro usuário); sem autenticação, retorna `401`.
- **Atualização (`PUT /tasks/{id}`)**: dono da tarefa consegue atualizá-la; usuário B tentando atualizar uma tarefa do usuário A falha.
- **Exclusão (`DELETE /tasks/{id}`)**: dono da tarefa consegue excluí-la; usuário B tentando excluir uma tarefa do usuário A falha.

Esses testes usam fixtures de `tests/conftest.py` que simulam dois usuários distintos (A e B) trafegando na mesma suíte, com um fake em memória do client Supabase — reproduzindo, sem precisar de banco real, exatamente o cenário do checklist manual de integração (usuário A não vê/edita/exclui tarefas do usuário B, e vice-versa).


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

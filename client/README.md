# TaskCare — Frontend (React + Vite + TypeScript)

Interface do CRUD de tarefas, construída com **React 19**, **Vite**, **TypeScript**,
**Tailwind CSS** e **Supabase** (autenticação por e-mail/senha).

## Como rodar

```bash
npm install
npm run dev        # http://localhost:5173
```

Para autenticação, crie um arquivo `.env` a partir do `.env.example`:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

## Estrutura

```
src/
├── components/   # Layout, Sidebar, StatCard, TaskModal, ProtectedRoute
├── context/      # AuthContext (sessão global via onAuthStateChange)
├── pages/        # Login, Register, Dashboard, Tasks
├── services/     # supabase.ts, api.ts (axios + token JWT) e taskStore.ts (mock)
└── types.ts      # Tipos do domínio (Task, Priority, Status)
```

> As páginas **Dashboard** e **Tasks** ainda usam dados mockados (`services/taskStore.ts`).
> Quando o backend estiver pronto, basta trocar o `taskStore` pelas chamadas em `services/api.ts`.

## Design e métricas de IHC aplicadas

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

## Build, lint e testes

```bash
npm run build   # tsc + vite build
npm run lint    # oxlint
```

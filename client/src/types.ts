// client/src/types.ts
// Tipos do domínio de tarefas (espelham o modelo do backend FastAPI/Supabase).
export type Priority = 'baixa' | 'media' | 'alta';
export type Status = 'pendente' | 'em andamento' | 'concluida';

export interface Task {
  id: string;
  title: string;
  description: string;
  due_date: string; // formato YYYY-MM-DD
  priority: Priority;
  status: Status;
}

// Dados informados no formulário (criação/edição)
export type TaskInput = Omit<Task, 'id'>;

// client/src/types.ts
// Tipos do domínio de tarefas (espelham o modelo do backend FastAPI/Supabase).
export type Priority = 'baixa' | 'media' | 'alta';
export type Status = 'pendente' | 'em andamento' | 'concluida';

export interface Task {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  due_date: string | null; // formato YYYY-MM-DD
  priority: Priority;
  status: Status;
  created_at: string;
  updated_at: string | null;
}

// Dados informados no formulário (criação/edição)
export type TaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

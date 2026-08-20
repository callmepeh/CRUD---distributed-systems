// client/src/types.ts
// Tipos do domínio de tarefas (espelham a tabela 'tarefas' do Supabase).
export type Priority = 'Baixa' | 'Média' | 'Alta';
export type Status = 'Pendente' | 'Em andamento' | 'Concluída';

export interface Task {
  id: string;
  user_id: string;
  titulo: string;
  descricao: string | null;
  data_limite: string | null; // formato YYYY-MM-DD
  prioridade: Priority;
  status: Status;
  categoria: string;
  created_at: string;
  updated_at: string | null;
}

// Dados informados no formulário (criação/edição)
export type TaskInput = Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

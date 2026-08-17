// client/src/services/taskStore.ts
// Fonte de dados em memória (mock) usada enquanto o backend não está integrado.
// Quando a API estiver pronta, este módulo é substituído pelas chamadas em services/api.ts.
import type { Task } from '../types';

let tasks: Task[] = [
  { id: '1', title: 'Corrigir provas de Cálculo I', description: 'Lançar notas no sistema SIGAA.', due_date: '2026-08-20', priority: 'alta', status: 'em andamento' },
  { id: '2', title: 'Resumo de IHC — Heurísticas de Nielsen', description: 'Entregar resumo em PDF.', due_date: '2026-08-18', priority: 'media', status: 'pendente' },
  { id: '3', title: 'Configurar RLS no Supabase', description: 'Política auth.uid() = user_id.', due_date: '2026-08-17', priority: 'media', status: 'concluida' },
  { id: '4', title: 'Enviar relatório parcial', description: '', due_date: '2026-08-16', priority: 'alta', status: 'concluida' },
];

export const getTasks = (): Task[] => [...tasks];

export const addTask = (task: Task): void => {
  tasks = [task, ...tasks];
};

export const updateTask = (id: string, data: Partial<Task>): void => {
  tasks = tasks.map((t) => (t.id === id ? { ...t, ...data } : t));
};

export const removeTask = (id: string): void => {
  tasks = tasks.filter((t) => t.id !== id);
};

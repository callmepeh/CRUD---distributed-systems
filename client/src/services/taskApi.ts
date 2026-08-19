// client/src/services/taskApi.ts
// Camada de chamadas HTTP à API FastAPI (CRUD de tarefas).
import { api } from './api';
import type { Task, TaskInput } from '../types';

export async function fetchTasks(): Promise<Task[]> {
  const { data } = await api.get<Task[]>('/tasks');
  return data;
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data } = await api.post<Task>('/tasks', {
    titulo: input.titulo,
    descricao: input.descricao || null,
    data_limite: input.data_limite || null,
    prioridade: input.prioridade,
    status: input.status,
    categoria: input.categoria || 'Geral',
  });
  return data;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const payload: Record<string, unknown> = {};
  if (input.titulo !== undefined) payload.titulo = input.titulo;
  if (input.descricao !== undefined) payload.descricao = input.descricao || null;
  if (input.data_limite !== undefined) payload.data_limite = input.data_limite || null;
  if (input.prioridade !== undefined) payload.prioridade = input.prioridade;
  if (input.status !== undefined) payload.status = input.status;
  if (input.categoria !== undefined) payload.categoria = input.categoria || 'Geral';

  const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

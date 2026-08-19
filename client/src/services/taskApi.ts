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
    title: input.title,
    description: input.description || null,
    due_date: input.due_date || null,
    priority: input.priority,
    status: input.status,
  });
  return data;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const payload: Record<string, unknown> = {};
  if (input.title !== undefined) payload.title = input.title;
  if (input.description !== undefined) payload.description = input.description || null;
  if (input.due_date !== undefined) payload.due_date = input.due_date || null;
  if (input.priority !== undefined) payload.priority = input.priority;
  if (input.status !== undefined) payload.status = input.status;

  const { data } = await api.patch<Task>(`/tasks/${id}`, payload);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  await api.delete(`/tasks/${id}`);
}

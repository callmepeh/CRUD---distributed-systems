// client/src/pages/Tasks.tsx
// CRUD de tarefas (criar, editar, excluir, concluir) via API FastAPI + feedback visual.
import { useCallback, useEffect, useState } from 'react';
import { CalendarDays, CheckCircle2, Circle, Pencil, Plus, Trash2 } from 'lucide-react';
import type { Priority, Status, Task, TaskInput } from '../types';
import * as taskApi from '../services/taskApi';
import TaskModal from '../components/TaskModal';

const statusLabel: Record<Status, string> = {
  Pendente: 'Pendente',
  'Em andamento': 'Em andamento',
  Concluída: 'Concluída',
};

const priorityLabel: Record<Priority, string> = {
  Baixa: 'Baixa',
  'Média': 'Média',
  Alta: 'Alta',
};

const statusClass: Record<Status, string> = {
  Pendente: 'bg-slate-100 text-slate-600',
  'Em andamento': 'bg-blue-100 text-blue-700',
  Concluída: 'bg-emerald-100 text-emerald-700',
};

const priorityClass: Record<Priority, string> = {
  Baixa: 'bg-slate-100 text-slate-500',
  'Média': 'bg-amber-100 text-amber-800',
  Alta: 'bg-red-100 text-red-700',
};

const filters = [
  { key: 'todas', label: 'Todas' },
  { key: 'Pendente', label: 'Pendentes' },
  { key: 'Em andamento', label: 'Em andamento' },
  { key: 'Concluída', label: 'Concluídas' },
] as const;

type FilterKey = (typeof filters)[number]['key'];

const formatDate = (date: string | null) => {
  if (!date) return '—';
  return new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');
};

export default function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterKey>('todas');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [notice, setNotice] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showNotice = (type: 'success' | 'error', text: string) => {
    setNotice({ type, text });
    window.setTimeout(() => setNotice(null), 4000);
  };

  const loadTasks = useCallback(async () => {
    try {
      const data = await taskApi.fetchTasks();
      setTasks(data);
    } catch {
      showNotice('error', 'Erro ao carregar tarefas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const openEdit = (task: Task) => {
    setEditing(task);
    setModalOpen(true);
  };

  const handleSave = async (data: TaskInput) => {
    try {
      if (editing) {
        await taskApi.updateTask(editing.id, data);
        showNotice('success', 'Tarefa atualizada com sucesso!');
      } else {
        await taskApi.createTask(data);
        showNotice('success', 'Tarefa criada com sucesso!');
      }
      setModalOpen(false);
      setEditing(null);
      loadTasks();
    } catch {
      showNotice('error', 'Erro ao salvar tarefa. Tente novamente.');
    }
  };

  const handleDelete = async (task: Task) => {
    if (!window.confirm(`Excluir a tarefa "${task.titulo}"?`)) return;
    try {
      await taskApi.deleteTask(task.id);
      showNotice('success', 'Tarefa excluída.');
      loadTasks();
    } catch {
      showNotice('error', 'Erro ao excluir tarefa.');
    }
  };

  const toggleStatus = async (task: Task) => {
    const next: Status = task.status === 'Concluída' ? 'Pendente' : 'Concluída';
    try {
      await taskApi.updateTask(task.id, { status: next });
      showNotice('success', next === 'Concluída' ? 'Tarefa concluída! 🎉' : 'Tarefa reaberta.');
      loadTasks();
    } catch {
      showNotice('error', 'Erro ao alterar status.');
    }
  };

  const visible = filter === 'todas' ? tasks : tasks.filter((t) => t.status === filter);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Minhas Tarefas</h1>
          <p className="text-slate-500 mt-1 text-sm">Gerencie suas atividades com prioridade e prazos.</p>
        </div>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors shadow-sm"
        >
          <Plus size={18} /> Nova Tarefa
        </button>
      </div>

      {notice && (
        <div
          className={`mb-4 p-3 rounded-lg text-sm border ${
            notice.type === 'success'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-red-50 text-red-700 border-red-200'
          }`}
        >
          {notice.text}
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-6">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
              filter === f.key
                ? 'bg-slate-800 text-white'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
          <p className="text-slate-500">Carregando tarefas...</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-10 text-center">
          <p className="text-slate-500">Nenhuma tarefa por aqui.</p>
          <p className="text-sm text-slate-400 mt-1">Clique em "Nova Tarefa" para começar.</p>
        </div>
      ) : (
        <ul className="space-y-3">
          {visible.map((task) => (
            <li key={task.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 flex items-start gap-3">
              <button
                onClick={() => toggleStatus(task)}
                className={`mt-0.5 shrink-0 transition-colors ${
                  task.status === 'Concluída' ? 'text-emerald-500' : 'text-slate-300 hover:text-emerald-500'
                }`}
                aria-label={task.status === 'Concluída' ? 'Reabrir tarefa' : 'Concluir tarefa'}
              >
                {task.status === 'Concluída' ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </button>

              <div className="flex-1 min-w-0">
                <p className={`font-semibold ${task.status === 'Concluída' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {task.titulo}
                </p>
                {task.descricao && <p className="text-sm text-slate-500 truncate mt-0.5">{task.descricao}</p>}
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${statusClass[task.status]}`}>
                    {statusLabel[task.status]}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityClass[task.prioridade]}`}>
                    {priorityLabel[task.prioridade]}
                  </span>
                  {task.data_limite && (
                    <span className="flex items-center gap-1 text-xs text-slate-500">
                      <CalendarDays size={14} /> {formatDate(task.data_limite)}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => openEdit(task)}
                  aria-label="Editar tarefa"
                  className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Pencil size={18} />
                </button>
                <button
                  onClick={() => handleDelete(task)}
                  aria-label="Excluir tarefa"
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {modalOpen && <TaskModal initial={editing} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}

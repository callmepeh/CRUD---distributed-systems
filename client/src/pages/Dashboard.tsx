// client/src/pages/Dashboard.tsx
// Resumo das tarefas do usuário: cards de estatísticas e tarefas com prazo estourado.
import { useMemo } from 'react';
import { AlertTriangle, CheckCircle2, CircleDashed, ListTodo } from 'lucide-react';
import StatCard from '../components/StatCard';
import { useAuth } from '../context/AuthContext';
import { getTasks } from '../services/taskStore';

const formatDate = (date: string) => new Date(date + 'T00:00:00').toLocaleDateString('pt-BR');

export default function Dashboard() {
  const { user } = useAuth();
  const tasks = useMemo(() => getTasks(), []);

  const total = tasks.length;
  const concluidas = tasks.filter((t) => t.status === 'concluida').length;
  const emAndamento = tasks.filter((t) => t.status === 'em andamento').length;
  const pendentes = tasks.filter((t) => t.status === 'pendente').length;
  const atrasadas = tasks.filter(
    (t) => t.status !== 'concluida' && new Date(t.due_date + 'T00:00:00') < new Date()
  );
  const nome = user?.email?.split('@')[0] ?? '';

  return (
    <div className="max-w-6xl mx-auto p-4 md:p-8">
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800">Olá, {nome}! 👋</h1>
        <p className="text-slate-500 mt-1 text-sm">Aqui está o resumo das suas tarefas.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-8">
        <StatCard label="Total de Tarefas" value={total} icon={ListTodo} iconClass="bg-blue-50 text-blue-600" />
        <StatCard label="Concluídas" value={concluidas} icon={CheckCircle2} iconClass="bg-emerald-50 text-emerald-600" />
        <StatCard label="Em Andamento" value={emAndamento} icon={CircleDashed} iconClass="bg-amber-50 text-amber-600" />
        <StatCard label="Pendentes" value={pendentes} icon={AlertTriangle} iconClass="bg-red-50 text-red-600" />
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
        <h2 className="text-lg font-bold text-slate-800 mb-4">Atenção Imediata</h2>
        {atrasadas.length === 0 ? (
          <div className="p-4 bg-slate-50 rounded-lg text-center text-slate-500 text-sm">
            Nenhuma tarefa com prazo estourado. Excelente trabalho!
          </div>
        ) : (
          <ul className="space-y-2">
            {atrasadas.map((t) => (
              <li key={t.id} className="flex items-center gap-2 text-sm text-red-700">
                <AlertTriangle size={16} className="shrink-0" />
                <span className="truncate">{t.title}</span>
                <span className="text-slate-400 ml-auto shrink-0">{formatDate(t.due_date)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
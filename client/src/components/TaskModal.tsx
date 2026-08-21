// client/src/components/TaskModal.tsx
// Modal de criação/edição de tarefa com validação e mensagens de erro.
import { useState } from 'react';
import { X } from 'lucide-react';
import type { Priority, Status, Task, TaskInput } from '../types';

interface TaskModalProps {
  initial: Task | null; // null = nova tarefa
  onClose: () => void;
  onSave: (data: TaskInput) => void;
}

const inputClass =
  'w-full p-2.5 rounded-lg border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500';

const MAX_TITULO = 100;
const MAX_DESCRICAO = 500;
const MAX_CATEGORIA = 50;

function getTodayISO() {
  const d = new Date();
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
}

export default function TaskModal({ initial, onClose, onSave }: TaskModalProps) {
  const [titulo, setTitulo] = useState(initial?.titulo ?? '');
  const [descricao, setDescricao] = useState(initial?.descricao ?? '');
  const [dataLimite, setDataLimite] = useState(initial?.data_limite ?? '');
  const [prioridade, setPrioridade] = useState<Priority>(initial?.prioridade ?? 'Média');
  const [status, setStatus] = useState<Status>(initial?.status ?? 'Pendente');
  const [categoria, setCategoria] = useState(initial?.categoria ?? 'Geral');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const today = getTodayISO();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const trimmedTitulo = titulo.trim();
    const trimmedDescricao = descricao.trim();
    const trimmedCategoria = categoria.trim();

    if (!trimmedTitulo) {
      setError('Informe um título para a tarefa.');
      return;
    }
    if (trimmedTitulo.length > MAX_TITULO) {
      setError(`O título deve ter no máximo ${MAX_TITULO} caracteres.`);
      return;
    }
    if (trimmedTitulo.length < 3) {
      setError('O título deve ter pelo menos 3 caracteres.');
      return;
    }

    if (trimmedDescricao.length > MAX_DESCRICAO) {
      setError(`A descrição deve ter no máximo ${MAX_DESCRICAO} caracteres.`);
      return;
    }

    if (!dataLimite) {
      setError('Informe a data limite.');
      return;
    }
    if (dataLimite < today) {
      setError('A data limite não pode ser anterior a hoje.');
      return;
    }

    if (trimmedCategoria.length > MAX_CATEGORIA) {
      setError(`A categoria deve ter no máximo ${MAX_CATEGORIA} caracteres.`);
      return;
    }
    if (trimmedCategoria.length < 2 && trimmedCategoria.length > 0) {
      setError('A categoria deve ter pelo menos 2 caracteres.');
      return;
    }

    setSaving(true);
    onSave({
      titulo: trimmedTitulo,
      descricao: trimmedDescricao || null,
      data_limite: dataLimite || null,
      prioridade,
      status,
      categoria: trimmedCategoria || 'Geral',
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-900/40 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-lg w-full max-w-md p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-xl font-bold text-slate-800">
            {initial ? 'Editar Tarefa' : 'Nova Tarefa'}
          </h2>
          <button
            onClick={onClose}
            aria-label="Fechar"
            className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Título *</label>
            <input
              type="text"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
              placeholder="Ex.: Estudar para a prova"
              className={inputClass}
              maxLength={MAX_TITULO}
              autoFocus
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{titulo.length}/{MAX_TITULO}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Descrição</label>
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={3}
              placeholder="Detalhes da tarefa (opcional)"
              className={inputClass}
              maxLength={MAX_DESCRICAO}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{descricao.length}/{MAX_DESCRICAO}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Data limite *</label>
            <input
              type="date"
              value={dataLimite}
              onChange={(e) => setDataLimite(e.target.value)}
              className={inputClass}
              min={today}
            />
            <p className="text-xs text-slate-400 mt-1">Não é possível selecionar datas anteriores a hoje.</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Prioridade</label>
              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value as Priority)}
                className={inputClass}
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className={inputClass}
              >
                <option value="Pendente">Pendente</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluída">Concluída</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
            <input
              type="text"
              value={categoria}
              onChange={(e) => setCategoria(e.target.value)}
              placeholder="Ex.: Estudos, Trabalho"
              className={inputClass}
              maxLength={MAX_CATEGORIA}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{categoria.length}/{MAX_CATEGORIA}</p>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'Salvando...' : initial ? 'Salvar' : 'Criar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// client/src/components/Sidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import { Activity, LayoutDashboard, ListTodo, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
      isActive ? 'bg-blue-600 text-white' : 'text-slate-600 hover:bg-slate-100'
    }`;

  return (
    <aside className="bg-white border-b md:border-b-0 md:border-r border-slate-200 md:min-h-screen md:w-64 md:flex-col md:justify-between flex items-center justify-between gap-1 px-3 py-2 md:px-4 md:py-6">
      <div className="flex items-center gap-2 md:mb-6 md:w-full">
        <span className="bg-blue-100 p-2 rounded-lg text-blue-600">
          <Activity size={20} />
        </span>
        <span className="hidden md:block font-bold text-slate-800">TaskCare</span>
      </div>

      <nav className="flex md:flex-col gap-1 md:w-full">
        <NavLink to="/dashboard" className={linkClass} aria-label="Dashboard">
          <LayoutDashboard size={18} />
          <span className="hidden md:inline">Dashboard</span>
        </NavLink>
        <NavLink to="/tasks" className={linkClass} aria-label="Tarefas">
          <ListTodo size={18} />
          <span className="hidden md:inline">Tarefas</span>
        </NavLink>
      </nav>

      <div className="flex items-center md:flex-col md:w-full gap-2">
        <span className="hidden md:block text-xs text-slate-500 truncate mb-1">{user?.email}</span>
        <button
          onClick={handleLogout}
          aria-label="Sair"
          className="flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          <span className="hidden md:inline">Sair</span>
        </button>
      </div>
    </aside>
  );
}

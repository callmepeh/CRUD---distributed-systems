import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();

  // Se não tem usuário, manda pro login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Se tem usuário, renderiza a rota filha (Dashboard, Tasks, etc)
  return <Outlet />;
}
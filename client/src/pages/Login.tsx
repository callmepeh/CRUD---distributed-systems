import { useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Activity } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useAuth } from '../context/AuthContext';

// Página de login do usuário. Se já estiver logado, redireciona para o dashboard.

export default function Login() {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // Já logado? Vai direto para o dashboard.
    if (user) return <Navigate to="/dashboard" replace />;

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        const { error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            setError(error.message);
            setLoading(false);
        } else {
            navigate('/dashboard'); // Login com sucesso, vai pro dashboard
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm max-w-md w-full border border-slate-100">

                <div className="flex flex-col items-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-full text-blue-600 mb-4">
                        <Activity size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-800">Bem-vindo ao TaskCare</h1>
                </div>

                {error && (
                    <div className="mb-4 p-3 bg-red-50 text-red-600 border border-red-200 rounded-lg text-sm text-center">
                        {error}
                    </div>
                )}

                <form className="space-y-5" onSubmit={handleLogin}>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">E-mail</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Senha</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full p-3 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium p-3 rounded-lg transition-colors mt-2"
                    >
                        {loading ? 'Entrando...' : 'Entrar'}
                    </button>
                </form>

                <p className="text-center text-sm text-slate-500 mt-6">
                    Ainda não tem conta? <Link to="/register" className="text-blue-600 hover:underline">Cadastre-se</Link>
                </p>
            </div>
        </div>
    );
}

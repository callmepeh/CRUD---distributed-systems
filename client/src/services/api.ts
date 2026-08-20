// client/src/services/api.ts
import axios from 'axios';
import { supabase } from './supabase';

const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

export const api = axios.create({
  baseURL,
});

// Intercepta as requisições para injetar o token JWT
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Intercepta respostas para tratar erro 401 (token expirado)
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido — redireciona para login
      window.location.href = '/login';
    }
    return Promise.reject(error);
  },
);

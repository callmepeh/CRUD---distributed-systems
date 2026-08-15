// client/src/services/api.ts
import axios from 'axios';
import { supabase } from './supabase';

export const api = axios.create({
  baseURL: 'http://localhost:8000', // URL do backend FastAPI
});

// Intercepta as requisições para injetar o token JWT
api.interceptors.request.use(async (config) => {
  const { data: { session } } = await supabase.auth.getSession();
  
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});
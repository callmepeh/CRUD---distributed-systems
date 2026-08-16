# Placeholder: database — Conexão com Supabase Client

from functools import lru_cache
from supabase import create_client, Client
from app.config import settings

@lru_cache

def get_supabase_client() -> Client:
    # fix: chama erro se não existir settings.SUPABASE_SERVICE_ROLE_KEY
    if not settings.SUPABASE_URL or not settings.SUPABASE_SERVICE_ROLE_KEY:
        raise RuntimeError(
            "SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar "
            "configurados (server/.env) para inicializar o client Supabase."
        )
    # fix: coloca o return fora do for
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_ROLE_KEY)

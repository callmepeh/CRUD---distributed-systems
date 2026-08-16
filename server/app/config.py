# Placeholder: config — Variáveis de ambiente (SUPABASE_URL, SECRET_KEY, etc.)

import os
from dotenv import load_dotenv

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL","")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")

    FRONTEND_ORIGIN: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    def validate(self) -> None:
        missing = [
            name for name in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SECRET_KEY")
            if not getattr(self,name)
        ]
        if missing:
            raise RuntimeError(
                "Variáveis de ambiente obrigatórias não configuradas: "
                f"{', '.join(missing)}. Confira o arquivo server/.env "
                "(veja server/.env.example)."
            )

settings = Settings()

import os
from dotenv import load_dotenv

# fix: executa a função
load_dotenv()

class Settings:
    SUPABASE_URL: str = os.getenv("SUPABASE_URL","")
    SUPABASE_SERVICE_ROLE_KEY: str = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")
    SUPABASE_JWT_SECRET: str = os.getenv("SUPABASE_JWT_SECRET", "")
    SECRET_KEY: str = os.getenv("SECRET_KEY", "")

    FRONTEND_ORIGINS: list[str] = [
        o.strip()
        for o in os.getenv("FRONTEND_ORIGIN", "http://localhost:5173").split(",")
        if o.strip()
    ]

    def validate(self) -> None:
        missing = [
            name for name in ("SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY", "SUPABASE_JWT_SECRET", "SECRET_KEY")
            if not getattr(self,name)
        ]
        if missing:
            raise RuntimeError(
                "Variáveis de ambiente obrigatórias não configuradas: "
                f"{', '.join(missing)}. Confira o arquivo server/.env "
                "(veja server/.env.example)."
            )

settings = Settings()

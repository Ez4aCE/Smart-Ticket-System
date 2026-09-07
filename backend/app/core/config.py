import os


class Settings:
    database_url: str = os.environ.get("DATABASE_URL", "sqlite:///./smart_tickets.db")
    jwt_secret_key: str = os.environ.get("JWT_SECRET_KEY", "dev_secret_key_change_me")
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "60"))
    smtp_host: str = os.environ.get("SMTP_HOST", "")
    smtp_port: int = int(os.environ.get("SMTP_PORT", "587"))
    smtp_username: str = os.environ.get("SMTP_USERNAME", "")
    smtp_password: str = os.environ.get("SMTP_PASSWORD", "")
    smtp_from: str = os.environ.get("SMTP_FROM", "noreply@nexsolve.local")
    uploads_dir: str = os.environ.get("UPLOADS_DIR", "./uploads")
    max_upload_size_mb: int = 10
    ai_confidence_threshold: float = 0.75

    def __init__(self):
        self.database_url = os.environ.get("DATABASE_URL", "sqlite:///./smart_tickets.db")
        self.jwt_secret_key = os.environ.get("JWT_SECRET_KEY", "dev_secret_key_change_me")
        self.smtp_host = os.environ.get("SMTP_HOST", "")
        self.smtp_port = int(os.environ.get("SMTP_PORT", "587"))
        self.smtp_username = os.environ.get("SMTP_USERNAME", "")
        self.smtp_password = os.environ.get("SMTP_PASSWORD", "")
        self.smtp_from = os.environ.get("SMTP_FROM", "noreply@nexsolve.local")


settings = Settings()

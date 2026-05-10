"""
core/config.py — Application settings loaded from the .env file.

pydantic-settings reads environment variables automatically.
If a required variable (like OPENROUTER_API_KEY) is missing,
it crashes immediately at startup with a clear error message —
much better than crashing later when you try to use the key.
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # ── Required ──────────────────────────────────────────────────────
    openrouter_api_key: str           # must be set in .env — no default

    # ── Optional (have defaults) ───────────────────────────────────────
    model: str = "nvidia/nemotron-nano-2-vl:free"
    openrouter_base_url: str = "https://openrouter.ai/api/v1"
    max_tokens: int = 2048            # max words the AI will generate per reply
    app_title: str = "AI Chatbot"     # shown in OpenRouter dashboard stats

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"


# Single instance imported everywhere:
#   from core.config import settings
#   print(settings.model)
settings = Settings()
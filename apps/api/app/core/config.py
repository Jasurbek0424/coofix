from functools import lru_cache
from typing import Literal

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_prefix="COOFIX_", extra="ignore")

    env: Literal["dev", "test", "prod"] = "dev"
    database_url: str = "postgresql+asyncpg://coofix:coofix@localhost:5432/coofix"
    redis_url: str | None = None

    jwt_secret: str = Field(min_length=32)
    access_ttl_seconds: int = 15 * 60
    refresh_ttl_days: int = 30
    admin_refresh_ttl_hours: int = 12

    cors_origins: list[str] = []
    cookie_secure: bool = True
    trusted_proxy_count: int = 1

    currency: str = "RUB"
    default_locale: str = "ru"
    locales: list[str] = ["ru", "zh"]

    courier_fee_minor: int = 50000  # 500 ₽
    free_delivery_from_minor: int = 1000000  # 10 000 ₽
    online_payments_enabled: bool = False

    telegram_bot_token: str | None = None
    telegram_chat_id: str | None = None
    admin_url: str = "https://coofix.online"

    media_root: str = "./media"
    media_url: str = "/media"

    @property
    def is_prod(self) -> bool:
        return self.env == "prod"


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]

import uuid
from datetime import datetime, timezone

from src.identity.domain.entities import User
from src.identity.domain.repository import AbstractUserRepository
from src.identity.domain.services import verify_password, hash_password
from src.identity.infrastructure.jwt_provider import create_access_token, create_refresh_token


class AuthenticationError(Exception):
    pass


class AuthService:
    def __init__(self, user_repo: AbstractUserRepository) -> None:
        self._user_repo = user_repo

    async def login(self, email: str, password: str) -> dict:
        user = await self._user_repo.get_by_email(email)
        if not user or not verify_password(password, user.password_hash):
            raise AuthenticationError("Invalid email or password")
        if not user.is_active:
            raise AuthenticationError("Account is deactivated")

        user.last_login_at = datetime.now(timezone.utc)
        await self._user_repo.update(user)

        access_token = create_access_token(user_id=user.id, role=user.role.value)
        refresh_token = create_refresh_token(user_id=user.id)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "user": user,
        }

    async def refresh(self, user_id: str) -> dict:
        user = await self._user_repo.get_by_id(user_id)
        if not user or not user.is_active:
            raise AuthenticationError("Invalid refresh token")

        access_token = create_access_token(user_id=user.id, role=user.role.value)
        refresh_token = create_refresh_token(user_id=user.id)

        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
        }

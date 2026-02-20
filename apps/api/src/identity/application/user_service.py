import uuid
from src.identity.domain.entities import User, UserRole, Department
from src.identity.domain.repository import AbstractUserRepository
from src.identity.domain.services import hash_password


class UserAlreadyExistsError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


class UserService:
    def __init__(self, user_repo: AbstractUserRepository) -> None:
        self._user_repo = user_repo

    async def create_user(
        self,
        employee_id: str,
        email: str,
        password: str,
        first_name: str,
        last_name: str,
        role: UserRole,
        department: Department,
        position: str,
    ) -> User:
        existing = await self._user_repo.get_by_email(email)
        if existing:
            raise UserAlreadyExistsError(f"User with email {email} already exists")

        user = User(
            id=str(uuid.uuid4()),
            employee_id=employee_id,
            email=email,
            password_hash=hash_password(password),
            first_name=first_name,
            last_name=last_name,
            role=role,
            department=department,
            position=position,
        )
        return await self._user_repo.create(user)

    async def get_user(self, user_id: str) -> User:
        user = await self._user_repo.get_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User {user_id} not found")
        return user

    async def list_users(self, skip: int = 0, limit: int = 50) -> list[User]:
        return await self._user_repo.list_all(skip=skip, limit=limit)

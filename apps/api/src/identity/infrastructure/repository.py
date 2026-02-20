from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.identity.domain.entities import User, UserRole, Department
from src.identity.domain.repository import AbstractUserRepository
from src.identity.infrastructure.models import UserModel


class SqlAlchemyUserRepository(AbstractUserRepository):
    def __init__(self, session: AsyncSession) -> None:
        self._session = session

    def _to_entity(self, model: UserModel) -> User:
        return User(
            id=model.id,
            employee_id=model.employee_id,
            email=model.email,
            password_hash=model.password_hash,
            first_name=model.first_name,
            last_name=model.last_name,
            role=model.role,
            department=model.department,
            position=model.position,
            is_active=model.is_active,
            last_login_at=model.last_login_at,
            created_at=model.created_at,
            updated_at=model.updated_at,
        )

    def _to_model(self, entity: User) -> UserModel:
        return UserModel(
            id=entity.id,
            employee_id=entity.employee_id,
            email=entity.email,
            password_hash=entity.password_hash,
            first_name=entity.first_name,
            last_name=entity.last_name,
            role=entity.role,
            department=entity.department,
            position=entity.position,
            is_active=entity.is_active,
            last_login_at=entity.last_login_at,
        )

    async def get_by_id(self, user_id: str) -> User | None:
        result = await self._session.get(UserModel, user_id)
        return self._to_entity(result) if result else None

    async def get_by_email(self, email: str) -> User | None:
        stmt = select(UserModel).where(UserModel.email == email)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def get_by_employee_id(self, employee_id: str) -> User | None:
        stmt = select(UserModel).where(UserModel.employee_id == employee_id)
        result = await self._session.execute(stmt)
        model = result.scalar_one_or_none()
        return self._to_entity(model) if model else None

    async def list_all(self, skip: int = 0, limit: int = 50) -> list[User]:
        stmt = select(UserModel).offset(skip).limit(limit)
        result = await self._session.execute(stmt)
        return [self._to_entity(m) for m in result.scalars().all()]

    async def create(self, user: User) -> User:
        model = self._to_model(user)
        self._session.add(model)
        await self._session.flush()
        await self._session.refresh(model)
        return self._to_entity(model)

    async def update(self, user: User) -> User:
        model = await self._session.get(UserModel, user.id)
        if model:
            model.first_name = user.first_name
            model.last_name = user.last_name
            model.role = user.role
            model.department = user.department
            model.position = user.position
            model.is_active = user.is_active
            model.last_login_at = user.last_login_at
            await self._session.flush()
            await self._session.refresh(model)
            return self._to_entity(model)
        raise ValueError(f"User {user.id} not found")

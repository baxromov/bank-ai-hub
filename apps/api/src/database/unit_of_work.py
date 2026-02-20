from abc import ABC, abstractmethod
from types import TracebackType

from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import async_session_factory


class AbstractUnitOfWork(ABC):
    """Abstract base class for the Unit of Work pattern."""

    @abstractmethod
    async def __aenter__(self) -> "AbstractUnitOfWork":
        raise NotImplementedError

    @abstractmethod
    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        raise NotImplementedError

    @abstractmethod
    async def commit(self) -> None:
        raise NotImplementedError

    @abstractmethod
    async def rollback(self) -> None:
        raise NotImplementedError


class SqlAlchemyUnitOfWork(AbstractUnitOfWork):
    """SQLAlchemy implementation of the Unit of Work pattern.

    Usage::

        async with SqlAlchemyUnitOfWork() as uow:
            # perform repository operations using uow.session
            await uow.commit()
    """

    def __init__(self) -> None:
        self._session_factory = async_session_factory

    @property
    def session(self) -> AsyncSession:
        """Return the current database session."""
        return self._session

    async def __aenter__(self) -> "SqlAlchemyUnitOfWork":
        self._session: AsyncSession = self._session_factory()
        return self

    async def __aexit__(
        self,
        exc_type: type[BaseException] | None,
        exc_val: BaseException | None,
        exc_tb: TracebackType | None,
    ) -> None:
        if exc_type is not None:
            await self.rollback()
        await self._session.close()

    async def commit(self) -> None:
        """Commit the current transaction."""
        await self._session.commit()

    async def rollback(self) -> None:
        """Rollback the current transaction."""
        await self._session.rollback()

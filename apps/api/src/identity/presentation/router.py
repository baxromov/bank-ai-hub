from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from src.database.session import get_session
from src.identity.application.auth_service import AuthService, AuthenticationError
from src.identity.application.user_service import UserService, UserAlreadyExistsError
from src.identity.domain.entities import UserRole, Department
from src.identity.infrastructure.repository import SqlAlchemyUserRepository
from src.identity.presentation.guards import get_current_user_id, require_admin
from src.identity.presentation.schemas import (
    LoginRequest,
    LoginResponse,
    RefreshRequest,
    TokenResponse,
    UserResponse,
    CreateUserRequest,
)
from src.identity.infrastructure.jwt_provider import decode_token

router = APIRouter()


def _user_to_response(user) -> UserResponse:
    return UserResponse(
        id=user.id,
        employee_id=user.employee_id,
        email=user.email,
        first_name=user.first_name,
        last_name=user.last_name,
        full_name=user.full_name,
        role=user.role.value,
        department=user.department.value,
        position=user.position,
        is_active=user.is_active,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
    )


@router.post("/login", response_model=LoginResponse)
async def login(body: LoginRequest, session: AsyncSession = Depends(get_session)):
    repo = SqlAlchemyUserRepository(session)
    service = AuthService(repo)
    try:
        result = await service.login(body.email, body.password)
        await session.commit()
        return LoginResponse(
            access_token=result["access_token"],
            refresh_token=result["refresh_token"],
            token_type=result["token_type"],
            user=_user_to_response(result["user"]),
        )
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.post("/refresh", response_model=TokenResponse)
async def refresh(body: RefreshRequest, session: AsyncSession = Depends(get_session)):
    try:
        payload = decode_token(body.refresh_token)
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token type")
        user_id = payload["sub"]
    except ValueError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    repo = SqlAlchemyUserRepository(session)
    service = AuthService(repo)
    try:
        result = await service.refresh(user_id)
        return TokenResponse(**result)
    except AuthenticationError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=str(e))


@router.get("/me", response_model=UserResponse)
async def get_me(
    user_id: str = Depends(get_current_user_id),
    session: AsyncSession = Depends(get_session),
):
    repo = SqlAlchemyUserRepository(session)
    service = UserService(repo)
    from src.identity.application.user_service import UserNotFoundError
    try:
        user = await service.get_user(user_id)
        return _user_to_response(user)
    except UserNotFoundError:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register_user(
    body: CreateUserRequest,
    session: AsyncSession = Depends(get_session),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemyUserRepository(session)
    service = UserService(repo)
    try:
        user = await service.create_user(
            employee_id=body.employee_id,
            email=body.email,
            password=body.password,
            first_name=body.first_name,
            last_name=body.last_name,
            role=UserRole(body.role),
            department=Department(body.department),
            position=body.position,
        )
        await session.commit()
        return _user_to_response(user)
    except UserAlreadyExistsError as e:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(e))


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    skip: int = 0,
    limit: int = 50,
    session: AsyncSession = Depends(get_session),
    _: str = Depends(require_admin),
):
    repo = SqlAlchemyUserRepository(session)
    service = UserService(repo)
    users = await service.list_users(skip=skip, limit=limit)
    return [_user_to_response(u) for u in users]

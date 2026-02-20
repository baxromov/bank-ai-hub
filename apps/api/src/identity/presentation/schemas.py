from datetime import datetime
from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    email: str = Field(..., examples=["user@ipotekabank.uz"])
    password: str = Field(..., min_length=6)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"


class RefreshRequest(BaseModel):
    refresh_token: str


class UserResponse(BaseModel):
    id: str
    employee_id: str
    email: str
    first_name: str
    last_name: str
    full_name: str
    role: str
    department: str
    position: str
    is_active: bool
    last_login_at: datetime | None = None
    created_at: datetime | None = None


class CreateUserRequest(BaseModel):
    employee_id: str = Field(..., min_length=1, max_length=50)
    email: str = Field(..., examples=["user@ipotekabank.uz"])
    password: str = Field(..., min_length=6)
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    role: str = Field(default="employee")
    department: str
    position: str = Field(..., min_length=1, max_length=200)


class LoginResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: UserResponse

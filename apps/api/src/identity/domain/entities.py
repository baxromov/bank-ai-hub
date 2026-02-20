from dataclasses import dataclass
from datetime import datetime
from enum import Enum


class UserRole(str, Enum):
    EMPLOYEE = "employee"
    DEPT_HEAD = "dept_head"
    ADMIN = "admin"
    SUPER_ADMIN = "super_admin"


class Department(str, Enum):
    IT = "it"
    HR = "hr"
    RISK = "risk"
    SALES = "sales"
    OPERATIONS = "operations"
    FINANCE = "finance"
    LEGAL = "legal"
    MARKETING = "marketing"


@dataclass
class User:
    id: str
    employee_id: str
    email: str
    password_hash: str
    first_name: str
    last_name: str
    role: UserRole
    department: Department
    position: str
    is_active: bool = True
    last_login_at: datetime | None = None
    created_at: datetime | None = None
    updated_at: datetime | None = None

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

    @property
    def is_admin(self) -> bool:
        return self.role in (UserRole.ADMIN, UserRole.SUPER_ADMIN)

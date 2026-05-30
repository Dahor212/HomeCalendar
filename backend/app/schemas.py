from pydantic import BaseModel, EmailStr
from datetime import datetime
from typing import Optional


# Auth
class UserCreate(BaseModel):
    username: str
    email: EmailStr
    password: str


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    email: str
    is_active: bool

    model_config = {"from_attributes": True}


class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserOut


# Events
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    start: datetime
    end: Optional[datetime] = None
    all_day: bool = False
    color: str = "#3B82F6"
    shared: bool = True
    reminder_minutes: int = 30


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    all_day: Optional[bool] = None
    color: Optional[str] = None
    shared: Optional[bool] = None
    reminder_minutes: Optional[int] = None


class EventOut(BaseModel):
    id: int
    title: str
    description: str
    start: datetime
    end: Optional[datetime]
    all_day: bool
    color: str
    creator_id: int
    shared: bool
    reminder_minutes: int
    created_at: datetime

    model_config = {"from_attributes": True}


# Tasks
class TaskCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    due_date: Optional[datetime] = None
    priority: str = "medium"
    assigned_to: Optional[int] = None
    shared: bool = True
    reminder_minutes: int = 60


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    assigned_to: Optional[int] = None
    shared: Optional[bool] = None
    reminder_minutes: Optional[int] = None
    completed: Optional[bool] = None


class TaskOut(BaseModel):
    id: int
    title: str
    description: str
    due_date: Optional[datetime]
    completed: bool
    completed_at: Optional[datetime]
    priority: str
    creator_id: int
    assigned_to: Optional[int]
    shared: bool
    reminder_minutes: int
    created_at: datetime

    model_config = {"from_attributes": True}


# Push notifications
class PushSubscriptionCreate(BaseModel):
    endpoint: str
    p256dh_key: str
    auth_key: str


class PushSubscriptionOut(BaseModel):
    id: int
    endpoint: str

    model_config = {"from_attributes": True}

from pydantic import BaseModel
from datetime import datetime
from typing import Optional


# Categories
class CategoryCreate(BaseModel):
    name: str
    color: str = "#6366f1"
    icon: str = "📁"


class CategoryUpdate(BaseModel):
    name: Optional[str] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class CategoryOut(BaseModel):
    id: int
    name: str
    color: str
    icon: str

    model_config = {"from_attributes": True}


# Events
class EventCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    start: datetime
    end: Optional[datetime] = None
    all_day: bool = False
    color: str = "#3B82F6"
    category_id: Optional[int] = None
    shared: bool = True
    reminder_minutes: int = 30


class EventUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    start: Optional[datetime] = None
    end: Optional[datetime] = None
    all_day: Optional[bool] = None
    color: Optional[str] = None
    category_id: Optional[int] = None
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
    category_id: Optional[int]
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
    category_id: Optional[int] = None
    shared: bool = True
    reminder_minutes: int = 60


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    due_date: Optional[datetime] = None
    priority: Optional[str] = None
    category_id: Optional[int] = None
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
    category_id: Optional[int]
    creator_id: int
    shared: bool
    reminder_minutes: int
    created_at: datetime

    model_config = {"from_attributes": True}


# Shopping
class ShoppingItemCreate(BaseModel):
    name: str
    quantity: str = ""
    category_name: str = "Ostatní"
    url: str = ""


class ShoppingItemUpdate(BaseModel):
    name: Optional[str] = None
    quantity: Optional[str] = None
    category_name: Optional[str] = None
    checked: Optional[bool] = None
    sort_order: Optional[int] = None
    url: Optional[str] = None


class ShoppingItemOut(BaseModel):
    id: int
    name: str
    quantity: str
    category_name: str
    checked: bool
    sort_order: int
    url: str = ""

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

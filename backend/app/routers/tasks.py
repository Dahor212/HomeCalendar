from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


def _visible_tasks(db: Session, user: models.User):
    return db.query(models.Task).filter(
        or_(
            models.Task.creator_id == user.id,
            models.Task.assigned_to == user.id,
            models.Task.shared == True,
        )
    )


@router.get("", response_model=list[schemas.TaskOut])
def list_tasks(
    completed: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    q = _visible_tasks(db, current_user)
    if completed is not None:
        q = q.filter(models.Task.completed == completed)
    return q.order_by(models.Task.due_date.asc().nullslast(), models.Task.created_at.desc()).all()


@router.post("", response_model=schemas.TaskOut, status_code=201)
def create_task(
    task_in: schemas.TaskCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = models.Task(**task_in.model_dump(), creator_id=current_user.id)
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("/{task_id}", response_model=schemas.TaskOut)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = _visible_tasks(db, current_user).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Úkol nenalezen")
    return task


@router.put("/{task_id}", response_model=schemas.TaskOut)
def update_task(
    task_id: int,
    task_in: schemas.TaskUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.creator_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Úkol nenalezen nebo nemáte oprávnění")

    data = task_in.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(task, field, value)

    if "completed" in data and data["completed"] and not task.completed_at:
        task.completed_at = datetime.now(timezone.utc)
    elif "completed" in data and not data["completed"]:
        task.completed_at = None

    if "due_date" in data:
        task.reminder_sent = False

    db.commit()
    db.refresh(task)
    return task


@router.put("/{task_id}/toggle", response_model=schemas.TaskOut)
def toggle_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = _visible_tasks(db, current_user).filter(models.Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Úkol nenalezen")

    task.completed = not task.completed
    task.completed_at = datetime.now(timezone.utc) if task.completed else None
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    task = db.query(models.Task).filter(
        models.Task.id == task_id,
        models.Task.creator_id == current_user.id,
    ).first()
    if not task:
        raise HTTPException(status_code=404, detail="Úkol nenalezen nebo nemáte oprávnění")
    db.delete(task)
    db.commit()

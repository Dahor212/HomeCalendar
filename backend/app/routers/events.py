from datetime import datetime
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import get_default_user

router = APIRouter(prefix="/api/events", tags=["events"])


@router.get("", response_model=list[schemas.EventOut])
def list_events(
    start: Optional[datetime] = Query(None),
    end: Optional[datetime] = Query(None),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_default_user),
):
    q = db.query(models.Event)
    if start:
        q = q.filter(models.Event.start >= start)
    if end:
        q = q.filter(models.Event.start <= end)
    return q.order_by(models.Event.start).all()


@router.post("", response_model=schemas.EventOut, status_code=201)
def create_event(
    event_in: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_default_user),
):
    event = models.Event(**event_in.model_dump(), creator_id=current_user.id)
    db.add(event)
    db.commit()
    db.refresh(event)
    return event


@router.get("/{event_id}", response_model=schemas.EventOut)
def get_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Událost nenalezena")
    return event


@router.put("/{event_id}", response_model=schemas.EventOut)
def update_event(
    event_id: int,
    event_in: schemas.EventUpdate,
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Událost nenalezena")

    for field, value in event_in.model_dump(exclude_unset=True).items():
        setattr(event, field, value)

    if "start" in event_in.model_dump(exclude_unset=True):
        event.reminder_sent = False

    db.commit()
    db.refresh(event)
    return event


@router.delete("/{event_id}", status_code=204)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
):
    event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not event:
        raise HTTPException(status_code=404, detail="Událost nenalezena")
    db.delete(event)
    db.commit()

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db
from ..auth import get_current_user
from ..config import VAPID_PUBLIC_KEY

router = APIRouter(prefix="/api/push", tags=["push"])


@router.get("/vapid-public-key")
def get_vapid_public_key():
    return {"public_key": VAPID_PUBLIC_KEY}


@router.post("/subscribe", response_model=schemas.PushSubscriptionOut, status_code=201)
def subscribe(
    sub_in: schemas.PushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    existing = db.query(models.PushSubscription).filter(
        models.PushSubscription.endpoint == sub_in.endpoint
    ).first()
    if existing:
        existing.user_id = current_user.id
        existing.p256dh_key = sub_in.p256dh_key
        existing.auth_key = sub_in.auth_key
        db.commit()
        db.refresh(existing)
        return existing

    sub = models.PushSubscription(
        user_id=current_user.id,
        endpoint=sub_in.endpoint,
        p256dh_key=sub_in.p256dh_key,
        auth_key=sub_in.auth_key,
    )
    db.add(sub)
    db.commit()
    db.refresh(sub)
    return sub


@router.delete("/unsubscribe", status_code=204)
def unsubscribe(
    sub_in: schemas.PushSubscriptionCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user),
):
    db.query(models.PushSubscription).filter(
        models.PushSubscription.endpoint == sub_in.endpoint,
        models.PushSubscription.user_id == current_user.id,
    ).delete()
    db.commit()

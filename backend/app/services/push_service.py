import json
import logging
from pywebpush import webpush, WebPushException
from sqlalchemy.orm import Session
from .. import models
from ..config import get_vapid_keys, VAPID_CLAIMS

logger = logging.getLogger(__name__)


def send_push_to_user(db: Session, user_id: int, title: str, body: str, url: str = "/") -> int:
    """Send push notification to all subscriptions of a user. Returns count sent."""
    subscriptions = db.query(models.PushSubscription).filter(
        models.PushSubscription.user_id == user_id
    ).all()

    sent = 0
    to_delete = []

    for sub in subscriptions:
        payload = json.dumps({"title": title, "body": body, "url": url})
        try:
            webpush(
                subscription_info={
                    "endpoint": sub.endpoint,
                    "keys": {"p256dh": sub.p256dh_key, "auth": sub.auth_key},
                },
                data=payload,
                vapid_private_key=get_vapid_keys(db)["private_key"],
                vapid_claims=VAPID_CLAIMS,
            )
            sent += 1
        except WebPushException as e:
            logger.warning("Push failed for subscription %s: %s", sub.id, e)
            if e.response and e.response.status_code in (404, 410):
                to_delete.append(sub.id)

    for sub_id in to_delete:
        db.query(models.PushSubscription).filter(models.PushSubscription.id == sub_id).delete()
    if to_delete:
        db.commit()

    return sent


def send_push_to_all(db: Session, title: str, body: str, url: str = "/") -> int:
    """Send push notification to all users."""
    users = db.query(models.User).filter(models.User.is_active == True).all()
    total = 0
    for user in users:
        total += send_push_to_user(db, user.id, title, body, url)
    return total

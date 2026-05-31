from fastapi import Depends
from sqlalchemy.orm import Session
from .database import get_db
from . import models


def get_default_user(db: Session = Depends(get_db)) -> models.User:
    user = db.query(models.User).filter(models.User.is_active == True).first()
    if user is None:
        user = models.User(username="home", email="home@local", hashed_password="", is_active=True)
        db.add(user)
        db.commit()
        db.refresh(user)
    return user

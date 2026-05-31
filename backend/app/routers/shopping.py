from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, schemas
from ..database import get_db

router = APIRouter(prefix="/api/shopping", tags=["shopping"])


@router.get("", response_model=list[schemas.ShoppingItemOut])
def list_items(db: Session = Depends(get_db)):
    return db.query(models.ShoppingItem).order_by(
        models.ShoppingItem.category_name, models.ShoppingItem.sort_order, models.ShoppingItem.id
    ).all()


@router.post("", response_model=schemas.ShoppingItemOut, status_code=201)
def create_item(item_in: schemas.ShoppingItemCreate, db: Session = Depends(get_db)):
    item = models.ShoppingItem(**item_in.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.put("/{item_id}", response_model=schemas.ShoppingItemOut)
def update_item(item_id: int, item_in: schemas.ShoppingItemUpdate, db: Session = Depends(get_db)):
    item = db.query(models.ShoppingItem).filter(models.ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Položka nenalezena")
    for field, value in item_in.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", status_code=204)
def delete_item(item_id: int, db: Session = Depends(get_db)):
    item = db.query(models.ShoppingItem).filter(models.ShoppingItem.id == item_id).first()
    if not item:
        raise HTTPException(status_code=404, detail="Položka nenalezena")
    db.delete(item)
    db.commit()


@router.delete("", status_code=204)
def clear_checked(db: Session = Depends(get_db)):
    db.query(models.ShoppingItem).filter(models.ShoppingItem.checked == True).delete()
    db.commit()

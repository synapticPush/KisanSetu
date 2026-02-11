from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.yield_schema import YieldCreate, YieldUpdate, YieldResponse
from app.models.yield_model import Yield
from app.models.field import Field
from app.db import get_db
from app.utils.jwt import get_current_user

router = APIRouter()

@router.post("/{field_id}/yields", response_model=YieldResponse)
def create_yield(field_id: int, yield_data: YieldCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user["id"]).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    new_yield = Yield(**yield_data.dict(), field_id=field_id)
    db.add(new_yield)
    db.commit()
    db.refresh(new_yield)
    return new_yield

@router.get("/{field_id}/yields", response_model=list[YieldResponse])
def get_yields(field_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user["id"]).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    yields = db.query(Yield).filter(Yield.field_id == field_id).all()
    return yields

@router.get("/{field_id}/yields/{yield_id}", response_model=YieldResponse)
def get_yield(field_id: int, yield_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user["id"]).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    yield_record = db.query(Yield).filter(Yield.id == yield_id, Yield.field_id == field_id).first()
    if not yield_record:
        raise HTTPException(status_code=404, detail="Yield record not found")
    return yield_record

@router.put("/{field_id}/yields/{yield_id}", response_model=YieldResponse)
def update_yield(field_id: int, yield_id: int, yield_update: YieldUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user["id"]).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    yield_record = db.query(Yield).filter(Yield.id == yield_id, Yield.field_id == field_id).first()
    if not yield_record:
        raise HTTPException(status_code=404, detail="Yield record not found")
    for key, value in yield_update.dict(exclude_unset=True).items():
        setattr(yield_record, key, value)
    db.commit()
    db.refresh(yield_record)
    return yield_record

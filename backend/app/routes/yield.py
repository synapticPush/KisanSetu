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
    
    # Check if there's already a yield record for the same date and field
    existing_yield = db.query(Yield).filter(
        Yield.field_id == field_id,
        Yield.date == yield_data.date
    ).first()
    
    if existing_yield:
        # Sum up the values with existing record
        existing_yield.large = (existing_yield.large or 0) + (yield_data.large or 0)
        existing_yield.medium = (existing_yield.medium or 0) + (yield_data.medium or 0)
        existing_yield.small = (existing_yield.small or 0) + (yield_data.small or 0)
        existing_yield.overlarge = (existing_yield.overlarge or 0) + (yield_data.overlarge or 0)
        
        # Append notes if provided
        if yield_data.notes:
            if existing_yield.notes:
                existing_yield.notes = f"{existing_yield.notes}; {yield_data.notes}"
            else:
                existing_yield.notes = yield_data.notes
        
        db.commit()
        db.refresh(existing_yield)
        return existing_yield
    else:
        # Create new yield record
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

@router.delete("/{field_id}/yields/{yield_id}")
def delete_yield(field_id: int, yield_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    field = db.query(Field).filter(Field.id == field_id, Field.user_id == current_user["id"]).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    yield_record = db.query(Yield).filter(Yield.id == yield_id, Yield.field_id == field_id).first()
    if not yield_record:
        raise HTTPException(status_code=404, detail="Yield record not found")
    db.delete(yield_record)
    db.commit()
    return {"message": "Yield record deleted successfully"}

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.schemas.field import FieldCreate, FieldUpdate, FieldResponse
from app.models.field import Field
from app.db import get_db
from app.utils.jwt import get_current_user

router = APIRouter()

@router.get("/", response_model=list[FieldResponse])
def get_fields(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    fields = db.query(Field).filter(Field.user_id == current_user["id"]).all()
    return fields

@router.post("/", response_model=FieldResponse)
def create_field(field: FieldCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    new_field = Field(**field.dict(), user_id=current_user["id"])
    db.add(new_field)
    db.commit()
    db.refresh(new_field)
    return new_field

@router.get("/{id}", response_model=FieldResponse)
def get_field(id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    field = db.query(Field).filter(Field.id == id, Field.user_id == current_user["id"]).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    return field

@router.put("/{id}", response_model=FieldResponse)
def update_field(id: int, field_update: FieldUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    field = db.query(Field).filter(Field.id == id, Field.user_id == current_user["id"]).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    for key, value in field_update.dict(exclude_unset=True).items():
        setattr(field, key, value)
    db.commit()
    db.refresh(field)
    return field

@router.delete("/{id}")
def delete_field(id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    field = db.query(Field).filter(Field.id == id, Field.user_id == current_user["id"]).first()
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    db.delete(field)
    db.commit()
    return {"message": "Field deleted successfully"}

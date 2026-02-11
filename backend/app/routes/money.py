from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.money import MoneyRecordCreate, MoneyRecordUpdate, MoneyRecordResponse
from app.models.money import MoneyRecord
from app.db import get_db
from app.utils.jwt import get_current_user
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=MoneyRecordResponse)
def create_money_record(record: MoneyRecordCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Creating money record for user {current_user['id']}")
        logger.info(f"Record data: {record.dict()}")
        
        # Validate required fields
        if not record.paid_to or not record.amount or not record.payment_date or not record.payment_method:
            logger.error("Missing required fields")
            raise HTTPException(status_code=400, detail="Missing required fields: paid_to, amount, payment_date, payment_method")
        
        # Validate amount is positive
        if record.amount <= 0:
            logger.error(f"Invalid amount: {record.amount}")
            raise HTTPException(status_code=400, detail="Amount must be greater than 0")
        
        # Create the record
        new_record = MoneyRecord(**record.dict(), user_id=current_user["id"])
        db.add(new_record)
        db.commit()
        db.refresh(new_record)
        
        logger.info(f"Successfully created money record with ID: {new_record.id}")
        return new_record
        
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while creating money record")
    except Exception as e:
        logger.error(f"Unexpected error: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while creating money record: {str(e)}")

@router.get("/", response_model=list[MoneyRecordResponse])
def get_money_records(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(MoneyRecord).filter(MoneyRecord.user_id == current_user["id"]).all()

@router.get("/{id}", response_model=MoneyRecordResponse)
def get_money_record(id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    record = db.query(MoneyRecord).filter(MoneyRecord.id == id, MoneyRecord.user_id == current_user["id"]).first()
    if not record:
        raise HTTPException(status_code=404, detail="Money record not found")
    return record

@router.put("/{id}", response_model=MoneyRecordResponse)
def update_money_record(id: int, record_update: MoneyRecordUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    record = db.query(MoneyRecord).filter(MoneyRecord.id == id, MoneyRecord.user_id == current_user["id"]).first()
    if not record:
        raise HTTPException(status_code=404, detail="Money record not found")
    for key, value in record_update.dict(exclude_unset=True).items():
        setattr(record, key, value)
    db.commit()
    db.refresh(record)
    return record

@router.delete("/{id}")
def delete_money_record(id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    record = db.query(MoneyRecord).filter(MoneyRecord.id == id, MoneyRecord.user_id == current_user["id"]).first()
    if not record:
        raise HTTPException(status_code=404, detail="Money record not found")
    db.delete(record)
    db.commit()
    return {"message": "Money record deleted successfully"}

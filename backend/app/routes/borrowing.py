from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError
from app.schemas.borrowing import BorrowingCreate, BorrowingUpdate, BorrowingResponse
from app.models.borrowing import Borrowing
from app.db import get_db
from app.utils.jwt import get_current_user
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/", response_model=BorrowingResponse)
def create_borrowing(borrowing: BorrowingCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Creating borrowing for user {current_user['id']}")
        new_borrowing = Borrowing(**borrowing.dict(), user_id=current_user["id"])
        db.add(new_borrowing)
        db.commit()
        db.refresh(new_borrowing)
        logger.info(f"Successfully created borrowing with ID: {new_borrowing.id}")
        return new_borrowing
    except SQLAlchemyError as e:
        logger.error(f"Database error creating borrowing: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while creating borrowing")
    except Exception as e:
        logger.error(f"Unexpected error creating borrowing: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while creating borrowing: {str(e)}")

@router.get("/", response_model=list[BorrowingResponse])
def get_borrowings(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        borrowings = db.query(Borrowing).filter(Borrowing.user_id == current_user["id"]).all()
        return borrowings
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching borrowings: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred while fetching borrowings")

@router.get("/{id}", response_model=BorrowingResponse)
def get_borrowing(id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        borrowing = db.query(Borrowing).filter(Borrowing.id == id, Borrowing.user_id == current_user["id"]).first()
        if not borrowing:
            raise HTTPException(status_code=404, detail="Borrowing record not found")
        return borrowing
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error fetching borrowing: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred while fetching borrowing")

@router.put("/{id}", response_model=BorrowingResponse)
def update_borrowing(id: int, borrowing_update: BorrowingUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        borrowing = db.query(Borrowing).filter(Borrowing.id == id, Borrowing.user_id == current_user["id"]).first()
        if not borrowing:
            raise HTTPException(status_code=404, detail="Borrowing record not found")
        for key, value in borrowing_update.dict(exclude_unset=True).items():
            setattr(borrowing, key, value)
        db.commit()
        db.refresh(borrowing)
        return borrowing
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error updating borrowing: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while updating borrowing")

@router.delete("/{id}")
def delete_borrowing(id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        borrowing = db.query(Borrowing).filter(Borrowing.id == id, Borrowing.user_id == current_user["id"]).first()
        if not borrowing:
            raise HTTPException(status_code=404, detail="Borrowing record not found")
        db.delete(borrowing)
        db.commit()
        return {"message": "Borrowing record deleted successfully"}
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error deleting borrowing: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while deleting borrowing")

@router.put("/{id}/return")
def mark_as_returned(id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    try:
        logger.info(f"Marking borrowing {id} as returned for user {current_user['id']}")
        borrowing = db.query(Borrowing).filter(Borrowing.id == id, Borrowing.user_id == current_user["id"]).first()
        if not borrowing:
            raise HTTPException(status_code=404, detail="Borrowing record not found")
        
        borrowing.status = "returned"
        borrowing.actual_return_date = datetime.now().strftime("%Y-%m-%d")
        db.commit()
        db.refresh(borrowing)
        
        logger.info(f"Successfully marked borrowing {id} as returned")
        return borrowing
    except HTTPException:
        raise
    except SQLAlchemyError as e:
        logger.error(f"Database error marking borrowing as returned: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail="Database error occurred while updating borrowing status")
    except Exception as e:
        logger.error(f"Unexpected error marking borrowing as returned: {str(e)}")
        db.rollback()
        raise HTTPException(status_code=500, detail=f"An error occurred while updating borrowing status: {str(e)}")

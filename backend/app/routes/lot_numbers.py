from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.db import get_db
from app.models.lot_number import LotNumber
from app.schemas.lot_number import LotNumberCreate, LotNumberResponse, LotNumberAddPackets
from app.utils.jwt import get_current_user
from datetime import datetime

router = APIRouter(tags=["lot-numbers"])

@router.post("/", response_model=LotNumberResponse)
async def create_lot_number(
    lot_number: LotNumberCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new lot number entry"""
    # Check if lot number already exists for this user
    existing_lot = db.query(LotNumber).filter(
        LotNumber.lot_number == lot_number.lot_number,
        LotNumber.user_id == current_user["id"]
    ).first()
    
    if existing_lot:
        raise HTTPException(status_code=400, detail="Lot number already exists for your account")
    
    db_lot = LotNumber(
        lot_number=lot_number.lot_number,
        field_name=lot_number.field_name,
        small_packets=lot_number.small_packets,
        medium_packets=lot_number.medium_packets,
        large_packets=lot_number.large_packets,
        xlarge_packets=lot_number.xlarge_packets,
        storage_date=lot_number.storage_date or datetime.now().date(),
        notes=lot_number.notes,
        user_id=current_user["id"]
    )
    db.add(db_lot)
    db.commit()
    db.refresh(db_lot)
    return db_lot

@router.get("/", response_model=List[LotNumberResponse])
async def get_all_lot_numbers(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all lot number entries for the current user"""
    lots = db.query(LotNumber).filter(
        LotNumber.user_id == current_user["id"]
    ).order_by(LotNumber.storage_date.desc()).all()
    
    # Add total_packets to response
    response_lots = []
    for lot in lots:
        lot_dict = {
            "id": lot.id,
            "lot_number": lot.lot_number,
            "field_name": lot.field_name,
            "small_packets": lot.small_packets,
            "medium_packets": lot.medium_packets,
            "large_packets": lot.large_packets,
            "xlarge_packets": lot.xlarge_packets,
            "storage_date": lot.storage_date,
            "notes": lot.notes,
            "created_at": lot.created_at,
            "updated_at": lot.updated_at,
            "total_packets": lot.total_packets
        }
        response_lots.append(LotNumberResponse(**lot_dict))
    return response_lots

@router.get("/{lot_id}", response_model=LotNumberResponse)
async def get_lot_number(
    lot_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific lot number entry"""
    lot = db.query(LotNumber).filter(
        LotNumber.id == lot_id,
        LotNumber.user_id == current_user["id"]
    ).first()
    
    if not lot:
        raise HTTPException(status_code=404, detail="Lot number not found")
    
    lot_dict = {
        "id": lot.id,
        "lot_number": lot.lot_number,
        "field_name": lot.field_name,
        "small_packets": lot.small_packets,
        "medium_packets": lot.medium_packets,
        "large_packets": lot.large_packets,
        "xlarge_packets": lot.xlarge_packets,
        "storage_date": lot.storage_date,
        "notes": lot.notes,
        "created_at": lot.created_at,
        "updated_at": lot.updated_at,
        "total_packets": lot.total_packets
    }
    return LotNumberResponse(**lot_dict)

@router.put("/{lot_id}", response_model=LotNumberResponse)
async def update_lot_number(
    lot_id: int, 
    lot_number: LotNumberCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a lot number entry"""
    lot = db.query(LotNumber).filter(
        LotNumber.id == lot_id,
        LotNumber.user_id == current_user["id"]
    ).first()
    
    if not lot:
        raise HTTPException(status_code=404, detail="Lot number not found")
    
    # Check if new lot number conflicts with existing lot for this user
    if lot_number.lot_number != lot.lot_number:
        existing_lot = db.query(LotNumber).filter(
            LotNumber.lot_number == lot_number.lot_number,
            LotNumber.user_id == current_user["id"],
            LotNumber.id != lot_id
        ).first()
        
        if existing_lot:
            raise HTTPException(status_code=400, detail="Lot number already exists for your account")
    
    lot.lot_number = lot_number.lot_number
    lot.field_name = lot_number.field_name
    lot.small_packets = lot_number.small_packets
    lot.medium_packets = lot_number.medium_packets
    lot.large_packets = lot_number.large_packets
    lot.xlarge_packets = lot_number.xlarge_packets
    lot.storage_date = lot_number.storage_date or datetime.now().date()
    lot.notes = lot_number.notes
    lot.updated_at = datetime.now()
    
    db.commit()
    db.refresh(lot)
    
    lot_dict = {
        "id": lot.id,
        "lot_number": lot.lot_number,
        "field_name": lot.field_name,
        "small_packets": lot.small_packets,
        "medium_packets": lot.medium_packets,
        "large_packets": lot.large_packets,
        "xlarge_packets": lot.xlarge_packets,
        "storage_date": lot.storage_date,
        "notes": lot.notes,
        "created_at": lot.created_at,
        "updated_at": lot.updated_at,
        "total_packets": lot.total_packets
    }
    return LotNumberResponse(**lot_dict)

@router.post("/{lot_id}/add-packets", response_model=LotNumberResponse)
async def add_packets_to_lot(
    lot_id: int, 
    packet_data: LotNumberAddPackets, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Add additional packets to an existing lot number"""
    lot = db.query(LotNumber).filter(
        LotNumber.id == lot_id,
        LotNumber.user_id == current_user["id"]
    ).first()
    
    if not lot:
        raise HTTPException(status_code=404, detail="Lot number not found")
    
    total_additional = (packet_data.small_packets + packet_data.medium_packets + 
                       packet_data.large_packets + packet_data.xlarge_packets)
    
    if total_additional <= 0:
        raise HTTPException(status_code=400, detail="At least one packet type must have packets greater than 0")
    
    lot.small_packets += packet_data.small_packets
    lot.medium_packets += packet_data.medium_packets
    lot.large_packets += packet_data.large_packets
    lot.xlarge_packets += packet_data.xlarge_packets
    lot.updated_at = datetime.now()
    
    if packet_data.notes:
        addition_details = f"S:{packet_data.small_packets}, M:{packet_data.medium_packets}, L:{packet_data.large_packets}, XL:{packet_data.xlarge_packets}"
        if lot.notes:
            lot.notes += f"\n{datetime.now().strftime('%Y-%m-%d')}: Added {addition_details}. {packet_data.notes}"
        else:
            lot.notes = f"{datetime.now().strftime('%Y-%m-%d')}: Added {addition_details}. {packet_data.notes}"
    
    db.commit()
    db.refresh(lot)
    
    lot_dict = {
        "id": lot.id,
        "lot_number": lot.lot_number,
        "field_name": lot.field_name,
        "small_packets": lot.small_packets,
        "medium_packets": lot.medium_packets,
        "large_packets": lot.large_packets,
        "xlarge_packets": lot.xlarge_packets,
        "storage_date": lot.storage_date,
        "notes": lot.notes,
        "created_at": lot.created_at,
        "updated_at": lot.updated_at,
        "total_packets": lot.total_packets
    }
    return LotNumberResponse(**lot_dict)

@router.delete("/{lot_id}")
async def delete_lot_number(
    lot_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a lot number entry"""
    lot = db.query(LotNumber).filter(
        LotNumber.id == lot_id,
        LotNumber.user_id == current_user["id"]
    ).first()
    
    if not lot:
        raise HTTPException(status_code=404, detail="Lot number not found")
    
    db.delete(lot)
    db.commit()
    return {"message": "Lot number deleted successfully"}

@router.get("/field/{field_name}", response_model=List[LotNumberResponse])
async def get_lots_by_field(
    field_name: str, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all lot numbers for a specific field for the current user"""
    lots = db.query(LotNumber).filter(
        LotNumber.field_name == field_name,
        LotNumber.user_id == current_user["id"]
    ).order_by(LotNumber.storage_date.desc()).all()
    
    response_lots = []
    for lot in lots:
        lot_dict = {
            "id": lot.id,
            "lot_number": lot.lot_number,
            "field_name": lot.field_name,
            "small_packets": lot.small_packets,
            "medium_packets": lot.medium_packets,
            "large_packets": lot.large_packets,
            "xlarge_packets": lot.xlarge_packets,
            "storage_date": lot.storage_date,
            "notes": lot.notes,
            "created_at": lot.created_at,
            "updated_at": lot.updated_at,
            "total_packets": lot.total_packets
        }
        response_lots.append(LotNumberResponse(**lot_dict))
    return response_lots

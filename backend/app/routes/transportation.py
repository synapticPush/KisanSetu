from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, joinedload
from typing import List
from app.db import get_db
from app.models.transportation import Transportation
from app.models.field import Field
from app.models.lot_number import LotNumber
from app.schemas.transportation import TransportationCreate, TransportationResponse, TransportationUpdate
from app.utils.jwt import get_current_user
from datetime import datetime, date

router = APIRouter(tags=["transportation"])

@router.post("/", response_model=TransportationResponse)
async def create_transportation(
    transportation: TransportationCreate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Create a new transportation entry"""
    # Verify field belongs to user
    field = db.query(Field).filter(
        Field.id == transportation.field_id,
        Field.user_id == current_user["id"]
    ).first()
    
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    # Check if lot number exists for this user
    existing_lot = db.query(LotNumber).filter(
        LotNumber.lot_number == transportation.lot_number,
        LotNumber.user_id == current_user["id"]
    ).first()
    
    total_packets = (transportation.small_packets + transportation.medium_packets + 
                    transportation.large_packets + transportation.overlarge_packets)
    
    if total_packets <= 0:
        raise HTTPException(status_code=400, detail="At least one packet type must have packets greater than 0")
    
    if existing_lot:
        # Add packets to existing lot
        existing_lot.small_packets += transportation.small_packets
        existing_lot.medium_packets += transportation.medium_packets
        existing_lot.large_packets += transportation.large_packets
        existing_lot.xlarge_packets += transportation.overlarge_packets
        existing_lot.updated_at = datetime.now()
        
        # Update field name if different and not already included
        current_fields = [f.strip() for f in existing_lot.field_name.split(',')]
        if field.field_name not in current_fields:
            existing_lot.field_name = f"{existing_lot.field_name}, {field.field_name}"
        
        # Add notes about transportation
        addition_details = f"S:{transportation.small_packets}, M:{transportation.medium_packets}, L:{transportation.large_packets}, XL:{transportation.overlarge_packets}"
        if existing_lot.notes:
            existing_lot.notes += f"\n{datetime.now().strftime('%Y-%m-%d')}: Transported from {field.field_name} - {addition_details}. {transportation.notes or ''}"
        else:
            existing_lot.notes = f"{datetime.now().strftime('%Y-%m-%d')}: Transported from {field.field_name} - {addition_details}. {transportation.notes or ''}"
        
        db.commit()
        db.refresh(existing_lot)
    else:
        # Create new lot number
        new_lot = LotNumber(
            lot_number=transportation.lot_number,
            field_name=field.field_name,
            small_packets=transportation.small_packets,
            medium_packets=transportation.medium_packets,
            large_packets=transportation.large_packets,
            xlarge_packets=transportation.overlarge_packets,
            storage_date=transportation.transport_date or date.today(),
            notes=f"Created from transportation from {field.field_name}. {transportation.notes or ''}",
            user_id=current_user["id"]
        )
        db.add(new_lot)
        db.commit()
        db.refresh(new_lot)
    
    # Create transportation record
    db_transportation = Transportation(
        field_id=transportation.field_id,
        lot_number=transportation.lot_number,
        transport_date=transportation.transport_date or date.today(),
        small_packets=transportation.small_packets,
        medium_packets=transportation.medium_packets,
        large_packets=transportation.large_packets,
        overlarge_packets=transportation.overlarge_packets,
        notes=transportation.notes
    )
    db.add(db_transportation)
    db.commit()
    db.refresh(db_transportation)
    return db_transportation

@router.get("/", response_model=List[TransportationResponse])
async def get_all_transportations(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all transportation entries for the current user"""
    transportations = db.query(Transportation).options(joinedload(Transportation.field)).join(Field).filter(
        Field.user_id == current_user["id"]
    ).order_by(Transportation.transport_date.desc()).all()
    return transportations

@router.get("/field/{field_id}", response_model=List[TransportationResponse])
async def get_transportations_by_field(
    field_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get all transportation entries for a specific field"""
    # Verify field belongs to user
    field = db.query(Field).filter(
        Field.id == field_id,
        Field.user_id == current_user["id"]
    ).first()
    
    if not field:
        raise HTTPException(status_code=404, detail="Field not found")
    
    transportations = db.query(Transportation).options(joinedload(Transportation.field)).filter(
        Transportation.field_id == field_id
    ).order_by(Transportation.transport_date.desc()).all()
    return transportations

@router.get("/{transportation_id}", response_model=TransportationResponse)
async def get_transportation(
    transportation_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Get a specific transportation entry"""
    transportation = db.query(Transportation).join(Field).filter(
        Transportation.id == transportation_id,
        Field.user_id == current_user["id"]
    ).first()
    
    if not transportation:
        raise HTTPException(status_code=404, detail="Transportation record not found")
    return transportation

@router.put("/{transportation_id}", response_model=TransportationResponse)
async def update_transportation(
    transportation_id: int, 
    transportation_update: TransportationUpdate, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Update a transportation entry"""
    transportation = db.query(Transportation).join(Field).filter(
        Transportation.id == transportation_id,
        Field.user_id == current_user["id"]
    ).first()
    
    if not transportation:
        raise HTTPException(status_code=404, detail="Transportation record not found")
    
    # Get the current lot
    current_lot = db.query(LotNumber).filter(
        LotNumber.lot_number == transportation.lot_number,
        LotNumber.user_id == current_user["id"]
    ).first()
    
    # Store original values for comparison
    original_small = transportation.small_packets or 0
    original_medium = transportation.medium_packets or 0
    original_large = transportation.large_packets or 0
    original_overlarge = transportation.overlarge_packets or 0
    original_lot_number = transportation.lot_number
    
    # Handle lot number change
    new_lot_number = transportation_update.lot_number if transportation_update.lot_number is not None else transportation.lot_number
    
    if new_lot_number != original_lot_number:
        # Remove packets from old lot
        if current_lot:
            current_lot.small_packets -= original_small
            current_lot.medium_packets -= original_medium
            current_lot.large_packets -= original_large
            current_lot.xlarge_packets -= original_overlarge
            current_lot.updated_at = datetime.now()
            
            # Add note about lot change
            removal_details = f"S:{original_small}, M:{original_medium}, L:{original_large}, XL:{original_overlarge}"
            if current_lot.notes:
                current_lot.notes += f"\n{datetime.now().strftime('%Y-%m-%d')}: Moved to lot {new_lot_number} - {removal_details}"
            else:
                current_lot.notes = f"{datetime.now().strftime('%Y-%m-%d')}: Moved to lot {new_lot_number} - {removal_details}"
        
        # Find or create new lot
        new_lot = db.query(LotNumber).filter(
            LotNumber.lot_number == new_lot_number,
            LotNumber.user_id == current_user["id"]
        ).first()
        
        field = db.query(Field).filter(Field.id == transportation.field_id).first()
        
        if new_lot:
            # Add packets to existing new lot
            new_lot.small_packets += original_small
            new_lot.medium_packets += original_medium
            new_lot.large_packets += original_large
            new_lot.xlarge_packets += original_overlarge
            new_lot.updated_at = datetime.now()
            
            # Update field name if needed
            current_fields = [f.strip() for f in new_lot.field_name.split(',')]
            if field.field_name not in current_fields:
                new_lot.field_name = f"{new_lot.field_name}, {field.field_name}"
        else:
            # Create new lot
            new_lot = LotNumber(
                lot_number=new_lot_number,
                field_name=field.field_name,
                small_packets=original_small,
                medium_packets=original_medium,
                large_packets=original_large,
                xlarge_packets=original_overlarge,
                storage_date=transportation.transport_date,
                notes=f"Created from transportation update from {field.field_name}",
                user_id=current_user["id"]
            )
            db.add(new_lot)
        
        transportation.lot_number = new_lot_number
        current_lot = new_lot
    else:
        # Same lot number, just update field name if needed
        if current_lot:
            field = db.query(Field).filter(Field.id == transportation.field_id).first()
            if current_lot.field_name != field.field_name:
                current_fields = [f.strip() for f in current_lot.field_name.split(',')]
                if field.field_name not in current_fields:
                    current_lot.field_name = f"{current_lot.field_name}, {field.field_name}"
                current_lot.updated_at = datetime.now()
    
    # Update transportation fields
    update_data = transportation_update.dict(exclude_unset=True, exclude={"lot_number"})
    for field, value in update_data.items():
        setattr(transportation, field, value)
    
    # Handle packet count changes
    new_small = transportation.small_packets or 0
    new_medium = transportation.medium_packets or 0
    new_large = transportation.large_packets or 0
    new_overlarge = transportation.overlarge_packets or 0
    
    # Calculate differences
    diff_small = new_small - original_small
    diff_medium = new_medium - original_medium
    diff_large = new_large - original_large
    diff_overlarge = new_overlarge - original_overlarge
    
    # Update lot with packet count differences
    if current_lot and (diff_small != 0 or diff_medium != 0 or diff_large != 0 or diff_overlarge != 0):
        current_lot.small_packets += diff_small
        current_lot.medium_packets += diff_medium
        current_lot.large_packets += diff_large
        current_lot.xlarge_packets += diff_overlarge
        current_lot.updated_at = datetime.now()
        
        # Add note about packet count changes
        if diff_small != 0 or diff_medium != 0 or diff_large != 0 or diff_overlarge != 0:
            change_details = f"S:{diff_small:+d}, M:{diff_medium:+d}, L:{diff_large:+d}, XL:{diff_overlarge:+d}"
            if current_lot.notes:
                current_lot.notes += f"\n{datetime.now().strftime('%Y-%m-%d')}: Updated transportation - {change_details}"
            else:
                current_lot.notes = f"{datetime.now().strftime('%Y-%m-%d')}: Updated transportation - {change_details}"
    
    transportation.updated_at = datetime.now()
    db.commit()
    db.refresh(transportation)
    return transportation

@router.delete("/{transportation_id}")
async def delete_transportation(
    transportation_id: int, 
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """Delete a transportation entry"""
    transportation = db.query(Transportation).join(Field).filter(
        Transportation.id == transportation_id,
        Field.user_id == current_user["id"]
    ).first()
    
    if not transportation:
        raise HTTPException(status_code=404, detail="Transportation record not found")
    
    # Remove packets from lot number
    lot = db.query(LotNumber).filter(
        LotNumber.lot_number == transportation.lot_number,
        LotNumber.user_id == current_user["id"]
    ).first()
    
    if lot:
        lot.small_packets -= transportation.small_packets
        lot.medium_packets -= transportation.medium_packets
        lot.large_packets -= transportation.large_packets
        lot.xlarge_packets -= transportation.overlarge_packets
        lot.updated_at = datetime.now()
        
        # Add note about removal
        removal_details = f"S:{transportation.small_packets}, M:{transportation.medium_packets}, L:{transportation.large_packets}, XL:{transportation.overlarge_packets}"
        if lot.notes:
            lot.notes += f"\n{datetime.now().strftime('%Y-%m-%d')}: Removed transportation - {removal_details}"
        else:
            lot.notes = f"{datetime.now().strftime('%Y-%m-%d')}: Removed transportation - {removal_details}"
    
    db.delete(transportation)
    db.commit()
    return {"message": "Transportation record deleted successfully"}

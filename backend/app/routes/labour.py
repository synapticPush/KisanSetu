from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session, joinedload
from datetime import date
from typing import Optional
from app.schemas.labour import (
    LabourGroupCreate, LabourGroupResponse,
    LabourerCreate, LabourerResponse, LabourerUpdate,
    PaymentCreate, PaymentResponse, PaymentUpdate,
    TaskCreate, TaskResponse,
    LabourAttendanceCreate, LabourAttendanceResponse,
    LabourAttendanceBulkUpsert,
    LabourAttendanceTotalResponse,
    GroupWorkCreate, GroupWorkResponse, GroupWorkWithGroup
)
from app.models.labour import LabourGroup, Labourer, Payment, Task, LabourAttendance, GroupWork
from app.models.field import Field
from app.db import get_db
from app.utils.jwt import get_current_user

router = APIRouter()

# Labour Group Routes
@router.post("/groups", response_model=LabourGroupResponse)
def create_labour_group(group: LabourGroupCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    new_group = LabourGroup(**group.dict(), user_id=current_user["id"])
    db.add(new_group)
    db.commit()
    db.refresh(new_group)
    return new_group

@router.get("/groups", response_model=list[LabourGroupResponse])
def get_labour_groups(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return db.query(LabourGroup).options(joinedload(LabourGroup.labourers)).filter(LabourGroup.user_id == current_user["id"]).all()

@router.put("/groups/{group_id}", response_model=LabourGroupResponse)
def update_labour_group(group_id: int, group: LabourGroupCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing_group = db.query(LabourGroup).filter(
        LabourGroup.id == group_id,
        LabourGroup.user_id == current_user["id"]
    ).first()
    
    if not existing_group:
        raise HTTPException(status_code=404, detail="Labour group not found or access denied")
    
    for key, value in group.dict().items():
        setattr(existing_group, key, value)
    
    db.commit()
    db.refresh(existing_group)
    return existing_group

@router.delete("/groups/{group_id}")
def delete_labour_group(group_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing_group = db.query(LabourGroup).filter(
        LabourGroup.id == group_id,
        LabourGroup.user_id == current_user["id"]
    ).first()
    
    if not existing_group:
        raise HTTPException(status_code=404, detail="Labour group not found or access denied")

    # Delete dependents first to avoid FK constraint failures (payments/attendance/tasks/labourers)
    labourers_in_group = db.query(Labourer).filter(Labourer.group_id == group_id).all()
    labourer_ids = [l.id for l in labourers_in_group]

    if labourer_ids:
        db.query(Payment).filter(
            Payment.user_id == current_user["id"],
            Payment.labourer_id.in_(labourer_ids)
        ).delete(synchronize_session=False)

        db.query(LabourAttendance).filter(
            LabourAttendance.user_id == current_user["id"],
            LabourAttendance.labourer_id.in_(labourer_ids)
        ).delete(synchronize_session=False)

    # Delete tasks associated with this group
    db.query(Task).filter(
        Task.group_id == group_id
    ).delete(synchronize_session=False)

    db.query(Labourer).filter(
        Labourer.group_id == group_id,
        Labourer.user_id == current_user["id"]
    ).delete(synchronize_session=False)

    # Delete associated GroupWork records
    db.query(GroupWork).filter(
        GroupWork.group_id == group_id,
        GroupWork.user_id == current_user["id"]
    ).delete(synchronize_session=False)

    db.delete(existing_group)
    db.commit()
    return {"message": "Labour group deleted successfully"}

# Labourer Routes
@router.post("/labourers", response_model=LabourerResponse)
def create_labourer(labourer: LabourerCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Verify the labour group belongs to the current user
    labour_group = db.query(LabourGroup).filter(
        LabourGroup.id == labourer.group_id,
        LabourGroup.user_id == current_user["id"]
    ).first()
    
    if not labour_group:
        raise HTTPException(status_code=404, detail="Labour group not found or access denied")
    
    new_labourer = Labourer(**labourer.dict(), user_id=current_user["id"])
    db.add(new_labourer)
    db.commit()
    db.refresh(new_labourer)
    return new_labourer

@router.get("/labourers", response_model=list[LabourerResponse])
def get_labourers(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Only return labourers from the current user's labour groups
    return db.query(Labourer).options(joinedload(Labourer.group)).join(LabourGroup).filter(LabourGroup.user_id == current_user["id"]).all()

@router.put("/labourers/{labourer_id}", response_model=LabourerResponse)
def update_labourer(labourer_id: int, labourer: LabourerUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing_labourer = db.query(Labourer).join(LabourGroup).filter(
        Labourer.id == labourer_id,
        LabourGroup.user_id == current_user["id"]
    ).first()
    
    if not existing_labourer:
        raise HTTPException(status_code=404, detail="Labourer not found or access denied")
    
    # If group_id is being updated, verify the new group belongs to the current user
    if labourer.group_id is not None:
        labour_group = db.query(LabourGroup).filter(
            LabourGroup.id == labourer.group_id,
            LabourGroup.user_id == current_user["id"]
        ).first()
        
        if not labour_group:
            raise HTTPException(status_code=404, detail="Labour group not found or access denied")
    
    # Update only the fields that are provided
    for key, value in labourer.dict(exclude_unset=True).items():
        setattr(existing_labourer, key, value)
    
    db.commit()
    db.refresh(existing_labourer)
    return existing_labourer

@router.delete("/labourers/{labourer_id}")
def delete_labourer(labourer_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing_labourer = db.query(Labourer).join(LabourGroup).filter(
        Labourer.id == labourer_id,
        LabourGroup.user_id == current_user["id"]
    ).first()
    
    if not existing_labourer:
        raise HTTPException(status_code=404, detail="Labourer not found or access denied")

    # Delete dependents first to avoid FK constraint failures
    db.query(Payment).filter(
        Payment.user_id == current_user["id"],
        Payment.labourer_id == labourer_id
    ).delete(synchronize_session=False)

    db.query(LabourAttendance).filter(
        LabourAttendance.user_id == current_user["id"],
        LabourAttendance.labourer_id == labourer_id
    ).delete(synchronize_session=False)

    db.delete(existing_labourer)
    db.commit()
    return {"message": "Labourer deleted successfully"}

@router.get("/labourers/{group_id}", response_model=list[LabourerResponse])
def get_labourers_by_group(group_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Verify the labour group belongs to the current user
    labour_group = db.query(LabourGroup).filter(
        LabourGroup.id == group_id,
        LabourGroup.user_id == current_user["id"]
    ).first()
    
    if not labour_group:
        raise HTTPException(status_code=404, detail="Labour group not found or access denied")
    
    return db.query(Labourer).options(joinedload(Labourer.group)).filter(Labourer.group_id == group_id).all()

# Payment Routes
@router.post("/payments", response_model=PaymentResponse)
def create_payment(payment: PaymentCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Verify the labourer belongs to the current user
    labourer = db.query(Labourer).join(LabourGroup).filter(
        Labourer.id == payment.labourer_id,
        LabourGroup.user_id == current_user["id"]
    ).first()
    
    if not labourer:
        raise HTTPException(status_code=404, detail="Labourer not found or access denied")
    
    new_payment = Payment(**payment.dict(), user_id=current_user["id"])
    db.add(new_payment)
    db.commit()
    db.refresh(new_payment)
    return new_payment

@router.get("/payments", response_model=list[PaymentResponse])
def get_payments(db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Only return payments that belong to an existing labourer owned by the user.
    # Also exclude any payment created before the labourer itself was created.
    # This prevents "ghost" payment logs showing up for newly created labourers
    # in cases where SQLite reuses deleted row IDs.
    return (
        db.query(Payment)
        .join(Labourer, Payment.labourer_id == Labourer.id)
        .join(LabourGroup, Labourer.group_id == LabourGroup.id)
        .filter(
            Payment.user_id == current_user["id"],
            LabourGroup.user_id == current_user["id"],
            Payment.created_at >= Labourer.created_at,
        )
        .options(joinedload(Payment.labourer))
        .order_by(Payment.payment_date.desc(), Payment.id.desc())
        .all()
    )

@router.put("/payments/{payment_id}", response_model=PaymentResponse)
def update_payment(payment_id: int, payment: PaymentUpdate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing_payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user["id"]
    ).first()
    
    if not existing_payment:
        raise HTTPException(status_code=404, detail="Payment not found or access denied")
    
    # If labourer_id is being updated, verify the new labourer belongs to the current user
    if payment.labourer_id is not None:
        labourer = db.query(Labourer).join(LabourGroup).filter(
            Labourer.id == payment.labourer_id,
            LabourGroup.user_id == current_user["id"]
        ).first()
        
        if not labourer:
            raise HTTPException(status_code=404, detail="Labourer not found or access denied")
    
    # Update only the fields that are provided
    for key, value in payment.dict(exclude_unset=True).items():
        setattr(existing_payment, key, value)
    
    db.commit()
    db.refresh(existing_payment)
    return existing_payment

@router.delete("/payments/{payment_id}")
def delete_payment(payment_id: int, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    existing_payment = db.query(Payment).filter(
        Payment.id == payment_id,
        Payment.user_id == current_user["id"]
    ).first()
    
    if not existing_payment:
        raise HTTPException(status_code=404, detail="Payment not found or access denied")
    
    db.delete(existing_payment)
    db.commit()
    return {"message": "Payment deleted successfully"}

# Attendance Routes
@router.get("/attendance", response_model=list[LabourAttendanceResponse])
def get_attendance(
    attendance_date: date = Query(...),
    group_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(LabourAttendance).join(Labourer).join(LabourGroup).filter(
        LabourAttendance.user_id == current_user["id"],
        LabourAttendance.attendance_date == attendance_date,
        LabourGroup.user_id == current_user["id"]
    )

    if group_id is not None:
        query = query.filter(Labourer.group_id == group_id)

    return query.all()


@router.get("/attendance/history", response_model=list[LabourAttendanceResponse])
def get_attendance_history(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    group_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(LabourAttendance).join(Labourer).join(LabourGroup).filter(
        LabourAttendance.user_id == current_user["id"],
        LabourGroup.user_id == current_user["id"],
    )

    if group_id is not None:
        query = query.filter(Labourer.group_id == group_id)

    if start_date is not None:
        query = query.filter(LabourAttendance.attendance_date >= start_date)

    if end_date is not None:
        query = query.filter(LabourAttendance.attendance_date <= end_date)

    return query.options(joinedload(LabourAttendance.labourer)).order_by(LabourAttendance.attendance_date.asc(), LabourAttendance.labourer_id.asc()).all()


@router.post("/attendance", response_model=LabourAttendanceResponse)
def upsert_attendance(
    attendance: LabourAttendanceCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    if attendance.status not in {"full", "half", "absent"}:
        raise HTTPException(status_code=400, detail="Invalid attendance status")

    labourer = db.query(Labourer).join(LabourGroup).filter(
        Labourer.id == attendance.labourer_id,
        LabourGroup.user_id == current_user["id"]
    ).first()
    if not labourer:
        raise HTTPException(status_code=404, detail="Labourer not found or access denied")

    existing = db.query(LabourAttendance).filter(
        LabourAttendance.user_id == current_user["id"],
        LabourAttendance.labourer_id == attendance.labourer_id,
        LabourAttendance.attendance_date == attendance.attendance_date,
    ).first()

    if existing:
        existing.status = attendance.status
        db.commit()
        db.refresh(existing)
        return existing

    new_record = LabourAttendance(
        labourer_id=attendance.labourer_id,
        attendance_date=attendance.attendance_date,
        status=attendance.status,
        user_id=current_user["id"],
    )
    db.add(new_record)
    db.commit()
    db.refresh(new_record)
    return new_record


@router.post("/attendance/bulk", response_model=list[LabourAttendanceResponse])
def bulk_upsert_attendance(
    payload: LabourAttendanceBulkUpsert,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    attendance_date = payload.attendance_date
    records = payload.records
    results: list[LabourAttendance] = []

    for record in records:
        if record.status not in {"full", "half", "absent"}:
            raise HTTPException(status_code=400, detail="Invalid attendance status")

        labourer = db.query(Labourer).join(LabourGroup).filter(
            Labourer.id == record.labourer_id,
            LabourGroup.user_id == current_user["id"]
        ).first()
        if not labourer:
            raise HTTPException(status_code=404, detail="Labourer not found or access denied")

        existing = db.query(LabourAttendance).filter(
            LabourAttendance.user_id == current_user["id"],
            LabourAttendance.labourer_id == record.labourer_id,
            LabourAttendance.attendance_date == attendance_date,
        ).first()

        if existing:
            existing.status = record.status
            results.append(existing)
        else:
            new_record = LabourAttendance(
                labourer_id=record.labourer_id,
                attendance_date=attendance_date,
                status=record.status,
                user_id=current_user["id"],
            )
            db.add(new_record)
            results.append(new_record)

    db.commit()
    for r in results:
        db.refresh(r)
    return results


@router.get("/attendance/totals", response_model=list[LabourAttendanceTotalResponse])
def get_attendance_totals(
    group_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(LabourAttendance).join(Labourer).join(LabourGroup).filter(
        LabourAttendance.user_id == current_user["id"],
        LabourGroup.user_id == current_user["id"],
    )

    if group_id is not None:
        query = query.filter(Labourer.group_id == group_id)

    totals: dict[int, float] = {}
    for rec in query.all():
        credit = 1.0 if rec.status == "full" else 0.5 if rec.status == "half" else 0.0
        totals[rec.labourer_id] = totals.get(rec.labourer_id, 0.0) + credit

    return [LabourAttendanceTotalResponse(labourer_id=k, total_days=v) for k, v in totals.items()]



# Group Work Routes
@router.post("/group-work", response_model=GroupWorkResponse)
def create_group_work(work: GroupWorkCreate, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Verify group belongs to user
    group = db.query(LabourGroup).filter(
        LabourGroup.id == work.group_id,
        LabourGroup.user_id == current_user["id"]
    ).first()
    
    if not group:
        raise HTTPException(status_code=404, detail="Labour group not found or access denied")
    
    # Check if record exists for this group and date
    existing_work = db.query(GroupWork).filter(
        GroupWork.group_id == work.group_id,
        GroupWork.work_date == work.work_date,
        GroupWork.user_id == current_user["id"]
    ).first()

    if existing_work:
        # Update existing record
        for key, value in work.dict().items():
            setattr(existing_work, key, value)
        db.commit()
        db.refresh(existing_work)
        return existing_work
    
    # Create new record
    new_work = GroupWork(**work.dict(), user_id=current_user["id"])
    db.add(new_work)
    db.commit()
    db.refresh(new_work)
    return new_work

@router.get("/group-work", response_model=list[GroupWorkWithGroup])
def get_group_work_history(
    start_date: Optional[date] = Query(None),
    end_date: Optional[date] = Query(None),
    group_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    query = db.query(GroupWork).join(LabourGroup).filter(
        GroupWork.user_id == current_user["id"],
        LabourGroup.user_id == current_user["id"]
    )

    if group_id:
        query = query.filter(GroupWork.group_id == group_id)
    
    if start_date:
        query = query.filter(GroupWork.work_date >= start_date)
    
    if end_date:
        query = query.filter(GroupWork.work_date <= end_date)
    
    return query.options(joinedload(GroupWork.group)).order_by(GroupWork.work_date.desc(), GroupWork.group_id).all()

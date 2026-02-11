import csv
from io import StringIO, BytesIO
from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session
from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from app.models.field import Field
from app.models.yield_model import Yield
from app.models.labour import Labourer
from app.models.money import MoneyRecord
from app.db import get_db
from app.utils.jwt import get_current_user

router = APIRouter()

@router.get("/csv/{entity}")
def export_csv(entity: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    output = StringIO()
    writer = csv.writer(output)

    if entity == "fields":
        fields = db.query(Field).filter(Field.user_id == current_user["id"]).all()
        writer.writerow(["ID", "Field Name", "Location", "Area", "Potato Type", "Season", "Year"])
        for field in fields:
            writer.writerow([field.id, field.field_name, field.location, field.area, field.potato_type, field.season, field.year])
    elif entity == "yields":
        yields = db.query(Yield).join(Field).filter(Field.user_id == current_user["id"]).all()
        writer.writerow(["ID", "Field ID", "Date", "Category", "Quantity", "Notes"])
        for yield_record in yields:
            writer.writerow([yield_record.id, yield_record.field_id, yield_record.date, yield_record.category, yield_record.quantity, yield_record.notes])
    elif entity == "labourers":
        labourers = db.query(Labourer).all()
        writer.writerow(["ID", "Name", "Phone", "Skill Type", "Daily Wage", "Group ID"])
        for labourer in labourers:
            writer.writerow([labourer.id, labourer.name, labourer.phone, labourer.skill_type, labourer.daily_wage, labourer.group_id])
    elif entity == "money":
        money_records = db.query(MoneyRecord).all()
        writer.writerow(["ID", "Paid To", "Amount", "Payment Date", "Payment Method", "Related Task", "Notes"])
        for record in money_records:
            writer.writerow([record.id, record.paid_to, record.amount, record.payment_date, record.payment_method, record.related_task, record.notes])
    else:
        raise HTTPException(status_code=400, detail="Invalid entity type")

    response = Response(content=output.getvalue(), media_type="text/csv")
    response.headers["Content-Disposition"] = f"attachment; filename={entity}.csv"
    return response

@router.get("/pdf/{entity}")
def export_pdf(entity: str, db: Session = Depends(get_db), current_user: dict = Depends(get_current_user)):
    buffer = BytesIO()
    pdf = canvas.Canvas(buffer, pagesize=letter)
    pdf.setFont("Helvetica", 12)
    y = 750  # Start position for writing content

    if entity == "fields":
        fields = db.query(Field).filter(Field.user_id == current_user["id"]).all()
        pdf.drawString(50, y, "Fields Report")
        y -= 20
        pdf.drawString(50, y, "ID | Field Name | Location | Area | Potato Type | Season | Year")
        y -= 20
        for field in fields:
            pdf.drawString(50, y, f"{field.id} | {field.field_name} | {field.location} | {field.area} | {field.potato_type} | {field.season} | {field.year}")
            y -= 20
            if y < 50:  # Add a new page if content exceeds the current page
                pdf.showPage()
                y = 750
    elif entity == "yields":
        yields = db.query(Yield).join(Field).filter(Field.user_id == current_user["id"]).all()
        pdf.drawString(50, y, "Yields Report")
        y -= 20
        pdf.drawString(50, y, "ID | Field ID | Date | Category | Quantity | Notes")
        y -= 20
        for yield_record in yields:
            pdf.drawString(50, y, f"{yield_record.id} | {yield_record.field_id} | {yield_record.date} | {yield_record.category} | {yield_record.quantity} | {yield_record.notes}")
            y -= 20
            if y < 50:
                pdf.showPage()
                y = 750
    elif entity == "labourers":
        labourers = db.query(Labourer).all()
        pdf.drawString(50, y, "Labourers Report")
        y -= 20
        pdf.drawString(50, y, "ID | Name | Phone | Skill Type | Daily Wage | Group ID")
        y -= 20
        for labourer in labourers:
            pdf.drawString(50, y, f"{labourer.id} | {labourer.name} | {labourer.phone} | {labourer.skill_type} | {labourer.daily_wage} | {labourer.group_id}")
            y -= 20
            if y < 50:
                pdf.showPage()
                y = 750
    elif entity == "money":
        money_records = db.query(MoneyRecord).all()
        pdf.drawString(50, y, "Money Records Report")
        y -= 20
        pdf.drawString(50, y, "ID | Paid To | Amount | Payment Date | Payment Method | Related Task | Notes")
        y -= 20
        for record in money_records:
            pdf.drawString(50, y, f"{record.id} | {record.paid_to} | {record.amount} | {record.payment_date} | {record.payment_method} | {record.related_task} | {record.notes}")
            y -= 20
            if y < 50:
                pdf.showPage()
                y = 750
    else:
        raise HTTPException(status_code=400, detail="Invalid entity type")

    pdf.save()
    buffer.seek(0)
    return Response(content=buffer.getvalue(), media_type="application/pdf", headers={"Content-Disposition": f"attachment; filename={entity}.pdf"})

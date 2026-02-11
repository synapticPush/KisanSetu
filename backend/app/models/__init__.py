# Import all models to make them available via app.models
from app.models.user import User
from app.models.field import Field
from app.models.yield_model import Yield
from app.models.labour import LabourGroup, Labourer, Payment, Task, LabourAttendance, GroupWork
from app.models.money import MoneyRecord
from app.models.borrowing import Borrowing
from app.models.lot_number import LotNumber
from app.models.transportation import Transportation

# Make models available when importing from app.models
__all__ = [
    'User',
    'Field',
    'Yield',
    'LabourGroup',
    'Labourer',
    'Payment',
    'Task',
    'LabourAttendance',
    'GroupWork',
    'MoneyRecord',
    'Borrowing',
    'LotNumber',
    'Transportation'
]

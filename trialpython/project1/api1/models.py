# models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.contrib.auth.models import AbstractUser

# --- ACCOUNTS ---

USER_LEVEL_CHOICES = [
    ('employee', 'Employee'),
    ('head', 'Head'),
    ('admin', 'Admin'),
    ('director', 'Director')
]

EMPLOYEE_TYPE_CHOICES = [
    ('csc', 'CSC'),
    ('po', 'PO'),
    ('tmsd', 'TMSD'),
    ('afsd', 'AFSD'),
    ('regional', 'Regional')
]

class CustomUser(AbstractUser):
    user_level = models.CharField(max_length=20, choices=USER_LEVEL_CHOICES)
    employee_type = models.CharField(max_length=20, choices=EMPLOYEE_TYPE_CHOICES, blank=True, null=True)

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
# --- TRAVEL ORDER ---

class TravelOrder(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    employees = models.ManyToManyField(CustomUser, related_name='travel_orders')

    destination = models.CharField(max_length=255)
    purpose = models.TextField()
    departure_date = models.DateField()
    return_date = models.DateField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    approval_stage = models.IntegerField(default=0)
    current_approver = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.SET_NULL, related_name='approving_orders')


    rejection_comment = models.TextField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejected_by = models.ForeignKey(
        CustomUser,
        null=True,
        blank=True,
        on_delete=models.SET_NULL,
        related_name='rejected_orders'
    )
    is_resubmitted = models.BooleanField(default=False)

    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TravelOrder to {self.destination} by {', '.join([e.full_name for e in self.employees.all()])}"

class Signature(models.Model):
    order = models.ForeignKey(TravelOrder, on_delete=models.CASCADE)
    signed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    signature_data = models.TextField()  # Base64
    signed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Signed by {self.signed_by.username} for order {self.order.id}"
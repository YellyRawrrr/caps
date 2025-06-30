# models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator
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
    
# --- FUND ---
class Fund(models.Model):
    source_of_fund = models.CharField(max_length=50)
    
    def __str__(self):
        return self.source_of_fund

# --- TRAVEL ORDER ---

class TravelOrder(models.Model):
    STATUS_CHOICES = [
        ('Pending', 'Pending'),
        ('Approved', 'Approved'),
        ('Rejected', 'Rejected'),
    ]

    MODE_OF_FILING = [
        ('IMMEDIATE','IMMEDIATE'),
        ('NOT_IMMEDIATE','NOT_IMMEDIATE')
    ]

    FUND_CLUSTER = [
        ('01_RF',')01_RF'),
        ('07_TF','07_TF')
    ]

    employees = models.ManyToManyField(CustomUser, related_name='travel_orders')
    #new
    mode_of_filing = models.CharField(max_length=20, choices=MODE_OF_FILING, blank=True)
    evidence = models.ImageField(null=True, blank=True, upload_to='evidence/')
    date_of_filing = models.DateField(auto_now_add=True)
    
    fund_cluster = models.CharField(max_length=10, choices=FUND_CLUSTER, blank=True)
    number_of_employees = models.IntegerField(default=0)
    
    destination = models.CharField(max_length=255)
    purpose = models.TextField()
    fund = models.ForeignKey(Fund, on_delete=models.SET_NULL, null=True, blank=True)
    date_travel_from = models.DateField()
    date_travel_to = models.DateField()

    #validation
    prepared_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='prepared_travel_order')

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='Pending')
    approval_stage = models.IntegerField(default=0)
    current_approver = models.ForeignKey(CustomUser, null=True, blank=True, on_delete=models.SET_NULL, related_name='approving_orders')


    rejection_comment = models.TextField(null=True, blank=True)
    rejected_at = models.DateTimeField(null=True, blank=True)
    rejected_by = models.ForeignKey(CustomUser,null=True, blank=True, on_delete=models.SET_NULL, related_name='rejected_orders')
    is_resubmitted = models.BooleanField(default=False)

    submitted_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"TravelOrder to {self.destination} by {', '.join([e.full_name for e in self.employees.all()])}"
    
class Transportation(models.Model):
    means_of_transportation = models.CharField(max_length=50)

    def __str__(self):
        return self.means_of_transportation

class Itinerary(models.Model):
    travel_order = models.ForeignKey(TravelOrder, related_name='itinerary', on_delete=models.CASCADE)
    transportation = models.ForeignKey(Transportation, on_delete=models.SET_NULL, null=True, blank=True)
    itinerary_date = models.DateField()
    departure_time = models.TimeField()
    arrival_time = models.TimeField()
    transportation_allowance = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    per_diem = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    other_expense = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])
    total_amount = models.DecimalField(max_digits=10, decimal_places=2, validators=[MinValueValidator(0)])


    

class Signature(models.Model):
    order = models.ForeignKey(TravelOrder, on_delete=models.CASCADE)
    signed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    signature_data = models.TextField()  # Base64
    signed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Signed by {self.signed_by.username} for order {self.order.id}"
    

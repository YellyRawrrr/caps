# models.py
from django.db import models
from django.conf import settings
from django.utils import timezone
from django.core.validators import MinValueValidator
from django.core.validators import FileExtensionValidator
from django.contrib.auth.models import AbstractUser

class EmployeePosition(models.Model):
    position_name = models.CharField(max_length=100)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return self.position_name

# --- ACCOUNTS ---
USER_LEVEL_CHOICES = [
    ('employee', 'Employee'),
    ('head', 'Head'),
    ('admin', 'Admin'),
    ('director', 'Director'),
    ('bookkeeper', 'bookkeeper'),
    ('accountant', 'accountant'),
]

EMPLOYEE_TYPE_CHOICES = [
    ('urdaneta_csc', 'Urdaneta CSC'),
    ('sison_csc', 'Sison CSC'),
    ('pugo_csc', 'Pugo CSC'),
    ('sudipen_csc', 'Sudipen CSC'),
    ('tagudin_csc', 'Tagudin CSC'),
    ('banayoyo_csc', 'Banayoyo CSC'),
    ('dingras_csc', 'Dingras CSC'),
    ('pangasinan_po', 'Pangasinan PO'),
    ('ilocossur_po', 'Ilocos Sur PO'),
    ('ilocosnorte_po', 'Ilocos Norte PO'),
    ('launion_po', 'La Union PO'),
    ('tmsd', 'TMSD'),
    ('afsd', 'AFSD'),
    ('regional', 'Regional')
]

TYPE_OF_USER = [
    ('Community Service Center Employee', 'Community service Center Employee'),
    ('Provincial Office Employee', 'Provincial Office Employee'),
    ('Regional Office-TMSD Employee','Regional Office-TMSD Employee'),
    ('Regional Office-AFSD Employee', 'Regional Office-AFSD Employee'),
    ('Regional Office-LU Employee', 'Regional Office-LU Employee'),
    ('CSC Head','CSC Head'),
    ('PO Head','PO Head'),
    ('TMSD Chief','TMSD Chief'),
    ('AFSD Chief','AFSD Chief'),
]

class CustomUser(AbstractUser):
    user_level = models.CharField(max_length=20, choices=USER_LEVEL_CHOICES)
    employee_type = models.CharField(max_length=30, choices=EMPLOYEE_TYPE_CHOICES, blank=True, null=True)
    employee_position = models.ForeignKey(EmployeePosition, on_delete=models.SET_NULL, null=True, blank=True, related_name='users')
    type_of_user = models.CharField(max_length=100, choices=TYPE_OF_USER, blank=True, null=True)
    

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}"
    
# --- FUND ---
class Fund(models.Model):
    source_of_fund = models.CharField(max_length=50)
    is_archived = models.BooleanField(default=False)

    def __str__(self):
        return self.source_of_fund


# --- TRAVEL ORDER ---
class TravelOrder(models.Model):
    STATUS_CHOICES = [
        ('Travel order is placed', 'Travel order is placed'),
        ('The travel order has been approved by the CSC head', 'The travel order has been approved by the CSC head'),
        ('The travel order has been rejected by the CSC head.', 'The travel order has been rejected by the CSC head'),
        ('The travel order has been approved by the PO head', 'The travel order has been approved by the PO head'),
        ('The travel order has been rejected by the PO head', 'The travel order has been rejected by the PO head'),
        ('The travel order has been approved by the TMSD chief', 'The travel order has been approved by the TMSD chief'),
        ('The travel order has been rejected by the TMSD chief', 'The travel order has been rejected by the TMSD chief'),
        ('The travel order has been approved by the AFSD chief', 'The travel order has been approved by the AFSD chief'),
        ('The travel order has been rejected by the AFSD Chief', 'The travel order has been rejected by the AFSD Chief'),
        ('The travel order has been approved by the Regional Director', 'The travel order has been approved by the Regional Director'),
        ('The travel order has been rejected by the Regional Director', 'The travel order has been rejected by the Regional Director'),
    ]

    MODE_OF_FILING = [
        ('IMMEDIATE','IMMEDIATE'),
        ('NOT_IMMEDIATE','NOT_IMMEDIATE')
    ]

    FUND_CLUSTER = [
        ('01_RF','01_RF'),
        ('07_TF','07_TF')
    ]



    employees = models.ManyToManyField(CustomUser, related_name='travel_orders')
    travel_order_number = models.CharField(max_length=50, blank=True, null=True, unique=True)
    #new
    mode_of_filing = models.CharField(max_length=20, choices=MODE_OF_FILING, blank=True)
    evidence = models.FileField(null=True, blank=True, upload_to='evidence/',  validators=[FileExtensionValidator(allowed_extensions=['jpg', 'jpeg', 'png', 'pdf'])])
    date_of_filing = models.DateField(auto_now_add=True)
    
    fund_cluster = models.CharField(max_length=10, choices=FUND_CLUSTER, blank=True)
    number_of_employees = models.IntegerField(default=0)
    
    destination = models.CharField(max_length=255)
    purpose = models.TextField()
    specific_role = models.TextField(blank=True, null=True)
    fund = models.ForeignKey(Fund, on_delete=models.SET_NULL, null=True, blank=True)
    date_travel_from = models.DateField()
    date_travel_to = models.DateField()

    #validation
    prepared_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='prepared_travel_order')
    employee_position = models.ForeignKey(EmployeePosition, on_delete=models.SET_NULL, null=True, blank=True, related_name='travel_orders')
    
    status = models.CharField(max_length=100, choices=STATUS_CHOICES, default='Travel order is placed')
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
    is_archived = models.BooleanField(default=False)

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

class EmployeeSignature(models.Model):
    order = models.OneToOneField(TravelOrder, on_delete=models.CASCADE, related_name='employee_signature')
    signed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    signature_data = models.TextField()  # Base64
    signed_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Employee Signature by {self.signed_by.username} for order {self.order.id}"
    
# -- Head Signature --
class Signature(models.Model):
    order = models.ForeignKey(TravelOrder, on_delete=models.CASCADE)
    signed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    signature_data = models.TextField()  # Base64
    signed_at = models.DateTimeField(auto_now_add=True)
    comment = models.TextField(null=True, blank=True)  

    def __str__(self):
        return f"Signed by {self.signed_by.username} for order {self.order.id}"
    

    

#---- Liquidation ------
class Liquidation(models.Model):
    LIQUIDATION_STATUSES = [
    ('Pending', 'Pending'),
    ('Under Pre-Audit', 'Under Pre-Audit'),
    ('Under Final Audit', 'Under Final Audit'),
    ('Ready for Claim', 'Ready for Claim'),
    ('Rejected', 'Rejected'),
]
    status = models.CharField(max_length=50, choices=LIQUIDATION_STATUSES, default='Pending')


    travel_order = models.OneToOneField('TravelOrder', on_delete=models.CASCADE, related_name='liquidation')
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='uploaded_liquidations')
    certificate_of_travel = models.FileField(upload_to='liquidations/certificate_of_travel/')
    certificate_of_appearance = models.FileField(upload_to='liquidations/certificate_of_appearance/')
    after_travel_report = models.FileField(upload_to='liquidations/after_travel_report/')
    submitted_at = models.DateTimeField(auto_now_add=True)
    resubmitted_at = models.DateTimeField(null=True, blank=True)

    reviewed_by_bookkeeper = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookkeeper_reviews')
    reviewed_at_bookkeeper = models.DateTimeField(null=True, blank=True)
    bookkeeper_comment = models.TextField(blank=True)

    reviewed_by_accountant = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True, related_name='accountant_reviews')
    reviewed_at_accountant = models.DateTimeField(null=True, blank=True)
    accountant_comment = models.TextField(blank=True)

    is_bookkeeper_approved = models.BooleanField(null=True)
    is_accountant_approved = models.BooleanField(null=True)

    status = models.CharField(max_length=50, default='Pending')

    def update_status(self):
        if self.is_bookkeeper_approved is True and self.is_accountant_approved is True:
            self.status = 'Ready for Claim'
        elif self.is_bookkeeper_approved is False or self.is_accountant_approved is False:
            self.status = 'Rejected'
        elif self.is_bookkeeper_approved is True and self.is_accountant_approved is None:
            self.status = 'Under Final Audit'
        elif self.is_bookkeeper_approved is None:
            self.status = 'Under Pre-Audit'
        else:
            self.status = 'Pending'
        self.save()

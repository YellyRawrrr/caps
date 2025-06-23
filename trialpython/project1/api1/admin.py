from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import CustomUser, TravelOrder, Signature

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'user_level', 'employee_type', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('User Info', {'fields': ('user_level', 'employee_type')}),
    )

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(TravelOrder)
admin.site.register(Signature)

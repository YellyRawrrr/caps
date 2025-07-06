from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.utils.html import mark_safe
from .models import CustomUser, TravelOrder, Signature, Fund, Transportation

class CustomUserAdmin(UserAdmin):
    model = CustomUser
    list_display = ['username', 'email', 'user_level', 'employee_type', 'employee_position', 'is_staff', 'is_active']
    fieldsets = UserAdmin.fieldsets + (
        ('User Info', {'fields': ('user_level', 'employee_type', 'employee_position')}),
    )

class TravelOrderAdmin(admin.ModelAdmin):
    list_display = ['destination', 'mode_of_filing', 'status', 'submitted_at', 'evidence_preview']
    readonly_fields = ['evidence_preview']

    def evidence_preview(self, obj):
        if obj.evidence:
            return mark_safe(f'<img src="{obj.evidence.url}" width="200" />')
        return "No evidence uploaded"

admin.site.register(CustomUser, CustomUserAdmin)
admin.site.register(Fund)
admin.site.register(Transportation)
admin.site.register(TravelOrder, TravelOrderAdmin)
admin.site.register(Signature)
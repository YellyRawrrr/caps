from rest_framework import serializers
from .models import TravelOrder, Signature, CustomUser
from django.contrib.auth.hashers import make_password


class TravelOrderSerializer(serializers.ModelSerializer):
    # Accepts list of user IDs
    employees = serializers.PrimaryKeyRelatedField(
        many=True, queryset=CustomUser.objects.all()
    )

    # Optional: returns full names of employees (read-only)
    employee_names = serializers.SerializerMethodField()

    class Meta:
        model = TravelOrder
        fields = '__all__'

    def get_employee_names(self, obj):
        return [f"{u.first_name} {u.last_name}" for u in obj.employees.all()]



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    full_name = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'user_level', 'employee_type', 'first_name', 'last_name', 'full_name']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)

from rest_framework import serializers
from .models import TravelOrder, Signature, CustomUser, Itinerary, Fund, Transportation, EmployeePosition, Liquidation
from django.contrib.auth.hashers import make_password

class TransportationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transportation
        fields = ['id', 'means_of_transportation', 'is_archived']

class ItinerarySerializer(serializers.ModelSerializer):
    transportation = serializers.PrimaryKeyRelatedField( queryset=Transportation.objects.all(), allow_null=True)
    class Meta:
        model = Itinerary
        fields = '__all__'
        extra_kwargs = {
            'travel_order': {'required': False}
        }

class FundSerializer(serializers.ModelSerializer):
    class Meta:
        model = Fund
        fields = ['id', 'source_of_fund', 'is_archived']

class TravelOrderSerializer(serializers.ModelSerializer):
    employees = serializers.PrimaryKeyRelatedField(many=True, queryset=CustomUser.objects.all())
    employee_names = serializers.SerializerMethodField()
    prepared_by = serializers.PrimaryKeyRelatedField(queryset=CustomUser.objects.all())
    itinerary = ItinerarySerializer(many=True)
    employee_position = serializers.PrimaryKeyRelatedField(queryset=EmployeePosition.objects.all(), allow_null=True, required=False)

    class Meta:
        model = TravelOrder
        fields = '__all__'

    def get_employee_names(self, obj):
        return [f"{u.first_name} {u.last_name}" for u in obj.employees.all()]

    def create(self, validated_data):
        itinerary_data = validated_data.pop('itinerary')
        employees_data = validated_data.pop('employees')

        travel_order = TravelOrder.objects.create(**validated_data)
        travel_order.employees.set(employees_data)

        for item in itinerary_data:
            Itinerary.objects.create(travel_order=travel_order, **item)

        return travel_order


class EmployeePositionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmployeePosition
        fields = ['id', 'position_name', 'is_archived']



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)

    # Computed fields
    full_name = serializers.SerializerMethodField()
    employee_position = serializers.PrimaryKeyRelatedField(read_only=True)
    employee_position_name = serializers.SerializerMethodField()

    # Enum display fields
    user_level_display = serializers.SerializerMethodField()
    employee_type_display = serializers.SerializerMethodField()
    
    type_of_user_display = serializers.SerializerMethodField()

    class Meta:
        model = CustomUser
        fields = [
            'id', 'username', 'password',
            'user_level', 'user_level_display',
            'employee_type', 'employee_type_display',
            'type_of_user', 'type_of_user_display',
            'first_name', 'last_name',
            'full_name', 'employee_position', 'employee_position_name'
        ]

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    def get_user_level_display(self, obj):
        return obj.get_user_level_display()

    def get_employee_type_display(self, obj):
        return obj.get_employee_type_display()

    def get_type_of_user_display(self, obj):  # ✅ Add this method
        return obj.get_type_of_user_display()

    def get_employee_position_name(self, obj):
        return obj.employee_position.position_name if obj.employee_position else None

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = CustomUser(**validated_data)
        user.set_password(password)
        user.save()
        return user



    
class TravelOrderSimpleSerializer(serializers.ModelSerializer):
    class Meta:
        model = TravelOrder
        fields = ['id', 'travel_order_number']


class LiquidationSerializer(serializers.ModelSerializer):
    travel_order = TravelOrderSimpleSerializer(read_only=True)
    travel_order_id = serializers.PrimaryKeyRelatedField(
        queryset=TravelOrder.objects.all(), source='travel_order', write_only=True
    )

    # Explicit file fields for better control and frontend usability
    certificate_of_travel = serializers.FileField(use_url=True)
    certificate_of_appearance = serializers.FileField(use_url=True)
    after_travel_report = serializers.FileField(use_url=True)

    class Meta:
        model = Liquidation
        fields = '__all__'
        read_only_fields = (
            'uploaded_by', 'submitted_at',
            'reviewed_by_bookkeeper', 'reviewed_at_bookkeeper',
            'reviewed_by_accountant', 'reviewed_at_accountant'
        )
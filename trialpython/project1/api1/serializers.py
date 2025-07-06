from rest_framework import serializers
from .models import TravelOrder, Signature, CustomUser, Itinerary, Fund, Transportation, EmployeePosition
from django.contrib.auth.hashers import make_password

class TransportationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Transportation
        fields = ['id', 'means_of_transportation']

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
        fields = ['id', 'source_of_fund']

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
        fields = ['id', 'position_name']



class UserSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, required=True)
    full_name = serializers.SerializerMethodField()
    position = serializers.StringRelatedField()

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'password', 'user_level', 'employee_type', 'first_name', 'last_name', 'full_name', 'position']

    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    def create(self, validated_data):
        validated_data['password'] = make_password(validated_data['password'])
        return super().create(validated_data)
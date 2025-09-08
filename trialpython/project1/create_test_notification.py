#!/usr/bin/env python
import os
import sys
import django

# Add the project directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'project1.settings')
django.setup()

from api1.models import CustomUser, TravelOrder, Notification

def create_test_notification():
    # Get the first user (or you can specify a user ID)
    try:
        user = CustomUser.objects.first()
        if not user:
            print("No users found in the database")
            return
        
        # Get the first travel order (or create a dummy one)
        travel_order = TravelOrder.objects.first()
        if not travel_order:
            print("No travel orders found in the database")
            return
        
        # Create a test notification
        notification = Notification.objects.create(
            user=user,
            travel_order=travel_order,
            notification_type='travel_approved',
            title='Test Notification',
            message='This is a test notification to verify the system is working.',
            is_read=False
        )
        
        print(f"Test notification created successfully!")
        print(f"User: {user.username}")
        print(f"Travel Order: {travel_order.destination}")
        print(f"Notification ID: {notification.id}")
        
    except Exception as e:
        print(f"Error creating test notification: {e}")

if __name__ == "__main__":
    create_test_notification()

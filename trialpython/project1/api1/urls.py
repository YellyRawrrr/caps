from django.urls import path
from .views import (
    TravelOrderCreateView, ApproveTravelOrderView, ResubmitTravelOrderView,
    CurrentUserView,TravelOrderUpdateView,TravelOrderDetailView,
    EmployeeListView, MyTravelOrdersView, TravelOrderApprovalsView, login_view, logout_view,
    refresh_token_view, protected_view
)

urlpatterns = [
     
    path('login/', login_view),
    path('logout/', logout_view),
    path('refresh/', refresh_token_view),
    path('protected/', protected_view),

    #Users
    path('employees/', EmployeeListView.as_view(), name='employee-list'),

    # Travel Order Routes
    path('travel-orders/', TravelOrderCreateView.as_view(), name='create-travel-order'),

    path('my-travel-orders/', MyTravelOrdersView.as_view(), name='my-travel-orders'),
    path('my-pending-approvals/', TravelOrderApprovalsView.as_view(), name='travel-order-approvals'),
    path('travel-orders/<int:pk>/', TravelOrderDetailView.as_view(), name='travel-order-detail'),

    path('update-travel-order/<int:pk>/', TravelOrderUpdateView.as_view(), name='update-travel-order'),
    path('approve-travel-order/<int:pk>/', ApproveTravelOrderView.as_view(), name='approve-travel-order'),
    path('resubmit-travel-order/<int:pk>/', ResubmitTravelOrderView.as_view(), name='resubmit-travel-order'),

    # Authenticated User Info
    path('user-info/', CurrentUserView.as_view(), name='user-info'),
]

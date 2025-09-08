from django.urls import path
from .views import (
    TravelOrderCreateView, ApproveTravelOrderView, ResubmitTravelOrderView,
    CurrentUserView,TravelOrderDetailUpdateView,
    EmployeeListView, MyTravelOrdersView, TravelOrderApprovalsView,
    FundListCreateView, TransportationCreateView,AdminTravelView,
    FundDetailView,TransportationDetailView, EmployeeDetailUpdateView,
    EmployeePositionCreateView,EmployeePositionDetailView,
    SubmitLiquidationView, BookkeeperReviewView, AccountantReviewView, LiquidationListView,
    TravelOrdersNeedingLiquidationView, LiquidationDetailView, TravelOrderItineraryView,
    EmployeeDashboardAPIView, AdminDashboard, HeadDashboardAPIView, DirectorDashboardView,TravelOrderReportView,
    NotificationListView, NotificationMarkReadView, NotificationMarkAllReadView, NotificationCountView,
    login_view, logout_view,
    refresh_token_view, protected_view, download_evidence, change_password_view
)

urlpatterns = [
     
    path('login/', login_view),
    path('logout/', logout_view),
    path('refresh/', refresh_token_view),
    path('protected/', protected_view),
    path('change-password/', change_password_view),

    #Users/Admin
    path('employees/', EmployeeListView.as_view(), name='employee-list'),
    path('employees/<int:pk>/', EmployeeDetailUpdateView.as_view(), name='employee-update'),
    path('admin/travels/',AdminTravelView.as_view(), name='admin-travels'),
    path('reports/', TravelOrderReportView.as_view(), name='travel-order-report'),

    # Travel Order Routes
    path('travel-orders/', TravelOrderCreateView.as_view(), name='create-travel-order'),

    path('my-travel-orders/', MyTravelOrdersView.as_view(), name='my-travel-orders'),
    path('my-pending-approvals/', TravelOrderApprovalsView.as_view(), name='travel-order-approvals'),
    path('travel-orders/<int:pk>/', TravelOrderDetailUpdateView.as_view(), name='travel-order-detail-update'),
    path('travel-itinerary/<int:travel_order_id>/', TravelOrderItineraryView.as_view(), name='travel-order-itineraries'),
    
    #travels settings
    path('funds/', FundListCreateView.as_view(), name='funds'),
    path('transportation/', TransportationCreateView .as_view(), name='transportation'),
    path('funds/<int:pk>/', FundDetailView.as_view(), name='fund-detail'),
    path('transportation/<int:pk>/', TransportationDetailView.as_view(), name='transportation-detail'),
    path('employee-position/', EmployeePositionCreateView.as_view(), name='employee-position'),
    path('employee-position/<int:pk>/', EmployeePositionDetailView.as_view(), name='fund-detail'),

    #liquidation
    #  Employee: Submit or resubmit liquidation
    path('liquidation/<int:pk>/submit/', SubmitLiquidationView.as_view(), name='submit-liquidation'),

    #  Bookkeeper: Pre-audit (approve/reject)
    path('liquidation/<int:pk>/bookkeeper-review/', BookkeeperReviewView.as_view(), name='bookkeeper-review'),

    #  Accountant: Final audit (approve/reject)
    path('liquidation/<int:pk>/accountant-review/', AccountantReviewView.as_view(), name='accountant-review'),

    #  All liquidations (admin/staff/bookkeeper view)
    path('liquidations/', LiquidationListView.as_view(), name='liquidation-list'),

    # 👤 Employee: View their own liquidation (history/dashboard)
    path("travel-orders/needing-liquidation/", TravelOrdersNeedingLiquidationView.as_view(), name="travel-orders-needing-liquidation"),


    # 🔍 Detail view
    path('liquidations/<int:pk>/', LiquidationDetailView.as_view(), name='liquidation-detail'),




   
    path('approve-travel-order/<int:pk>/', ApproveTravelOrderView.as_view(), name='approve-travel-order'),
    path('resubmit-travel-order/<int:pk>/', ResubmitTravelOrderView.as_view(), name='resubmit-travel-order'),

    #dashboard
    path('employee-dashboard/', EmployeeDashboardAPIView.as_view(), name='employee-dashboard'),
    path('admin-dashboard/', AdminDashboard.as_view(), name='travel-order-chart'),
    path('head-dashboard/', HeadDashboardAPIView.as_view(), name='head-dashboard'),
    path('director-dashboard/', DirectorDashboardView.as_view(), name='director-dashboard'),

    # Authenticated User Info
    path('user-info/', CurrentUserView.as_view(), name='user-info'),
    
    # Evidence Download
    path('travel-orders/<int:travel_order_id>/evidence/', download_evidence, name='download-evidence'),
    
    # Notifications
    path('notifications/', NotificationListView.as_view(), name='notification-list'),
    path('notifications/<int:pk>/mark-read/', NotificationMarkReadView.as_view(), name='notification-mark-read'),
    path('notifications/mark-all-read/', NotificationMarkAllReadView.as_view(), name='notification-mark-all-read'),
    path('notifications/count/', NotificationCountView.as_view(), name='notification-count'),
]
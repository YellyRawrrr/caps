from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models.functions import TruncMonth
from django.db.models import Count
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
from datetime import timedelta, datetime
from collections import defaultdict 
import json
from django.utils.dateparse import parse_date
from rest_framework.parsers import MultiPartParser, FormParser
from django.utils import timezone
from django.utils.timezone import now
from .models import TravelOrder, Signature, CustomUser, Fund, Transportation, EmployeePosition, Liquidation, EmployeeSignature, Itinerary, Notification
from .serializers import TravelOrderSerializer, UserSerializer, FundSerializer, TransportationSerializer, EmployeePositionSerializer, LiquidationSerializer, ItinerarySerializer, TravelOrderSimpleSerializer, TravelOrderReportSerializer, NotificationSerializer
from .utils import get_approval_chain, get_next_head, build_status_map
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate
from django.contrib.auth.hashers import make_password
from django.http import HttpResponse, Http404
import os
import mimetypes


def create_notification(user, travel_order, notification_type, title, message):
    """Helper function to create notifications"""
    Notification.objects.create(
        user=user,
        travel_order=travel_order,
        notification_type=notification_type,
        title=title,
        message=message
    )


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    email = request.data.get('email')
    password = request.data.get('password')

    # Try to find user by email first, then fallback to username
    try:
        user_obj = CustomUser.objects.get(email=email)
        user = authenticate(request, username=user_obj.username, password=password)
    except CustomUser.DoesNotExist:
        # Fallback to username authentication for backward compatibility
        username = request.data.get('username')
        if username:
            user = authenticate(request, username=username, password=password)
        else:
            user = None

    if user:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

        # Check if user must change password
        if user.must_change_password:
            response = Response({
                "message": "Password change required", 
                "must_change_password": True,
                "user_id": user.id
            }, status=status.HTTP_200_OK)
        else:
            response = Response({"message": "Login Successful"}, status=status.HTTP_200_OK)

        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE", "access_token")
        cookie_secure = settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", False)
        cookie_httponly = settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY", True)
        cookie_samesite = settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax")
        access_token_lifetime = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
        refresh_token_lifetime = int(settings.SIMPLE_JWT["REFRESH_TOKEN_LIFETIME"].total_seconds())

        response.set_cookie(cookie_name, access_token, httponly=cookie_httponly, secure=cookie_secure,
                            samesite=cookie_samesite, max_age=access_token_lifetime)
        response.set_cookie('refresh_token', str(refresh), httponly=cookie_httponly, secure=cookie_secure,
                            samesite=cookie_samesite, max_age=refresh_token_lifetime)

        return response
    return Response({"message": "Invalid Credentials"}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout_view(request):
    response = Response({'message': 'Logged out successfully'}, status=200)
    response.delete_cookie('access_token')
    response.delete_cookie('refresh_token')
    return response


@api_view(['POST'])
@permission_classes([AllowAny])
def refresh_token_view(request):
    refresh_token = request.COOKIES.get('refresh_token')
    if not refresh_token:
        return Response({'error': 'No refresh token'}, status=401)
    try:
        cookie_secure = settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", False)
        cookie_httponly = settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY", True)
        cookie_samesite = settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax")
        access_token_lifetime = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())

        refresh = RefreshToken(refresh_token)
        access = str(refresh.access_token)

        res = Response({'access': access}, status=200)
        res.set_cookie('access_token', access, httponly=cookie_httponly, samesite=cookie_samesite,
                       secure=cookie_secure, max_age=access_token_lifetime, path="/")
        return res
    except Exception:
        return Response({'detail': 'Invalid refresh token'}, status=403)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({
        "authenticated": True,
        "user": request.user.username
    })


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    """
    Change user password and clear must_change_password flag
    """
    user = request.user
    new_password = request.data.get('new_password')
    
    if not new_password:
        return Response({"error": "New password is required"}, status=status.HTTP_400_BAD_REQUEST)
    
    if len(new_password) < 8:
        return Response({"error": "Password must be at least 8 characters long"}, status=status.HTTP_400_BAD_REQUEST)
    
    # Set new password
    user.set_password(new_password)
    # Clear the must_change_password flag
    user.must_change_password = False
    user.save()
    
    return Response({"message": "Password changed successfully"}, status=status.HTTP_200_OK)




class TravelOrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request):
        user = request.user
        
        # Debug: Raw request data
        print("=== RAW REQUEST DATA ===")
        print(f"request.data keys: {list(request.data.keys())}")
        print(f"request.FILES keys: {list(request.FILES.keys())}")
        for key, value in request.data.items():
            if key in ['employees', 'itinerary']:
                print(f"{key}: {value} (type: {type(value)})")
        
        # Get approval chain
        approval_chain = get_approval_chain(user)
        next_head = get_next_head(approval_chain, 0, current_user=user) if approval_chain else None

        # Convert QueryDict to regular dict and handle list values properly
        data = {}
        for key, value in request.data.items():
            if isinstance(value, list) and len(value) == 1:
                # Extract single value from list (Django form processing creates lists)
                data[key] = value[0]
            else:
                data[key] = value
        
        data['current_approver'] = next_head.id if next_head else None
        data['approval_stage'] = 0

        # Parse itinerary
        if isinstance(data.get('itinerary'), str):
            try:
                data['itinerary'] = json.loads(data['itinerary'])
            except json.JSONDecodeError as e:
                return Response({'itinerary': ['Invalid itinerary format.']}, status=400)

        # Parse employees
        if isinstance(data.get('employees'), str):
            try:
                data['employees'] = json.loads(data['employees'])
            except json.JSONDecodeError as e:
                return Response({'employees': ['Invalid employees format.']}, status=400)

        # Ensure filer is in employees
        if user.id not in data['employees']:
            data['employees'].insert(0, user.id)

        # Debug: Final data being validated
        print(f"FINAL VALIDATION DATA: {dict(data)}")
        
        # Validate and save
        serializer = TravelOrderSerializer(data=data)
        if serializer.is_valid():
            # Handle evidence file
            evidence_file = request.FILES.get('evidence')
            save_kwargs = {'prepared_by': user}
            if evidence_file:
                save_kwargs['evidence'] = evidence_file
                
            travel_order = serializer.save(**save_kwargs)
            travel_order.number_of_employees = travel_order.employees.count()

            # 🔑 Director → auto-generate travel order number
            if user.user_level == 'director':
                from .utils import generate_travel_order_number
                travel_order.travel_order_number = generate_travel_order_number()
                # No approvers needed
                travel_order.current_approver = None
                travel_order.approval_stage = 0
                travel_order.status = "Travel order is placed"

            travel_order.save()

            # Handle signature
            signature_data = request.data.get("signature")
            if signature_data:
                EmployeeSignature.objects.update_or_create(
                    order=travel_order,
                    defaults={
                        "signed_by": user,
                        "signature_data": signature_data
                    }
                )

            print("SUCCESS: Travel order created")
            return Response(TravelOrderSerializer(travel_order).data, status=status.HTTP_201_CREATED)

        print(f"VALIDATION ERRORS: {serializer.errors}")
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)



class TravelOrderDetailUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    parser_classes = [MultiPartParser, FormParser]

    def get(self, request, pk):
        order = get_object_or_404(TravelOrder, pk=pk)
        serializer = TravelOrderSerializer(order)
        return Response(serializer.data)

    def put(self, request, pk):
        order = get_object_or_404(TravelOrder, pk=pk)

        if order.prepared_by != request.user:
            return Response({'error': 'Forbidden'}, status=403)

        # Convert QueryDict to regular dict and handle list values properly
        data = {}
        for key, value in request.data.items():
            if isinstance(value, list) and len(value) == 1:
                # Extract single value from list (Django form processing creates lists)
                data[key] = value[0]
            else:
                data[key] = value

        # Parse employees
        if isinstance(data.get('employees'), str):
            try:
                data['employees'] = json.loads(data['employees'])
            except json.JSONDecodeError:
                return Response({'employees': ['Invalid employees format.']}, status=400)
            
        # Parse itinerary
        if isinstance(data.get('itinerary'), str):
            try:
                data['itinerary'] = json.loads(data['itinerary'])
            except json.JSONDecodeError:
                return Response({'itinerary': ['Invalid itinerary format.']}, status=400)

        serializer = TravelOrderSerializer(order, data=data)
        if serializer.is_valid():
            # Handle evidence file if provided
            evidence_file = request.FILES.get('evidence')
            save_kwargs = {
                'approval_stage': 0,
                'current_approver': get_next_head(get_approval_chain(request.user), 0, current_user=request.user),
                'is_resubmitted': True,
                'rejected_by': None,
                'rejection_comment': '',
                'rejected_at': None,
                'status': 'Travel Order Resubmitted',  # ✅ Reset status from 'rejected'
            }
            
            if evidence_file:
                save_kwargs['evidence'] = evidence_file
                
            serializer.save(**save_kwargs)
            return Response(serializer.data)
        return Response(serializer.errors, status=400)



    
class FundListCreateView(APIView):
    def get(self, request):
        include_archived = request.query_params.get('include_archived') == 'true'
        if include_archived:
            funds = Fund.objects.all().order_by('-id')
        else:
            funds = Fund.objects.filter(is_archived=False).order_by('-id')
        serializer = FundSerializer(funds, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = FundSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class FundDetailView(APIView):
    def put(self, request, pk):
        fund = get_object_or_404(Fund, pk=pk)
        serializer = FundSerializer(fund, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def patch(self, request, pk):
        fund = get_object_or_404(Fund, pk=pk)
        serializer = FundSerializer(fund, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class TransportationCreateView(APIView):
    def get(self, request):
        include_archived = request.query_params.get('include_archived') == 'true'
        qs = Transportation.objects.all().order_by('-id')
        if not include_archived:
            qs = qs.filter(is_archived=False)
        serializer = TransportationSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = TransportationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TransportationDetailView(APIView):
    def put(self, request, pk):
        transportation = get_object_or_404(Transportation, pk=pk)
        serializer = TransportationSerializer(transportation, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        transportation = get_object_or_404(Transportation, pk=pk)
        serializer = TransportationSerializer(transportation, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    
class EmployeePositionCreateView(APIView):
    def get(self, request):
        include_archived = request.query_params.get('include_archived') == 'true'
        qs = EmployeePosition.objects.all().order_by('-id')
        if not include_archived:
            qs = qs.filter(is_archived=False)
        serializer = EmployeePositionSerializer(qs, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = EmployeePositionSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployeePositionDetailView(APIView):
    def put(self, request, pk):
        emp_position = get_object_or_404(EmployeePosition, pk=pk)
        serializer = EmployeePositionSerializer(emp_position, data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def patch(self, request, pk):
        emp_position = get_object_or_404(EmployeePosition, pk=pk)
        serializer = EmployeePositionSerializer(emp_position, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# View: MY FILED TRAVEL ORDERS
class MyTravelOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.user_level == 'admin':
            orders = TravelOrder.objects.all().order_by('-submitted_at')
        else:
            orders = TravelOrder.objects.filter(prepared_by=user).order_by('-submitted_at')

        serializer = TravelOrderSerializer(orders.distinct(), many=True)
        return Response(serializer.data)

    
class TravelOrderItineraryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, travel_order_id):
        itineraries = Itinerary.objects.filter(travel_order__id=travel_order_id)
        serializer = ItinerarySerializer(itineraries, many=True)
        return Response(serializer.data)


# View: APPROVALS TO REVIEW (only where current_approver is the logged-in user)
class TravelOrderApprovalsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        orders = TravelOrder.objects.filter(
            current_approver=user
        ).exclude(
            status__in=[
                'The travel order has been approved by the Regional Director',
                'The travel order has been rejected by the Regional Director',
            ]
        ).order_by('-submitted_at')

        serializer = TravelOrderSerializer(orders.distinct(), many=True)
        return Response(serializer.data)



@method_decorator(csrf_exempt, name='dispatch')
class ApproveTravelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        order = get_object_or_404(TravelOrder, pk=pk)
        user = request.user

        if order.current_approver != user:
            return Response({"error": "Unauthorized approval."}, status=403)

        decision = request.data.get('decision')
        comment = request.data.get('comment')
        signature = request.data.get('signature')

        # Map employee_type to status strings from your STATUS_CHOICES
        status_map = build_status_map()


        if decision == 'approve':
            filer = order.prepared_by
            chain = get_approval_chain(filer)
            current_stage = chain[order.approval_stage] if order.approval_stage < len(chain) else 'regional'

            next_stage = order.approval_stage + 1
            next_head = get_next_head(chain, next_stage, current_user=user)

            if current_stage in status_map:
                order.status = status_map[current_stage]['approve']

            if next_head:
                order.current_approver = next_head
                order.approval_stage = next_stage
            else:
                # ✅ Final approval by Regional Director
                order.current_approver = None
                order.status = status_map['regional']['approve']

                # ✅ Auto-generate travel order number
                if not order.travel_order_number:
                    today = timezone.now().date()
                    prefix = f"R1-{today.strftime('%Y%m')}-"
                    last_order = TravelOrder.objects.filter(
                        travel_order_number__startswith=prefix
                    ).order_by('-travel_order_number').first()

                    if last_order and last_order.travel_order_number:
                        try:
                            last_number = int(last_order.travel_order_number.split('-')[-1])
                            next_number = last_number + 1
                        except (IndexError, ValueError):
                            next_number = 1
                    else:
                        next_number = 1

                    order.travel_order_number = f"{prefix}{next_number:04d}"

            order.is_resubmitted = False

            if signature:
                Signature.objects.create(
                    order=order,
                    signed_by=user,
                    signature_data=signature,
                    comment=comment 
                )

            order.save()
            
            # Create notification for the employee who filed the request
            if order.prepared_by:
                create_notification(
                    user=order.prepared_by,
                    travel_order=order,
                    notification_type='travel_approved',
                    title=f'Travel Request Approved by {user.get_full_name()}',
                    message=f'Your travel request to {order.destination} has been approved by {user.get_full_name()}.'
                )
            
            # If there's a next approver, notify them
            if next_head:
                create_notification(
                    user=next_head,
                    travel_order=order,
                    notification_type='travel_approved',
                    title=f'New Travel Request for Approval',
                    message=f'A travel request to {order.destination} by {order.prepared_by.get_full_name()} is ready for your approval.'
                )
            else:
                # Final approval - notify the employee
                if order.prepared_by:
                    create_notification(
                        user=order.prepared_by,
                        travel_order=order,
                        notification_type='travel_final_approved',
                        title=f'Travel Request Finally Approved',
                        message=f'Your travel request to {order.destination} has been finally approved and travel order number {order.travel_order_number} has been generated.'
                    )
            
            return Response({"message": "Travel order approved."}, status=200)


        elif decision == 'reject':
            if not comment:
                return Response({"error": "Rejection comment is required."}, status=400)

            filer = order.prepared_by
            chain = get_approval_chain(filer)
            current_stage = chain[order.approval_stage] if order.approval_stage < len(chain) else 'regional'

            if current_stage in status_map:
                order.status = status_map[current_stage]['reject']
            else:
                order.status = 'Rejected'

            order.rejection_comment = comment
            order.rejected_by = user
            order.rejected_at = timezone.now()
            order.current_approver = None
            order.save()
            
            # Create notification for the employee who filed the request
            if order.prepared_by:
                create_notification(
                    user=order.prepared_by,
                    travel_order=order,
                    notification_type='travel_rejected',
                    title=f'Travel Request Rejected by {user.get_full_name()}',
                    message=f'Your travel request to {order.destination} has been rejected by {user.get_full_name()}. Reason: {comment}'
                )
            
            # Notify previous approvers that their approved request was rejected
            previous_signatures = Signature.objects.filter(order=order).order_by('-signed_at')
            for signature in previous_signatures:
                if signature.signed_by != user:  # Don't notify the current rejector
                    create_notification(
                        user=signature.signed_by,
                        travel_order=order,
                        notification_type='travel_rejected_by_next_approver',
                        title=f'Your Approved Travel Request was Rejected',
                        message=f'The travel request to {order.destination} that you approved has been rejected by {user.get_full_name()}. Reason: {comment}'
                    )

            return Response({"message": "Travel order rejected."}, status=200)

        return Response({"error": "Invalid decision."}, status=400)





@method_decorator(csrf_exempt, name='dispatch')
class ResubmitTravelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        order = get_object_or_404(TravelOrder, pk=pk)
        user = request.user

        # Ensure user is among original employees
        if not order.employees.filter(id=user.id).exists():
            return Response({"error": "Unauthorized."}, status=403)

        if 'rejected' not in order.status.lower():
            return Response({"error": "Only rejected orders can be resubmitted."}, status=400)


        # Get approval chain based on the filer
        filer = order.prepared_by
        approval_chain = get_approval_chain(filer)
        next_head = get_next_head(approval_chain, 0, current_user=filer)

        if not next_head:
            return Response({"error": "No head found to reassign this order to."}, status=400)

        # Reset important fields
        order.status = 'Travel order is placed'
        order.current_approver = next_head
        order.approval_stage = 0
        order.is_resubmitted = True
        order.rejection_comment = None
        order.rejected_at = None
        order.rejected_by = None
        order.travel_order_number = None  # Clear the old number if it existed

        order.save()

        return Response({
            "message": f"Travel order successfully resubmitted to {next_head.username}."
        }, status=200)




class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "user_level": user.user_level,
            "employee_type": user.employee_type
        })


@api_view(['POST'])
@permission_classes([AllowAny])
def change_password_view(request):
    """Change password for first-time login users"""
    user_id = request.data.get('user_id')
    new_password = request.data.get('new_password')
    
    if not user_id or not new_password:
        return Response({
            "error": "User ID and new password are required"
        }, status=status.HTTP_400_BAD_REQUEST)
    
    try:
        user = CustomUser.objects.get(id=user_id)
        if not user.must_change_password:
            return Response({
                "error": "User does not need to change password"
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Set new password
        user.set_password(new_password)
        user.must_change_password = False
        user.save()
        
        # Generate tokens for successful login
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        
        response = Response({
            "message": "Password changed successfully. Login completed.",
            "access_token": access_token
        }, status=status.HTTP_200_OK)
        
        # Set authentication cookie
        cookie_name = settings.SIMPLE_JWT.get("AUTH_COOKIE", "access_token")
        cookie_secure = settings.SIMPLE_JWT.get("AUTH_COOKIE_SECURE", False)
        cookie_httponly = settings.SIMPLE_JWT.get("AUTH_COOKIE_HTTP_ONLY", True)
        cookie_samesite = settings.SIMPLE_JWT.get("AUTH_COOKIE_SAMESITE", "Lax")
        access_token_lifetime = int(settings.SIMPLE_JWT["ACCESS_TOKEN_LIFETIME"].total_seconds())
        
        response.set_cookie(cookie_name, access_token, httponly=cookie_httponly, secure=cookie_secure,
                           samesite=cookie_samesite, max_age=access_token_lifetime)
        
        return response
        
    except CustomUser.DoesNotExist:
        return Response({
            "error": "User not found"
        }, status=status.HTTP_404_NOT_FOUND)





class EmployeeListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.all().order_by('-id')
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = UserSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class EmployeeDetailUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def put(self, request, pk):
        try:
            user = CustomUser.objects.get(id=pk)
        except CustomUser.DoesNotExist:
            return Response({'error': 'User not found'}, status=status.HTTP_404_NOT_FOUND)

        data = request.data.copy()
        if 'password' in data and not data['password']:
            data.pop('password')
        elif 'password' in data:
            data['password'] = make_password(data['password'])

        serializer = UserSerializer(user, data=data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    

class AdminTravelView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        travel = TravelOrder.objects.all().order_by('-submitted_at')
        serializer = TravelOrderSerializer(travel, many=True)
        return Response(serializer.data)
    

class SubmitLiquidationView(APIView):
    parser_classes = [MultiPartParser, FormParser]

    def post(self, request, pk):
        try:
            travel_order = TravelOrder.objects.get(pk=pk)
        except TravelOrder.DoesNotExist:
            return Response({'error': 'Travel order not found.'}, status=404)

        serializer = LiquidationSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(travel_order=travel_order, uploaded_by=request.user)
            return Response(serializer.data, status=201)
        return Response(serializer.errors, status=400)





class BookkeeperReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        # Verify user is a bookkeeper
        if request.user.user_level != 'bookkeeper':
            return Response({"error": "Only bookkeepers can review this liquidation"}, 
                          status=status.HTTP_403_FORBIDDEN)
            
        liquidation = get_object_or_404(Liquidation, pk=pk)
        
        # Verify liquidation is in the correct state
        if liquidation.status != 'Pending':
            return Response({"error": "Liquidation is not in a reviewable state"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        approve = request.data.get('approve', False)
        comment = request.data.get('comment', '')

        liquidation.is_bookkeeper_approved = approve
        liquidation.bookkeeper_comment = comment
        liquidation.reviewed_by_bookkeeper = request.user
        liquidation.reviewed_at_bookkeeper = timezone.now()
        
        if approve:
            liquidation.status = 'Under Final Audit'
        else:
            liquidation.status = 'Rejected'
            
        liquidation.save()
        
        return Response({
            'message': 'Returned to employee for revision.' if not approve else 'Forwarded to accountant.',
            'status': 'success'
        }, status=status.HTTP_200_OK)


class AccountantReviewView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        # Verify user is an accountant
        if request.user.user_level != 'accountant':
            return Response({"error": "Only accountants can review this liquidation"}, 
                          status=status.HTTP_403_FORBIDDEN)
            
        liquidation = get_object_or_404(Liquidation, pk=pk)
        
        # Verify liquidation is in the correct state
        if liquidation.status != 'Under Final Audit':
            return Response({"error": "Liquidation is not ready for final audit"}, 
                          status=status.HTTP_400_BAD_REQUEST)

        approve = request.data.get('approve', False)
        comment = request.data.get('comment', '')

        liquidation.is_accountant_approved = approve
        liquidation.accountant_comment = comment
        liquidation.reviewed_by_accountant = request.user
        liquidation.reviewed_at_accountant = timezone.now()
        
        if approve:
            liquidation.status = 'Ready for Claim'
        else:
            liquidation.status = 'Rejected'
            
        liquidation.save()
        
        return Response({
            'message': 'Liquidation approved and ready for claim.' if approve else 'Rejected by accountant.',
            'status': 'success'
        }, status=status.HTTP_200_OK)

    
class LiquidationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        liquidations = Liquidation.objects.select_related('travel_order').all().order_by('-id')
        serializer = LiquidationSerializer(liquidations, many=True)
        return Response(serializer.data)
    

class TravelOrdersNeedingLiquidationView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        now = timezone.now().date()

        # 3 months ago
        min_date = now - timedelta(days=90)

        # Filter:
        travel_orders = TravelOrder.objects.filter(
            prepared_by=user,
            travel_order_number__isnull=False,
            liquidation__isnull=True
        ).order_by("-date_travel_to")

        serializer = TravelOrderSimpleSerializer(travel_orders, many=True)
        return Response(serializer.data)
    
class LiquidationDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        liquidation = get_object_or_404(Liquidation, pk=pk)
        serializer = LiquidationSerializer(liquidation)
        return Response(serializer.data, status=status.HTTP_200_OK)


class EmployeeDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = now().date()
        current_month = today.month
        current_year = today.year

        # Filter orders prepared by this user
        queryset = TravelOrder.objects.filter(prepared_by=user)

        total_orders = queryset.count()

        approved_by_director = queryset.filter(
            status='The travel order has been approved by the Regional Director'
        ).count()

        disapproved = queryset.filter(
            status__in=[
                'The travel order has been rejected by the CSC head.',
                'The travel order has been rejected by the PO head',
                'The travel order has been rejected by the TMSD chief',
                'The travel order has been rejected by the AFSD Chief',
                'The travel order has been rejected by the Regional Director'
            ]
        ).count()

        upcoming_travels = queryset.filter(
            date_travel_from__gte=today,
            date_travel_from__month=current_month,
            date_travel_from__year=current_year
        ).values(
            'destination',
            'date_travel_from',
            'date_travel_to',
            'status'
        ).order_by('date_travel_from')

        return Response({
            'total_orders': total_orders,
            'approved_by_director': approved_by_director,
            'disapproved': disapproved,
            'upcoming_travels': list(upcoming_travels),
        })
    



class AdminDashboard(APIView):
    def get(self, request):
        groups = {
            "Pangasinan PO + CSCs": ['pangasinan_po', 'urdaneta_csc', 'sison_csc'],
            "La Union PO + CSCs": ['launion_po', 'sudipen_csc', 'pugo_csc'],
            "Ilocos Sur PO + CSCs": ['ilocossur_po', 'tagudin_csc', 'banayoyo_csc'],
            "Ilocos Norte PO + CSCs": ['ilocosnorte_po', 'dingras_csc'],
        }

        # Generate list of last 12 months
        now_time = datetime.now()
        month_list = [
            (now_time.replace(day=1) - timedelta(days=30 * i)).strftime("%Y-%m")
            for i in reversed(range(12))
        ]

        result = defaultdict(lambda: {month: 0 for month in month_list})

        # Travel orders grouped by month and employee_type
        orders = TravelOrder.objects.filter(submitted_at__isnull=False).annotate(
            month=TruncMonth('submitted_at')
        ).values('month', 'employees__employee_type').annotate(
            count=Count('id')
        ).order_by('month')

        for entry in orders:
            month = entry['month'].strftime('%Y-%m')
            emp_type = entry['employees__employee_type']
            for group_name, types in groups.items():
                if emp_type in types:
                    result[group_name][month] += entry['count']

        # Summary counts
        completed = TravelOrder.objects.filter(date_travel_to__lt=now().date()).count()

        approved_by_director = TravelOrder.objects.filter(
            status='The travel order has been approved by the Regional Director'
        ).count()

        return Response({
            "labels": month_list,
            "datasets": [
                {
                    "label": group,
                    "data": [result[group][month] for month in month_list]
                } for group in groups
            ],
            "completed": completed,
            "approved_by_director": approved_by_director
        })

class HeadDashboardAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        today = now().date()
        start_of_month = today.replace(day=1)

        own_orders = TravelOrder.objects.filter(prepared_by=user)
        pending_approvals = TravelOrder.objects.filter(current_approver=user, status__icontains='placed')

        approved_by_director = own_orders.filter(
            status='The travel order has been approved by the Regional Director'
        ).count()

        rejected = own_orders.filter(
            status__icontains='rejected'
        ).count()

        current_month_orders = own_orders.filter(
            submitted_at__date__gte=start_of_month
        ).values(
            'destination', 'date_travel_from', 'date_travel_to', 'status'
        )

        data = {
            'counts': {
                'total': own_orders.count(),
                'approved_by_director': approved_by_director,
                'rejected': rejected,
                'pending': pending_approvals.count(),
            },
            'travel_orders': list(current_month_orders)
        }

        return Response(data)
    
class DirectorDashboardView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        if user.user_level != 'director':
            return Response({'error': 'Unauthorized'}, status=403)

        # === COUNT STATISTICS ===
        pending = TravelOrder.objects.filter(current_approver=user).count()
        approved = TravelOrder.objects.filter(
            status='The travel order has been approved by the Regional Director',
            rejected_by=None
        ).count()
        rejected = TravelOrder.objects.filter(
            status='The travel order has been rejected by the Regional Director',
            rejected_by=user
        ).count()

        # === MONTH LIST (12 MONTHS) ===
        now = datetime.now()
        month_list = [
            (now.replace(day=1) - timedelta(days=30 * i)).strftime("%Y-%m")
            for i in reversed(range(12))
        ]

        groups = {
            "Pangasinan PO + CSCs": ['pangasinan_po', 'urdaneta_csc', 'sison_csc'],
            "La Union PO + CSCs": ['launion_po', 'sudipen_csc', 'pugo_csc'],
            "Ilocos Sur PO + CSCs": ['ilocossur_po', 'tagudin_csc', 'banayoyo_csc'],
            "Ilocos Norte PO + CSCs": ['ilocosnorte_po', 'dingras_csc'],
        }

        result = defaultdict(lambda: {month: 0 for month in month_list})

        orders = TravelOrder.objects.filter(submitted_at__isnull=False).annotate(
            month=TruncMonth('submitted_at')
        ).values('month', 'employees__employee_type').annotate(count=Count('id'))

        for entry in orders:
            month = entry['month'].strftime('%Y-%m')
            emp_type = entry['employees__employee_type']
            for group_name, types in groups.items():
                if emp_type in types:
                    result[group_name][month] += entry['count']

        chart_data = {
            "labels": month_list,
            "datasets": [
                {
                    "label": group,
                    "data": [result[group][month] for month in month_list]
                } for group in groups
            ]
        }

        return Response({
            "stats": {
                "pending": pending,
                "approved": approved,
                "rejected": rejected
            },
            "chart": chart_data
        })
    
class TravelOrderReportView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        start_date = request.query_params.get('start_date')
        end_date = request.query_params.get('end_date')

        if not start_date or not end_date:
            return Response({"error": "Start date and end date are required."}, status=400)

        queryset = TravelOrder.objects.filter(
            date_travel_from__gte=parse_date(start_date),
            date_travel_to__lte=parse_date(end_date)
        ).order_by('date_travel_from')

        serializer = TravelOrderReportSerializer(queryset, many=True)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def download_evidence(request, travel_order_id):
    """
    Download evidence file for a travel order with proper authentication and headers
    """
    try:
        travel_order = get_object_or_404(TravelOrder, id=travel_order_id)
        
        # Check if user has permission to view this travel order
        user = request.user
        if user.user_level not in ['admin', 'director']:
            # Check if user is involved in this travel order
            if not (travel_order.prepared_by == user or travel_order.employees.filter(id=user.id).exists()):
                return Response({'error': 'Permission denied'}, status=status.HTTP_403_FORBIDDEN)
        
        if not travel_order.evidence:
            return Response({'error': 'No evidence file found'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get the file path
        file_path = travel_order.evidence.path
        
        if not os.path.exists(file_path):
            return Response({'error': 'File not found on server'}, status=status.HTTP_404_NOT_FOUND)
        
        # Get file info
        file_name = os.path.basename(file_path)
        file_size = os.path.getsize(file_path)
        
        # Determine content type
        content_type, _ = mimetypes.guess_type(file_path)
        if not content_type:
            content_type = 'application/octet-stream'
        
        # Read file and create response
        with open(file_path, 'rb') as file:
            response = HttpResponse(file.read(), content_type=content_type)
            response['Content-Disposition'] = f'attachment; filename="{file_name}"'
            response['Content-Length'] = file_size
            response['Access-Control-Allow-Origin'] = 'http://localhost:5173'
            response['Access-Control-Allow-Credentials'] = 'true'
            return response
            
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


# --- NOTIFICATION VIEWS ---
class NotificationListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get all notifications for the current user"""
        notifications = Notification.objects.filter(user=request.user)
        serializer = NotificationSerializer(notifications, many=True)
        return Response(serializer.data)


class NotificationMarkReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        """Mark a specific notification as read"""
        try:
            notification = Notification.objects.get(pk=pk, user=request.user)
            notification.is_read = True
            notification.save()
            return Response({"message": "Notification marked as read"}, status=200)
        except Notification.DoesNotExist:
            return Response({"error": "Notification not found"}, status=404)


class NotificationMarkAllReadView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request):
        """Mark all notifications as read for the current user"""
        Notification.objects.filter(user=request.user, is_read=False).update(is_read=True)
        return Response({"message": "All notifications marked as read"}, status=200)


class NotificationCountView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        """Get count of unread notifications"""
        count = Notification.objects.filter(user=request.user, is_read=False).count()
        return Response({"unread_count": count}, status=200)
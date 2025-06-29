from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.shortcuts import get_object_or_404
import json
from django.utils import timezone
from .models import TravelOrder, Signature, CustomUser
from .serializers import TravelOrderSerializer, UserSerializer
from .utils import get_approval_chain, get_next_head
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from django.conf import settings
from django.utils.decorators import method_decorator
from django.views.decorators.csrf import csrf_exempt
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth import authenticate


@api_view(['POST'])
@permission_classes([AllowAny])
def login_view(request):
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(request, username=username, password=password)

    if user:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)

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


class TravelOrderCreateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user

        if user.user_level == 'director':
            return Response({"error": "Regional Director cannot file travel orders."}, status=400)

        approval_chain = get_approval_chain(user)
        next_head = get_next_head(approval_chain, 0, current_user=user)

        # Clone the request data
        data = request.data.copy()
        data['current_approver'] = next_head.id if next_head else None
        data['approval_stage'] = 0

        # If itinerary or employees came as JSON strings, parse them
        if isinstance(data.get('itinerary'), str):
            try:
                data['itinerary'] = json.loads(data['itinerary'])
            except json.JSONDecodeError:
                return Response({'itinerary': ['Invalid itinerary format.']}, status=400)

        if isinstance(data.get('employees'), str):
            try:
                data['employees'] = json.loads(data['employees'])
            except json.JSONDecodeError:
                return Response({'employees': ['Invalid employees format.']}, status=400)

        # Validate and save
        serializer = TravelOrderSerializer(data=data)
        if serializer.is_valid():
            travel_order = serializer.save()
            travel_order.number_of_employees = travel_order.employees.count()
            travel_order.save()
            return Response(TravelOrderSerializer(travel_order).data, status=status.HTTP_201_CREATED)

        print("Validation errors:", serializer.errors)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# View: MY FILED TRAVEL ORDERS
class MyTravelOrdersView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        if user.user_level == 'admin':
            orders = TravelOrder.objects.all()
        else:
            orders = TravelOrder.objects.filter(employees=user)

        serializer = TravelOrderSerializer(orders.distinct(), many=True)
        return Response(serializer.data)


# View: APPROVALS TO REVIEW (only where current_approver is the logged-in user)
class TravelOrderApprovalsView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user

        # Only show if the current user is the current approver
        orders = TravelOrder.objects.filter(current_approver=user, status='Pending')
        serializer = TravelOrderSerializer(orders.distinct(), many=True)
        return Response(serializer.data)




class TravelOrderDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request, pk):
        user = request.user
        order = get_object_or_404(TravelOrder, pk=pk)

        if user.user_level == 'admin':
            pass
        elif user.user_level == 'head' and order.current_approver != user:
            return Response({"error": "Not authorized to view this order."}, status=403)
        elif user.user_level == 'employee' and not order.employees.filter(id=user.id).exists():
            return Response({"error": "Not authorized to view this order."}, status=403)

        serializer = TravelOrderSerializer(order)
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

        if decision == 'approve':
            employee = order.employees.first()
            chain = get_approval_chain(employee)
            next_stage = order.approval_stage + 1
            next_head = get_next_head(chain, next_stage)

            if next_head:
                order.current_approver = next_head
                order.approval_stage = next_stage
            else:
                order.status = 'Approved'
                order.current_approver = None

            order.is_resubmitted = False

            if signature:
                Signature.objects.create(
                    order=order,
                    signed_by=user,
                    signature_data=signature
                )

            order.save()
            return Response({"message": "Travel order approved."}, status=200)

        elif decision == 'reject':
            if not comment:
                return Response({"error": "Rejection comment is required."}, status=400)

            order.status = 'Rejected'
            order.rejection_comment = comment
            order.rejected_by = user
            order.rejected_at = timezone.now()
            order.current_approver = None
            order.save()

            return Response({"message": "Travel order rejected."}, status=200)

        return Response({"error": "Invalid decision."}, status=400)




@method_decorator(csrf_exempt, name='dispatch')
class ResubmitTravelOrderView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        order = get_object_or_404(TravelOrder, pk=pk)
        user = request.user

        if not order.employees.filter(id=user.id).exists():
            return Response({"error": "Unauthorized."}, status=403)

        if order.status != 'Rejected':
            return Response({"error": "Only rejected orders can be resubmitted."}, status=400)

        if not order.rejected_by:
            return Response({"error": "No rejecting head to return to."}, status=400)

        order.status = 'Pending'
        order.current_approver = order.rejected_by
        order.approval_stage = -1
        order.is_resubmitted = True
        order.rejection_comment = None
        order.rejected_at = None
        order.rejected_by = None
        order.save()

        return Response({"message": "Resubmitted to rejecting head."}, status=200)


class TravelOrderUpdateView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def patch(self, request, pk):
        order = get_object_or_404(TravelOrder, pk=pk)
        user = request.user

        if not order.employees.filter(id=user.id).exists():
            return Response({"error": "Unauthorized."}, status=403)

        if order.status != 'Rejected':
            return Response({"error": "Only rejected orders can be edited."}, status=400)

        serializer = TravelOrderSerializer(order, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=200)
        return Response(serializer.errors, status=400)


class CurrentUserView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        return Response({
            "id": user.id,
            "username": user.username,
            "user_level": user.user_level,
            "employee_type": user.employee_type
        })


class EmployeeListView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        users = CustomUser.objects.all()
        serializer = UserSerializer(users, many=True)
        return Response(serializer.data)

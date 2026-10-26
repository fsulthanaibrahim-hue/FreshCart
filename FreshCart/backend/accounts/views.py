
import os
import uuid
import logging

from django.conf import settings
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.db import transaction, IntegrityError

from google.auth.transport.requests import Request as GoogleRequest
from google.oauth2 import id_token
from google.auth.exceptions import GoogleAuthError

from rest_framework import generics, status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.models import Token

from .serializers import RegisterSerializer
from .models import Profile


logger = logging.getLogger(__name__)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class LoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response(
                {"error": "Username and password are required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user = authenticate(username=username, password=password)

        if user is None:
            return Response(
                {"error": "Invalid username or password"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        token, _ = Token.objects.get_or_create(user=user)

        return Response({
            "token": token.key,
            "username": user.username,
            "email": user.email,
        })


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        credential = request.data.get("credential")

        if not credential:
            return Response(
                {"error": "Google credential is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Read the Google OAuth Client ID from Django settings
        # or from the environment variable.
        client_id = (
            getattr(settings, "GOOGLE_CLIENT_ID", None)
            or os.environ.get("GOOGLE_CLIENT_ID")
        )

        if not client_id:
            logger.error("GOOGLE_CLIENT_ID is not configured.")
            return Response(
                {"error": "Google login is not configured on the server"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            google_user = id_token.verify_oauth2_token(
                credential,
                GoogleRequest(),
                audience=client_id,
            )

        except ValueError as error:
            # Log the reason, but never log the credential itself.
            logger.warning(
                "Google token verification failed: %s",
                str(error),
            )
            return Response(
                {
                    "error": "Google credential verification failed. "
                             "Check the server log and OAuth Client ID."
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except GoogleAuthError:
            logger.exception("Google authentication service error.")
            return Response(
                {"error": "Unable to verify Google login right now"},
                status=status.HTTP_502_BAD_GATEWAY,
            )

        except Exception:
            logger.exception("Unexpected error verifying Google credential.")
            return Response(
                {"error": "An unexpected Google login error occurred"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        email = google_user.get("email", "").strip().lower()
        email_verified = google_user.get("email_verified", False)
        google_subject = google_user.get("sub")
        full_name = google_user.get("name", "").strip()

        if (
            not email
            or email_verified is not True
            or not google_subject
        ):
            return Response(
                {"error": "Google account must have a verified email"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            with transaction.atomic():
                # Reuse an account with this verified email.
                user = User.objects.filter(email__iexact=email).first()

                if user is None:
                    username = email

                    # Avoid a username collision.
                    if User.objects.filter(username=username).exists():
                        username = f"google_{uuid.uuid4().hex[:12]}"

                    user = User.objects.create_user(
                        username=username,
                        email=email,
                        first_name=full_name[:150],
                    )

                # Ensure every user has a profile.
                Profile.objects.get_or_create(
                    user=user,
                    defaults={"phone": ""},
                )

                token, _ = Token.objects.get_or_create(user=user)

        except IntegrityError:
            logger.exception("Database conflict while creating Google user.")
            return Response(
                {"error": "Unable to create the Google account. Please retry."},
                status=status.HTTP_409_CONFLICT,
            )

        except Exception:
            logger.exception("Unable to complete Google login.")
            return Response(
                {"error": "Unable to complete Google login"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response({
            "token": token.key,
            "username": user.username,
            "email": user.email,
        })



class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        profile, _ = Profile.objects.get_or_create(
            user=request.user,
            defaults={"phone": ""},
        )

        return Response({
            "id": request.user.id,
            "username": request.user.username,
            "full_name": request.user.first_name,
            "email": request.user.email,
            "phone": profile.phone,
            "is_staff": request.user.is_staff,
            "is_superuser": request.user.is_superuser,
        })



from rest_framework import viewsets
from rest_framework.permissions import BasePermission, SAFE_METHODS

from .models import Product
from .serializers import ProductSerializer


class IsAdminOrReadOnly(BasePermission):
    """
    Anyone can view products.
    Only authenticated Django staff users can modify products.
    """

    def has_permission(self, request, view):
        if request.method in SAFE_METHODS:
            return True

        return (
            request.user
            and request.user.is_authenticated
            and request.user.is_staff
        )


class ProductViewSet(viewsets.ModelViewSet):
    queryset = Product.objects.all().order_by("id")
    serializer_class = ProductSerializer
    permission_classes = [IsAdminOrReadOnly]

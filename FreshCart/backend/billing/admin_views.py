
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.shortcuts import get_object_or_404

from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAdminUser
from rest_framework.response import Response

from products.models import Product
from products.serializers import ProductSerializer
from .models import Bill
from .serializers import BillSerializer


User = get_user_model()


# Admin dashboard statistics
@api_view(["GET"])
@permission_classes([IsAdminUser])
def admin_dashboard_stats(request):
    total_orders = Bill.objects.count()
    total_products = Product.objects.count()

    total_customers = User.objects.filter(
        is_staff=False,
        is_superuser=False,
    ).count()

    total_revenue = (
        Bill.objects.exclude(status="cancelled")
        .aggregate(total=Sum("total"))["total"]
        or 0
    )

    recent_orders = Bill.objects.order_by("-created_at")[:10]

    return Response({
        "total_orders": total_orders,
        "total_products": total_products,
        "total_customers": total_customers,
        "total_revenue": str(total_revenue),
        "recent_orders": BillSerializer(
            recent_orders,
            many=True,
        ).data,
    })


# List all orders and support updates through the collection endpoint
@api_view(["GET", "PATCH"])
@permission_classes([IsAdminUser])
def admin_orders(request):
    if request.method == "GET":
        orders = Bill.objects.order_by("-created_at")

        return Response(
            BillSerializer(orders, many=True).data
        )

    order_id = request.data.get("order_id")
    new_status = request.data.get("status")

    if not order_id:
        return Response(
            {"error": "Order ID is required."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    allowed_statuses = {
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    }

    if new_status not in allowed_statuses:
        return Response(
            {"error": "Invalid order status."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    order = get_object_or_404(Bill, pk=order_id)

    order.status = new_status
    order.save(update_fields=["status"])

    return Response(BillSerializer(order).data)


# Get or update one specific order
@api_view(["GET", "PATCH"])
@permission_classes([IsAdminUser])
def admin_order_detail(request, order_id):
    order = get_object_or_404(Bill, pk=order_id)

    if request.method == "GET":
        return Response(BillSerializer(order).data)

    new_status = request.data.get("status")

    allowed_statuses = {
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
    }

    if new_status not in allowed_statuses:
        return Response(
            {"error": "Invalid order status."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    order.status = new_status
    order.save(update_fields=["status"])

    return Response(BillSerializer(order).data)


# List products and create a product
@api_view(["GET", "POST"])
@permission_classes([IsAdminUser])
def admin_products(request):
    if request.method == "GET":
        products = Product.objects.all().order_by("id")

        return Response(
            ProductSerializer(products, many=True).data
        )

    serializer = ProductSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    serializer.save()

    return Response(
        serializer.data,
        status=status.HTTP_201_CREATED,
    )


# Get, update, or delete one specific product
@api_view(["GET", "PATCH", "DELETE"])
@permission_classes([IsAdminUser])
def admin_product_detail(request, product_id):
    product = get_object_or_404(Product, pk=product_id)

    if request.method == "GET":
        return Response(ProductSerializer(product).data)

    if request.method == "PATCH":
        serializer = ProductSerializer(
            product,
            data=request.data,
            partial=True,
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()

        return Response(serializer.data)

    product.delete()

    return Response(status=status.HTTP_204_NO_CONTENT)

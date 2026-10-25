import uuid
from decimal import Decimal, ROUND_HALF_UP

from django.db import transaction
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from products.models import Product
from .models import Bill, BillItem
from .serializers import BillSerializer


def money(value):
    return value.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_bill(request):
    items = request.data.get("items", [])

    if not isinstance(items, list) or not items:
        return Response(
            {"error": "Add at least one product to the bill."},
            status=status.HTTP_400_BAD_REQUEST,
        )

    customer_name = request.data.get("customer_name", "").strip()
    customer_phone = request.data.get("customer_phone", "").strip()

    with transaction.atomic():
        subtotal = Decimal("0.00")
        prepared_items = []
        quantities = {}

        for item in items:
            try:
                product_id = int(item["product"])
                quantity = int(item["quantity"])
            except (KeyError, TypeError, ValueError):
                return Response(
                    {"error": "Each item needs a valid product ID and quantity."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if quantity <= 0:
                return Response(
                    {"error": "Quantity must be greater than zero."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            quantities[product_id] = quantities.get(product_id, 0) + quantity

        products = {
            product.id: product
            for product in Product.objects.select_for_update().filter(
                id__in=quantities.keys(),
                is_available=True,
            )
        }

        for product_id, quantity in quantities.items():
            product = products.get(product_id)

            if product is None:
                return Response(
                    {"error": f"Product ID {product_id} was not found or is unavailable."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            if product.stock < quantity:
                return Response(
                    {"error": f"Not enough stock for {product.name}. Available: {product.stock}."},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            line_total = money(product.price * quantity)
            subtotal += line_total
            prepared_items.append((product, quantity, line_total))

        subtotal = money(subtotal)
        gst_amount = money(subtotal * Decimal("0.05"))
        total = money(subtotal + gst_amount)

        bill = Bill.objects.create(
            bill_number=f"FC-{uuid.uuid4().hex[:12].upper()}",
            user=request.user,
            customer_name=customer_name,
            customer_phone=customer_phone,
            subtotal=subtotal,
            gst_amount=gst_amount,
            total=total,
        )

        for product, quantity, line_total in prepared_items:
            BillItem.objects.create(
                bill=bill,
                product=product,
                quantity=quantity,
                price=product.price,
                line_total=line_total,
            )
            product.stock -= quantity
            product.save(update_fields=["stock"])

    return Response(
        BillSerializer(bill).data,
        status=status.HTTP_201_CREATED,
    )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def bill_history(request):
    bills = Bill.objects.filter(user=request.user).order_by("-created_at")
    return Response(BillSerializer(bills, many=True).data)

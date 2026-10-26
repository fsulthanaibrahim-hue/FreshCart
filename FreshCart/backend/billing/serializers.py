
from rest_framework import serializers
from .models import Bill, BillItem


class BillItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(
        source="product.name",
        read_only=True,
    )

    class Meta:
        model = BillItem
        fields = [
            "id",
            "product",
            "product_name",
            "quantity",
            "price",
            "line_total",
        ]


class BillSerializer(serializers.ModelSerializer):
    items = BillItemSerializer(many=True, read_only=True)

    class Meta:
        model = Bill
        fields = [
            "id",
            "bill_number",
            "customer_name",
            "customer_phone",
            "subtotal",
            "gst_amount",
            "total",
            "status",
            "created_at",
            "items",
        ]

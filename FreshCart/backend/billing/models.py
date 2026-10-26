
from django.db import models
from django.contrib.auth.models import User
from products.models import Product


class Bill(models.Model):
    class Status(models.TextChoices):
        PENDING = "pending", "Pending"
        PROCESSING = "processing", "Processing"
        SHIPPED = "shipped", "Shipped"
        DELIVERED = "delivered", "Delivered"
        CANCELLED = "cancelled", "Cancelled"

    bill_number = models.CharField(max_length=30, unique=True)

    user = models.ForeignKey(
        User,
        on_delete=models.PROTECT,
        related_name="bills",
    )

    customer_name = models.CharField(max_length=150, blank=True)
    customer_phone = models.CharField(max_length=15, blank=True)

    subtotal = models.DecimalField(max_digits=10, decimal_places=2)
    gst_amount = models.DecimalField(max_digits=10, decimal_places=2)
    total = models.DecimalField(max_digits=10, decimal_places=2)

    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDING,
    )

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.bill_number


class BillItem(models.Model):
    bill = models.ForeignKey(
        Bill,
        on_delete=models.CASCADE,
        related_name="items",
    )

    product = models.ForeignKey(
        Product,
        on_delete=models.PROTECT,
    )

    quantity = models.PositiveIntegerField()
    price = models.DecimalField(max_digits=10, decimal_places=2)
    line_total = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.product.name} x {self.quantity}"


from django.urls import path

from .admin_views import (
    admin_dashboard_stats,
    admin_orders,
    admin_order_detail,
    admin_products,
    admin_product_detail,
)

urlpatterns = [
    path(
        "dashboard/",
        admin_dashboard_stats,
        name="admin-dashboard",
    ),
    path(
        "orders/",
        admin_orders,
        name="admin-orders",
    ),
    path(
        "orders/<int:order_id>/",
        admin_order_detail,
        name="admin-order-detail",
    ),
    path(
        "products/",
        admin_products,
        name="admin-products",
    ),
    path(
        "products/<int:product_id>/",
        admin_product_detail,
        name="admin-product-detail",
    ),
]

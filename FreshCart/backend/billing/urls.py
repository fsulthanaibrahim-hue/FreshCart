from django.urls import path
from .views import create_bill, bill_history

urlpatterns = [
    path("checkout/", create_bill, name="create_bill"),
    path("history/", bill_history, name="bill_history"),
]

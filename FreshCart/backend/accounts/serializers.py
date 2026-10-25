
from django.contrib.auth.models import User
from rest_framework import serializers
from .models import Profile


class RegisterSerializer(serializers.ModelSerializer):
    full_name = serializers.CharField(max_length=150, write_only=True)
    phone = serializers.CharField(max_length=15, write_only=True)
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "full_name",
            "email",
            "phone",
            "password",
        ]

    def create(self, validated_data):
        full_name = validated_data.pop("full_name").strip()
        phone = validated_data.pop("phone")

        user = User(
            username=validated_data["username"],
            email=validated_data["email"],
            first_name=full_name,
        )
        user.set_password(validated_data["password"])
        user.save()

        Profile.objects.update_or_create(
            user=user,
            defaults={"phone": phone},
        )

        return user

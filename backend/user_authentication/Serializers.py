from django.contrib.auth.models import User
from rest_framework import serializers
from django.contrib.auth import authenticate
from rest_framework_simplejwt.tokens import RefreshToken
from .models import Profile

class SignupSerializer(serializers.ModelSerializer):
    lang = serializers.CharField()
    education = serializers.CharField()
    age = serializers.IntegerField()
    school = serializers.CharField()
    password = serializers.CharField(write_only=True)
    grades = serializers.ListField(
        child=serializers.CharField(max_length=20),
        required=True,
        allow_empty=False
    )
    profile_picture = serializers.ImageField(required=False, allow_null=True)  # Make it optional

    class Meta:
        model = User
        fields = ["id", "username", "email", "password", "first_name", "last_name",
                  "lang", "education", "age", "grades", "school", "profile_picture"]

    def create(self, validated_data):
        profile_picture = validated_data.pop('profile_picture', None)
        lang = validated_data.pop("lang")
        education = validated_data.pop("education")
        age = validated_data.pop("age")
        grades = validated_data.pop("grades")
        school = validated_data.pop("school")


        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data["email"],
            password=validated_data["password"],
            first_name=validated_data.get("first_name", ""),
            last_name=validated_data.get("last_name", ""),

        )


        Profile.objects.create(
            user=user,
            lang=lang,
            education=education,
            age=age,
            grades=grades,
            school=school,
            profile_picture=profile_picture
        )
        return user

class LoginSerializer(serializers.Serializer):
    username = serializers.CharField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        username = data.get("username")
        password = data.get("password")

        user = authenticate(username=username, password=password)

        if user is None:
            raise serializers.ValidationError("Invalid credentials")

        refresh = RefreshToken.for_user(user)

        return {
            "school_id": user.username,
            "email": user.email,
            "refresh": str(refresh),
            "access": str(refresh.access_token),
        }

class ProfileSerializer(serializers.ModelSerializer):

    email = serializers.EmailField(source="user.email", read_only=True)
    first_name = serializers.CharField(source="user.first_name", read_only=True)
    last_name = serializers.CharField(source="user.last_name", read_only=True)
    date_joined = serializers.DateTimeField(source="user.date_joined", read_only=True)
    last_login = serializers.DateTimeField(source="user.last_login", read_only=True)

    class Meta:
        model = Profile
        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "lang",
            "education",
            "age",
            "grades",
            "school",
            "profile_picture",
            "date_joined",
            "last_login",
        ]


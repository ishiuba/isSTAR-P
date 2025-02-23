from django.urls import path
from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("streaming", views.streaming, name="streaming"),
    path("about", views.about, name="about"),
    path("tos", views.tos, name="tos"),
    path("privacy", views.privacy, name="privacy"),
]
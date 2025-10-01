"""
Views for rendering template pages
"""

from django.shortcuts import render
from api.updates_service import get_updates
import logging

logger = logging.getLogger(__name__)


def index(request):
    return render(request, "pages/index.html")


def streaming(request):
    return render(request, "pages/streaming.html")


def about(request):
    return render(request, "pages/about.html")


def terms(request):
    return render(request, "pages/tos.html")


def privacy(request):
    return render(request, "pages/privacy.html")


def updates(request):
    try:
        updates_list = get_updates()
        return render(request, "pages/updates.html", {"updates": updates_list})
    except Exception as e:
        logger.exception("Error loading updates page")
        return render(request, "pages/updates.html", {"updates": []})


def test(request):
    return render(request, "test.html")

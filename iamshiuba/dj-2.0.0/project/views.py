from django.shortcuts import render
from django.urls import reverse


def get_default_title(path):
    """Get default English title for the page"""
    titles = {
        "index": "Homepage",
        "streaming": "Streaming",
        "about": "About",
        "tos": "Terms of Service",
        "privacy": "Privacy Policy",
    }

    # Remove leading/trailing slashes and get the first path segment
    clean_path = path.strip("/").split("/")[0]
    return titles.get(clean_path or "index", "iSHIUBA")


def index(request):
    return render(
        request, "pages/index.html", {"title": get_default_title(request.path)}
    )


def streaming(request):
    return render(
        request, "pages/streaming.html", {"title": get_default_title(request.path)}
    )


def about(request):
    return render(
        request, "pages/about.html", {"title": get_default_title(request.path)}
    )


def tos(request):
    return render(request, "pages/tos.html", {"title": get_default_title(request.path)})


def privacy(request):
    return render(
        request, "pages/privacy.html", {"title": get_default_title(request.path)}
    )

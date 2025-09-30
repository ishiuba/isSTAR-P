"""
Custom context processors for the project
"""

from datetime import datetime
from api.updates_service import get_updates
import logging

logger = logging.getLogger(__name__)


def current_year(request):
    """Inject current year into all templates"""
    return {"current_year": datetime.now().year}


def app_version(request):
    """Inject the latest version from updates into all templates"""
    # Mapping de prefixos para nomes de aplicação
    app_type_mapping = {
        "js": "JavaScript",
        "fl": "Flask",
        "dj": "Django"
    }
    
    try:
        updates_list = get_updates()
        if updates_list:
            # Pega o primeiro (mais recente) após ordenação
            latest_version = updates_list[0].get("version", "dj-3.0.0")
            
            # Extrair prefixo e versão (ex: "fl-2.3.18" -> "fl" e "2.3.18")
            if "-" in latest_version:
                prefix, version_number = latest_version.split("-", 1)
                app_name = app_type_mapping.get(prefix, "Django")
            else:
                # Se não tiver prefixo, assume Django
                app_name = "Django"
                version_number = latest_version
            
            return {
                "app_version": version_number,
                "app_name": app_name
            }
    except Exception as e:
        logger.error(f"Error fetching version from updates: {e}")
    
    # Fallback values
    return {
        "app_version": "3.0.0",
        "app_name": "Django"
    }

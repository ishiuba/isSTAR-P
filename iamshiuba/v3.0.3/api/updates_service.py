"""
Serviço para gerenciar updates do JSONBin
Centraliza a lógica de busca e cache de atualizações
"""

import os
import requests
import logging
from typing import List, Dict
from datetime import datetime, timedelta
from decouple import config
from .exceptions import UpdatesServiceError

logger = logging.getLogger(__name__)


class UpdatesService:
    """Serviço para gerenciar updates do JSONBin com cache"""

    def __init__(self):
        self.bin_id = config("JSONBIN_ID", default=None)
        self.access_key = config("JSONBIN_ACCESS_KEY", default=None)
        self._cache = None
        self._cache_expiry = None
        self.cache_duration = timedelta(minutes=15)  # Cache por 15 minutos

        if not self.bin_id or not self.access_key:
            raise UpdatesServiceError("JSONBin credentials are not configured")

    def _is_cache_valid(self) -> bool:
        """Verifica se o cache ainda é válido"""
        return (
            self._cache is not None
            and self._cache_expiry is not None
            and datetime.now() < self._cache_expiry
        )

    def get_updates(self) -> List[Dict]:
        """Busca updates do JSONBin com cache e ordenação por versão"""
        if self._is_cache_valid():
            logger.info("Returning cached updates")
            return self._cache

        try:
            # Add cache-busting timestamp
            import time

            timestamp = int(time.time())

            response = requests.get(
                f"https://api.jsonbin.io/v3/b/{self.bin_id}?_t={timestamp}",
                headers={
                    "X-Access-Key": self.access_key,
                    "X-Bin-Meta": "false",
                    "Cache-Control": "no-cache, no-store, must-revalidate",
                    "Pragma": "no-cache",
                },
                timeout=10,
            )
            response.raise_for_status()

            data = response.json()
            # A API pode retornar updates diretamente ou dentro de "record"
            if "updates" in data:
                updates = data["updates"]
            elif "record" in data and "updates" in data["record"]:
                updates = data["record"]["updates"]
            else:
                updates = []

            # Ordenação robusta por versão e tipo
            def version_sort_key(update):
                version = update.get("version", "dj-v0.0.0")
                try:
                    # Extrair prefixo e versão (ex: "fl-2.3.18" -> "fl", "2.3.18")
                    if "-" in version and len(version.split("-")) == 2:
                        prefix, version_clean = version.split("-", 1)
                    else:
                        prefix = "dj"  # Assume Django se não houver prefixo
                        version_clean = version.lstrip("v")
                    
                    # Converter para tupla numérico (ex: "2.3.18" -> (2, 3, 18))
                    parts = version_clean.lstrip("v").split(".")
                    version_tuple = tuple(int(part) for part in parts if part.isdigit())
                    
                    # Definir ordem de prioridade para prefixos
                    prefix_priority = {"js": 1, "fl": 2, "dj": 3}
                    prefix_order = prefix_priority.get(prefix, 99)  # 99 para desconhecidos
                    
                    return (prefix_order, version_tuple)
                except (ValueError, AttributeError, IndexError):
                    # Fallback para ordenação simples
                    return (999, (0, 0, 0))

            updates.sort(key=version_sort_key, reverse=True)

            # Cache the result
            self._cache = updates
            self._cache_expiry = datetime.now() + self.cache_duration

            logger.info(f"Loaded {len(updates)} updates from JSONBin")
            return updates

        except requests.RequestException as e:
            logger.error(f"Error fetching updates from JSONBin: {e}")
            raise UpdatesServiceError(f"Failed to fetch updates: {e}") from e
        except Exception as e:
            logger.error(f"Unexpected error processing updates: {e}")
            raise UpdatesServiceError(f"Failed to process updates: {e}") from e


# Singleton instance
_updates_service = None


def get_updates_service() -> UpdatesService:
    """Factory function para obter instância do serviço"""
    global _updates_service
    if _updates_service is None:
        _updates_service = UpdatesService()
    return _updates_service


def get_updates() -> List[Dict]:
    """Função de conveniência para obter updates"""
    service = get_updates_service()
    return service.get_updates()

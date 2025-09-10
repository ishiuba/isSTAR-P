"""
Serviço para integração com a API do YouTube
Carrega playlists dinamicamente do canal especificado
"""

import os
from googleapiclient.discovery import build
from googleapiclient.errors import HttpError
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json
from .exceptions import YouTubeServiceError

logger = logging.getLogger(__name__)


class YouTubeService:
    """Serviço para carregar playlists do YouTube usando a API oficial"""

    def __init__(self):
        self.api_key = os.getenv("YOUTUBE_API_KEY")
        self.channel_id = os.getenv("YOUTUBE_CHANNEL_ID")
        self.youtube = None
        self._cache = {}
        self._cache_expiry = {}
        self.cache_duration = timedelta(hours=1)  # Cache por 1 hora

        if not self.api_key:
            logger.error("YOUTUBE_API_KEY não encontrada nas variáveis de ambiente")
            raise ValueError("YOUTUBE_API_KEY é obrigatória")

        if not self.channel_id:
            logger.error("YOUTUBE_CHANNEL_ID não encontrada nas variáveis de ambiente")
            raise ValueError("YOUTUBE_CHANNEL_ID é obrigatória")

        try:
            self.youtube = build("youtube", "v3", developerKey=self.api_key)
            logger.info("Serviço do YouTube inicializado com sucesso")
        except Exception as e:
            logger.error(f"Erro ao inicializar serviço do YouTube: {e}")
            raise

    def _is_cache_valid(self, key: str) -> bool:
        """Verifica se o cache ainda é válido"""
        if key not in self._cache_expiry:
            return False
        return datetime.now() < self._cache_expiry[key]

    def _set_cache(self, key: str, data: any) -> None:
        """Define dados no cache com expiração"""
        self._cache[key] = data
        self._cache_expiry[key] = datetime.now() + self.cache_duration

    def _get_cache(self, key: str) -> Optional[any]:
        """Obtém dados do cache se válidos"""
        if self._is_cache_valid(key):
            return self._cache[key]
        return None

    def get_channel_playlists(self, max_results: int = 50) -> List[Dict]:
        """
        Carrega todas as playlists do canal

        Args:
            max_results: Número máximo de playlists para retornar

        Returns:
            Lista de dicionários com informações das playlists
        """
        cache_key = f"playlists_{self.channel_id}_{max_results}"

        # Verifica cache primeiro
        cached_data = self._get_cache(cache_key)
        if cached_data:
            logger.info("Retornando playlists do cache")
            return cached_data

        try:
            logger.info(f"Buscando playlists do canal {self.channel_id}")

            playlists = []
            next_page_token = None

            while len(playlists) < max_results:
                # Calcula quantos resultados buscar nesta página
                page_size = min(50, max_results - len(playlists))

                request = self.youtube.playlists().list(
                    part="snippet,contentDetails,status",
                    channelId=self.channel_id,
                    maxResults=page_size,
                    pageToken=next_page_token,
                )

                response = request.execute()

                for item in response.get("items", []):
                    # Filtra apenas playlists públicas
                    if item.get("status", {}).get("privacyStatus") == "public":
                        playlist_data = self._format_playlist_data(item)
                        playlists.append(playlist_data)

                # Verifica se há mais páginas
                next_page_token = response.get("nextPageToken")
                if not next_page_token:
                    break

            logger.info(f"Encontradas {len(playlists)} playlists públicas")

            # Salva no cache
            self._set_cache(cache_key, playlists)

            return playlists

        except HttpError as e:
            logger.error(f"YouTube API error: {e}")
            raise YouTubeServiceError(f"YouTube API error: {e.reason}") from e
        except Exception as e:
            logger.error(f"Unexpected error fetching playlists: {e}")
            raise YouTubeServiceError(f"Unexpected error: {e}") from e

    def _format_playlist_data(self, item: Dict) -> Dict:
        """
        Formata os dados da playlist para o formato esperado pelo frontend

        Args:
            item: Item da resposta da API do YouTube

        Returns:
            Dicionário formatado com dados da playlist
        """
        snippet = item.get("snippet", {})
        content_details = item.get("contentDetails", {})

        # Extrai thumbnail de melhor qualidade disponível
        thumbnails = snippet.get("thumbnails", {})
        thumbnail_url = None

        # Prioridade: maxres > high > medium > default
        for quality in ["maxres", "high", "medium", "default"]:
            if quality in thumbnails:
                thumbnail_url = thumbnails[quality]["url"]
                break

        return {
            "playlist_id": item["id"],
            "title": snippet.get("title", "Sem título"),
            "description": snippet.get("description", ""),
            "thumbnail_url": thumbnail_url,
            "published_at": snippet.get("publishedAt"),
            "video_count": content_details.get("itemCount", 0),
            "url": f"https://www.youtube.com/playlist?list={item['id']}",
            "embed_url": f"https://www.youtube.com/embed/videoseries?list={item['id']}",
            "channel_title": snippet.get("channelTitle", ""),
            "tags": snippet.get("tags", []),
            "default_language": snippet.get("defaultLanguage"),
            "platform": "youtube",
        }

    def get_playlist_details(self, playlist_id: str) -> Optional[Dict]:
        """
        Obtém detalhes específicos de uma playlist

        Args:
            playlist_id: ID da playlist

        Returns:
            Dicionário com detalhes da playlist ou None se não encontrada
        """
        cache_key = f"playlist_details_{playlist_id}"

        # Verifica cache primeiro
        cached_data = self._get_cache(cache_key)
        if cached_data:
            return cached_data

        try:
            request = self.youtube.playlists().list(
                part="snippet,contentDetails,status", id=playlist_id
            )

            response = request.execute()
            items = response.get("items", [])

            if not items:
                logger.warning(f"Playlist {playlist_id} não encontrada")
                return None

            playlist_data = self._format_playlist_data(items[0])

            # Salva no cache
            self._set_cache(cache_key, playlist_data)

            return playlist_data

        except HttpError as e:
            logger.error(f"Error fetching playlist details {playlist_id}: {e}")
            raise YouTubeServiceError(f"YouTube API error: {e.reason}") from e
        except Exception as e:
            logger.error(f"Unexpected error fetching playlist {playlist_id}: {e}")
            raise YouTubeServiceError(f"Unexpected error: {e}") from e

    def search_playlists(self, query: str, max_results: int = 20) -> List[Dict]:
        """
        Busca playlists do canal por termo de pesquisa

        Args:
            query: Termo de pesquisa
            max_results: Número máximo de resultados

        Returns:
            Lista de playlists que correspondem à pesquisa
        """
        if not query or len(query.strip()) < 2:
            return []

        # Busca todas as playlists e filtra localmente
        all_playlists = self.get_channel_playlists(max_results=100)

        query_lower = query.lower().strip()
        filtered_playlists = []

        for playlist in all_playlists:
            # Busca no título, descrição e tags
            title_match = query_lower in playlist.get("title", "").lower()
            desc_match = query_lower in playlist.get("description", "").lower()
            tags_match = any(
                query_lower in tag.lower() for tag in playlist.get("tags", [])
            )

            if title_match or desc_match or tags_match:
                filtered_playlists.append(playlist)

            if len(filtered_playlists) >= max_results:
                break

        logger.info(
            f"Encontradas {len(filtered_playlists)} playlists para a busca '{query}'"
        )
        return filtered_playlists

    def get_featured_playlist(self) -> Optional[Dict]:
        """
        Retorna uma playlist em destaque (a mais recente ou com mais vídeos)

        Returns:
            Dicionário com dados da playlist em destaque ou None
        """
        cache_key = "featured_playlist"

        # Verifica cache primeiro
        cached_data = self._get_cache(cache_key)
        if cached_data:
            return cached_data

        playlists = self.get_channel_playlists(max_results=20)

        if not playlists:
            return None

        # Ordena por número de vídeos (descendente) e depois por data de publicação
        featured = max(
            playlists,
            key=lambda p: (p.get("video_count", 0), p.get("published_at", "")),
        )

        # Salva no cache
        self._set_cache(cache_key, featured)

        return featured

    def get_channel_statistics(self) -> Optional[Dict]:
        """
        Obtém estatísticas do canal do YouTube

        Returns:
            Dicionário com estatísticas do canal ou None se erro
        """
        cache_key = "channel_statistics"

        # Verifica cache primeiro
        cached_data = self._get_cache(cache_key)
        if cached_data:
            return cached_data

        try:
            logger.info(f"Buscando estatísticas do canal {self.channel_id}")

            request = self.youtube.channels().list(
                part="statistics,snippet", id=self.channel_id
            )

            response = request.execute()
            items = response.get("items", [])

            if not items:
                logger.warning(f"Canal {self.channel_id} não encontrado")
                return None

            channel = items[0]
            statistics = channel.get("statistics", {})
            snippet = channel.get("snippet", {})

            # Formatar dados das estatísticas
            stats_data = {
                "view_count": int(statistics.get("viewCount", 0)),
                "subscriber_count": int(statistics.get("subscriberCount", 0)),
                "video_count": int(statistics.get("videoCount", 0)),
                "channel_title": snippet.get("title", ""),
                "channel_description": snippet.get("description", ""),
                "published_at": snippet.get("publishedAt", ""),
                "subscriber_count_hidden": statistics.get(
                    "hiddenSubscriberCount", False
                ),
            }

            # Salva no cache
            self._set_cache(cache_key, stats_data)

            logger.info(
                f"Estatísticas do canal carregadas: {stats_data['view_count']} views, {stats_data['subscriber_count']} subscribers"
            )

            return stats_data

        except HttpError as e:
            logger.error(f"HTTP error fetching channel statistics: {e}")
            raise YouTubeServiceError(f"YouTube API error: {e.reason}") from e
        except Exception as e:
            logger.error(f"Error fetching channel statistics: {e}")
            raise YouTubeServiceError(f"Unexpected error: {e}") from e

    def clear_cache(self) -> None:
        """Limpa todo o cache"""
        self._cache.clear()
        self._cache_expiry.clear()
        logger.info("Cache do YouTube limpo")


# Instância global do serviço
youtube_service = None


def get_youtube_service() -> YouTubeService:
    """
    Retorna a instância global do serviço do YouTube
    Cria uma nova instância se necessário
    """
    global youtube_service

    if youtube_service is None:
        try:
            youtube_service = YouTubeService()
        except Exception as e:
            logger.error(f"Erro ao criar serviço do YouTube: {e}")
            raise

    return youtube_service

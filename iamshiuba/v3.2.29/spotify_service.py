"""
Serviço para integração com a API do Spotify
Carrega álbuns dinamicamente do artista iamshiuba
"""

import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
import logging
from typing import List, Dict, Optional
from datetime import datetime, timedelta
import json

logger = logging.getLogger(__name__)


class SpotifyService:
    """Serviço para carregar álbuns do artista iamshiuba usando a API oficial"""

    def __init__(self):
        self.client_id = os.getenv('SPOTIFY_CLIENT_ID')
        self.client_secret = os.getenv('SPOTIFY_CLIENT_SECRET')
        self.artist_name = "iamshiuba"  # Nome do artista

        self.spotify = None
        self._cache = {}
        self._cache_expiry = {}
        self.cache_duration = timedelta(hours=1)  # Cache por 1 hora

        if not self.client_id:
            logger.error("SPOTIFY_CLIENT_ID não encontrada nas variáveis de ambiente")
            raise ValueError("SPOTIFY_CLIENT_ID é obrigatória")

        if not self.client_secret:
            logger.error("SPOTIFY_CLIENT_SECRET não encontrada nas variáveis de ambiente")
            raise ValueError("SPOTIFY_CLIENT_SECRET é obrigatória")

        # Usar Client Credentials (não precisa de autenticação do usuário)
        self.auth_manager = SpotifyClientCredentials(
            client_id=self.client_id,
            client_secret=self.client_secret
        )

        try:
            self.spotify = spotipy.Spotify(auth_manager=self.auth_manager)
            logger.info("Serviço do Spotify inicializado com sucesso (Client Credentials)")
        except Exception as e:
            logger.error(f"Erro ao inicializar serviço do Spotify: {e}")
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

    def get_artist_albums(self, max_results: int = 50) -> List[Dict]:
        """
        Carrega todos os álbuns do artista iamshiuba

        Args:
            max_results: Número máximo de álbuns para retornar

        Returns:
            Lista de dicionários com informações dos álbuns
        """
        cache_key = f"artist_albums_{self.artist_name}_{max_results}"

        # Verifica cache primeiro
        cached_data = self._get_cache(cache_key)
        if cached_data:
            logger.info(f"Retornando álbuns do {self.artist_name} do cache")
            return cached_data

        try:
            logger.info(f"Buscando álbuns do artista {self.artist_name} no Spotify")

            # Primeiro, buscar o artista
            search_results = self.spotify.search(
                q=f'artist:"{self.artist_name}"',
                type='artist',
                limit=1
            )

            if not search_results['artists']['items']:
                logger.warning(f"Artista {self.artist_name} não encontrado")
                return []

            artist = search_results['artists']['items'][0]
            artist_id = artist['id']

            logger.info(f"Artista encontrado: {artist['name']} (ID: {artist_id})")

            # Buscar álbuns do artista
            albums = []
            offset = 0
            limit = min(50, max_results)  # Spotify API limit is 50

            while len(albums) < max_results:
                # Ajustar limit para não exceder max_results
                current_limit = min(limit, max_results - len(albums))

                results = self.spotify.artist_albums(
                    artist_id,
                    album_type='album,single,compilation',
                    limit=current_limit,
                    offset=offset,
                    country='BR'  # Mercado brasileiro
                )

                if not results['items']:
                    break

                for item in results['items']:
                    album_data = self._format_album_data(item)
                    albums.append(album_data)

                # Verificar se há mais páginas
                if not results['next']:
                    break

                offset += current_limit

            logger.info(f"Encontrados {len(albums)} álbuns do {self.artist_name}")

            # Salva no cache
            self._set_cache(cache_key, albums)

            return albums

        except Exception as e:
            logger.error(f"Erro ao buscar álbuns do {self.artist_name}: {e}")
            return []

    def _format_album_data(self, item: Dict) -> Dict:
        """
        Formata os dados do álbum para o formato esperado pelo frontend

        Args:
            item: Item da resposta da API do Spotify

        Returns:
            Dicionário formatado com dados do álbum
        """
        # Extrai thumbnail de melhor qualidade disponível
        thumbnail_url = None
        if item.get('images'):
            # Pegar a primeira imagem (geralmente a de melhor qualidade)
            thumbnail_url = item['images'][0]['url']

        # Formatar data de lançamento
        release_date = item.get('release_date', '')
        release_year = ''
        if release_date:
            try:
                release_year = release_date.split('-')[0]
            except:
                release_year = release_date

        return {
            'playlist_id': item['id'],  # Manter compatibilidade com frontend
            'title': item.get('name', 'Sem título'),
            'description': f"Álbum • {release_year} • {item.get('total_tracks', 0)} faixas",
            'thumbnail_url': thumbnail_url,
            'video_count': item.get('total_tracks', 0),  # Número de faixas
            'url': item.get('external_urls', {}).get('spotify', ''),
            'embed_url': f"https://open.spotify.com/embed/album/{item['id']}",
            'artist': ', '.join([artist['name'] for artist in item.get('artists', [])]),
            'release_date': release_date,
            'release_year': release_year,
            'album_type': item.get('album_type', 'album'),
            'platform': 'spotify'
        }

    def get_album_details(self, album_id: str) -> Optional[Dict]:
        """
        Obtém detalhes específicos de um álbum

        Args:
            album_id: ID do álbum

        Returns:
            Dicionário com detalhes do álbum ou None se não encontrado
        """
        cache_key = f"album_details_{album_id}"

        # Verifica cache primeiro
        cached_data = self._get_cache(cache_key)
        if cached_data:
            return cached_data

        try:
            album = self.spotify.album(album_id)
            album_data = self._format_album_data(album)

            # Salva no cache
            self._set_cache(cache_key, album_data)

            return album_data

        except Exception as e:
            logger.error(f"Erro ao buscar detalhes do álbum {album_id}: {e}")
            return None

    def search_albums(self, query: str, max_results: int = 20) -> List[Dict]:
        """
        Busca álbuns do artista por termo de pesquisa

        Args:
            query: Termo de pesquisa
            max_results: Número máximo de resultados

        Returns:
            Lista de álbuns que correspondem à pesquisa
        """
        if not query or len(query.strip()) < 2:
            return []

        # Busca todos os álbuns e filtra localmente
        all_albums = self.get_artist_albums(max_results=100)

        query_lower = query.lower().strip()
        filtered_albums = []

        for album in all_albums:
            # Busca no título e descrição
            title_match = query_lower in album.get('title', '').lower()
            desc_match = query_lower in album.get('description', '').lower()

            if title_match or desc_match:
                filtered_albums.append(album)

            if len(filtered_albums) >= max_results:
                break

        logger.info(f"Encontrados {len(filtered_albums)} álbuns do {self.artist_name} para a busca '{query}'")
        return filtered_albums

    def get_featured_album(self) -> Optional[Dict]:
        """
        Retorna um álbum em destaque (o mais recente)

        Returns:
            Dicionário com dados do álbum em destaque ou None
        """
        cache_key = f"featured_album_{self.artist_name}"

        # Verifica cache primeiro
        cached_data = self._get_cache(cache_key)
        if cached_data:
            return cached_data

        albums = self.get_artist_albums(max_results=20)

        if not albums:
            return None

        # Ordena por data de lançamento (mais recente primeiro)
        try:
            featured = max(albums, key=lambda a: a.get('release_date', ''))
        except:
            # Se não conseguir ordenar por data, pega o primeiro
            featured = albums[0]

        # Salva no cache
        self._set_cache(cache_key, featured)

        return featured

    def clear_cache(self) -> None:
        """Limpa todo o cache"""
        self._cache.clear()
        self._cache_expiry.clear()
        logger.info("Cache do Spotify limpo")


# Instância global do serviço
spotify_service = None

def get_spotify_service() -> SpotifyService:
    """
    Retorna a instância global do serviço do Spotify
    Cria uma nova instância se necessário
    """
    global spotify_service

    if spotify_service is None:
        try:
            spotify_service = SpotifyService()
        except Exception as e:
            logger.error(f"Erro ao criar serviço do Spotify: {e}")
            raise

    return spotify_service

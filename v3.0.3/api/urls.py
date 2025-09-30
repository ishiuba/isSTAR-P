
from django.urls import path
from . import views

urlpatterns = [
    path("playlists/", views.PlaylistsView.as_view(), name="api-playlists"),
    path("playlists/youtube/", views.YouTubePlaylistsView.as_view(), name="api-playlists-youtube"),
    path(
        "playlists/youtube/<str:playlist_id>/",
        views.YouTubePlaylistDetailView.as_view(),
        name="api-playlist-detail",
    ),
    path("playlists/spotify/", views.SpotifyPlaylistsView.as_view(), name="api-playlists-spotify"),
    path(
        "playlists/spotify/<str:album_id>/",
        views.SpotifyAlbumDetailView.as_view(),
        name="api-album-detail",
    ),
    path("stats/spotify/", views.SpotifyStatsView.as_view(), name="api-spotify-stats"),
    path("stats/youtube/", views.YouTubeStatsView.as_view(), name="api-youtube-stats"),
    path("updates/", views.UpdatesView.as_view(), name="api-updates"),
]

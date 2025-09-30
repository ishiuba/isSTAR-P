# Documentação Técnica Detalhada - IamSHIUBA

## Arquivos de Configuração Core

### `manage.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/manage.py`
- **Função**: Ponto de entrada para comandos administrativos do Django
- **Funcionalidades**:
  - Define `DJANGO_SETTINGS_MODULE = 'project.settings'`
  - Executa comandos via `execute_from_command_line(sys.argv)`
  - Tratamento de erros para importações do Django
- **Comandos comuns**:
  ```bash
  python manage.py runserver    # Servidor de desenvolvimento
  python manage.py migrate     # Aplicar migrações
  python manage.py collectstatic # Coletar arquivos estáticos
  ```

### `project/settings.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/project/settings.py`
- **Função**: Configurações centrais do projeto Django
- **Configurações críticas**:
  - `SECRET_KEY`: Chave secreta (deve estar em `.env`)
  - `DEBUG`: Modo desenvolvimento/produção
  - `ALLOWED_HOSTS`: Domínios permitidos (inclui `.vercel.app` para deploy)
  - `INSTALLED_APPS`: Aplicações habilitadas
    - `django.contrib.*`: Apps padrão Django
    - `compressor`: Compressão de assets
    - `rest_framework`: API REST
    - `project` e `api`: Apps locais
- **Middleware configurado**:
  - `whitenoise.middleware.WhiteNoiseMiddleware`: Serve arquivos estáticos
  - Middlewares padrão de segurança, sessão, CSRF, auth
- **Banco de dados**: SQLite3 (`BASE_DIR / "db.sqlite3"`)
- **Arquivos estáticos**:
  - `STATIC_URL = "static/"`
  - `STATICFILES_DIRS = [BASE_DIR / "static"]`
  - `STATIC_ROOT = BASE_DIR / "staticfiles"`
- **Configurações de compressor**:
  - `COMPRESS_ENABLED`: Controlado por variável de ambiente
  - `STATICFILES_STORAGE`: WhiteNoise para produção

### `project/urls.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/project/urls.py`
- **Função**: Roteamento de URLs principais
- **Rotas definidas**:
  ```python
  urlpatterns = [
      path("admin/", admin.site.urls),                    # Django Admin
      path("", views.index, name="index"),               # Página inicial
      path("api/", include("api.urls")),                 # API REST
      path("streaming/", views.streaming, name="streaming"), # Página de streaming
      path("streaming/youtube/", views.streaming),        # Alias YouTube
      path("streaming/spotify/", views.streaming),        # Alias Spotify
      path("about/", views.about, name="about"),         # Sobre
      path("terms/", views.terms, name="terms"),         # Termos
      path("privacy/", views.privacy, name="privacy"),   # Privacidade
      path("updates/", views.updates, name="updates"),   # Updates
  ]
  ```
- **Arquivos estáticos em desenvolvimento**: Adiciona rota para static files quando `DEBUG=True`

### `project/views.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/project/views.py`
- **Função**: Views para páginas HTML (não-API)
- **Views implementadas**:
  - `index()`: Renderiza `pages/index.html`
  - `streaming()`: Renderiza `pages/streaming.html`
  - `about()`, `terms()`, `privacy()`: Páginas informativas
  - `updates()`: Busca updates via `get_updates()` e renderiza com contexto
- **Tratamento de erros**: Logging de exceções na página de updates

### `project/context_processors.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/project/context_processors.py`
- **Função**: Processadores de contexto para todos os templates
- **Processadores**:
  - `current_year()`: Ano atual em todos os templates
  - `app_version()`: Versão da aplicação via sistema de updates
    - Mapeia prefixos (`js`, `fl`, `dj`) para nomes de tecnologia
    - Extrai versão do primeiro update disponível
    - Fallback para `"3.0.0"` em caso de erro

## API e Serviços Externos

### `api/views.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/api/views.py`
- **Função**: Views da API REST usando Django REST Framework
- **Classes principais**:
  - `PlaylistsView`: Lista playlists YouTube/Spotify
    - Parâmetros: `platform`, `q` (query), `max_results`
    - Lógica de plataforma: YouTube por padrão, Spotify se especificado
  - `YouTubePlaylistsView`: Apenas playlists YouTube
  - `YouTubePlaylistDetailView`: Detalhes específicos de playlist
  - `SpotifyPlaylistsView`: Álbuns Spotify do artista
  - `SpotifyAlbumDetailView`: Detalhes de álbum específico
  - `SpotifyStatsView`: Estatísticas do Spotify
  - `YouTubeStatsView`: Estatísticas do YouTube
  - `UpdatesView`: Lista de atualizações
- **Tratamento de erros**: Exceções customizadas com logging detalhado
- **Função auxiliar**: `_resolve_max_results()` - Validação de parâmetros de paginação

### `api/youtube_service.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/api/youtube_service.py`
- **Função**: Integração com YouTube Data API v3
- **Classe `YouTubeService`**:
  - **Inicialização**: Requer `YOUTUBE_API_KEY` e `YOUTUBE_CHANNEL_ID`
  - **Cache**: 1 hora de duração com chaves específicas
  - **Métodos principais**:
    - `get_channel_playlists()`: Busca playlists do canal
    - `search_playlists()`: Pesquisa playlists por termo
    - `get_playlist_details()`: Detalhes completos de playlist
  - **Paginação**: Tratamento automático de `nextPageToken`
  - **Filtro**: Apenas playlists públicas
- **Dados retornados**: ID, título, descrição, thumbnails, contadores

### `api/spotify_service.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/api/spotify_service.py`
- **Função**: Integração com Spotify Web API
- **Classe `SpotifyService`**:
  - **Autenticação**: Client Credentials (sem necessidade de usuário)
  - **Requisitos**: `SPOTIFY_CLIENT_ID` e `SPOTIFY_CLIENT_SECRET`
  - **Cache**: 1 hora de duração
  - **Métodos principais**:
    - `get_artist_albums()`: Álbuns do artista `iamshiuba`
    - `search_albums()`: Pesquisa álbuns por termo
    - `get_album_details()`: Detalhes completos de álbum
- **Dados retornados**: ID, nome, artista, imagens, tracks, popularidade

### `api/updates_service.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/api/updates_service.py`
- **Função**: Gerenciamento de updates via JSONBin
- **Classe `UpdatesService`**:
  - **Requisitos**: `JSONBIN_ID` e `JSONBIN_ACCESS_KEY`
  - **Cache**: 15 minutos de duração
  - **Métodos**:
    - `get_updates()`: Busca e ordena updates por versão
  - **Ordenação**: Por versão (formato `prefix-version`)
  - **Tratamento**: Cache inteligente e fallbacks

### `api/exceptions.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/api/exceptions.py`
- **Função**: Exceções customizadas para serviços externos
- **Exceções definidas**:
  - `YouTubeServiceError`: Erros na API do YouTube
  - `SpotifyServiceError`: Erros na API do Spotify
  - `UpdatesServiceError`: Erros no serviço de updates

### `api/urls.py`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/api/urls.py`
- **Função**: Roteamento da API REST
- **URLs definidas**:
  ```python
  urlpatterns = [
      path("playlists/", views.PlaylistsView.as_view()),
      path("playlists/youtube/", views.YouTubePlaylistsView.as_view()),
      path("playlists/youtube/<str:playlist_id>/", views.YouTubePlaylistDetailView.as_view()),
      path("playlists/spotify/", views.SpotifyPlaylistsView.as_view()),
      path("playlists/spotify/<str:album_id>/", views.SpotifyAlbumDetailView.as_view()),
      path("stats/spotify/", views.SpotifyStatsView.as_view()),
      path("stats/youtube/", views.YouTubeStatsView.as_view()),
      path("updates/", views.UpdatesView.as_view()),
  ]
  ```

## Templates e Interface

### `templates/_base.html`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/templates/_base.html`
- **Função**: Template base com estrutura HTML comum
- **Elementos incluídos**:
  - Meta tags (description, keywords, theme-color)
  - Favicon e ícones touch
  - Links CDN (Font Awesome, Flag Icons)
  - CSS compilado (`output.css`)
  - Open Graph e Twitter Cards
  - Service Worker e PWA
- **JavaScript incluído**:
  - `CurrentPageLink.js`: Links ativos
  - `ThemeSelector.js`: Sistema de temas
  - `CounterAnimation.js`: Animações de contadores
  - `ImageOptimizer.js`: Otimização de imagens
  - `Translations.js`: Sistema multilíngue
  - `register-sw.js`: Registro do service worker

### `templates/pages/index.html`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/templates/pages/index.html`
- **Função**: Página inicial com seções principais
- **Seções**:
  - **Hero Section**: Apresentação com CTAs
  - **Highlight Section**: Vídeo em destaque (YouTube embed)
  - **Social Proof**: Estatísticas animadas
- **JavaScript específico**:
  - `highlights.js`: Gerenciamento do vídeo em destaque
  - `spotify-stats.js` e `youtube-stats.js`: Carregamento de estatísticas

### `templates/pages/streaming.html`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/templates/pages/streaming.html`
- **Função**: Interface dedicada para plataformas de streaming
- **Funcionalidades**:
  - Abas YouTube/Spotify
  - Controle de visualização (lista/grid)
  - Campo de busca
  - Carregamento dinâmico de conteúdo
- **JavaScript**: `EnhancedStreaming.js` para funcionalidades avançadas

### `templates/partials/navbar.html`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/templates/partials/navbar.html`
- **Função**: Navegação principal responsiva
- **Características**:
  - Logo e links principais
  - Menu mobile (hamburger)
  - Integração com sistema de tradução

## JavaScript Frontend

### `static/js/highlights.js`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/static/js/highlights.js`
- **Classe `HighlightManager`**:
  - Gerencia seção de destaque na página inicial
  - Carrega dados de playlist em destaque
  - Controle de iframe do YouTube
  - Sistema de retry em caso de erro

### `static/js/spotify-stats.js`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/static/js/spotify-stats.js`
- **Função**: Carrega e exibe estatísticas do Spotify
- **Funcionalidades**:
  - Fetch de dados via API
  - Animação de contadores
  - Tratamento de erros

### `static/js/youtube-stats.js`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/static/js/youtube-stats.js`
- **Função**: Carrega e exibe estatísticas do YouTube
- **Funcionalidades**:
  - Similar ao spotify-stats.js
  - Métricas específicas do YouTube (views, subscribers, etc.)

### `static/js/service-worker.js`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/static/js/service-worker.js`
- **Função**: Service Worker para funcionalidades PWA
- **Funcionalidades**:
  - Cache de recursos para offline
  - Estratégias de cache (stale-while-revalidate)
  - Sincronização em background

### `static/js/utils/`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/static/js/utils/`
- **CurrentPageLink.js**: Destaca link da página atual
- **ThemeSelector.js**: Sistema de temas (light/dark)
- **CounterAnimation.js**: Anima números de estatísticas
- **ImageOptimizer.js**: Lazy loading e otimização de imagens
- **Translations.js**: Sistema multilíngue com data-translate
- **EnhancedStreaming.js**: Funcionalidades avançadas da página de streaming

## Arquivos de Configuração

### `.env`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/.env`
- **Variáveis críticas**:
  ```env
  SECRET_KEY=django-insecure-chave-secreta
  DEBUG=True
  JSONBIN_ID=seu-bin-id
  JSONBIN_ACCESS_KEY=sua-access-key
  SPOTIFY_CLIENT_ID=seu-client-id
  SPOTIFY_CLIENT_SECRET=seu-client-secret
  YOUTUBE_API_KEY=sua-api-key
  YOUTUBE_CHANNEL_ID=seu-channel-id
  ```

### `vercel.json`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/vercel.json`
- **Configuração de deploy**:
  - Build: Python 3.9
  - Source: `project/wsgi.py`
  - Roteamento: Todas as rotas para Django

### `package.json`
**Localização**: `/home/sekieiyuugetsu/codigo/iamshiuba/package.json`
- **Dependências**:
  - `@tailwindcss/cli`: Compilador TailwindCSS
  - `tailwindcss`: Framework CSS
  - `flowbite`: Componentes UI
- **Scripts**:
  - `dev`: Watch mode para CSS

## Fluxo de Desenvolvimento

### 1. Configuração Inicial
```bash
# Instalar dependências
pip install -r requirements.txt
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com credenciais reais
```

### 2. Desenvolvimento
```bash
# Terminal 1: Servidor Django
python manage.py runserver

# Terminal 2: Compilação CSS
npm run dev

# Terminal 3: Coletar estáticos (quando necessário)
python manage.py collectstatic
```

### 3. Deploy
- **Plataforma**: Vercel (configurado automaticamente)
- **Build automático**: Triggered por pushes no repositório
- **Variáveis de ambiente**: Devem ser configuradas no painel Vercel

## Tratamento de Erros e Logging

- **Logging configurado** em todos os serviços externos
- **Exceções customizadas** para facilitar debugging
- **Cache inteligente** com fallbacks
- **Tratamento de quotas** das APIs externas
- **Retry automático** em falhas de rede

Esta documentação técnica fornece uma visão completa e detalhada de cada arquivo e sua função específica no projeto IamSHIUBA.

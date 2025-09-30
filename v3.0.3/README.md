# Documentação da Aplicação IamSHIUBA

## Visão Geral

Esta é uma aplicação web desenvolvida com **Django** para o artista **IamSHIUBA**. A aplicação funciona como um portfólio/site oficial que integra com plataformas de streaming (YouTube e Spotify) para exibir conteúdo musical, estatísticas e atualizações.

## Arquitetura e Tecnologias

### Backend
- **Framework**: Django 5.2.6
- **Linguagem**: Python
- **Banco de dados**: SQLite3 (arquivo `db.sqlite3`)
- **APIs externas**:
  - YouTube Data API v3
  - Spotify Web API
  - JSONBin (para sistema de updates)

### Frontend
- **Linguagem**: HTML5, CSS3, JavaScript
- **Framework CSS**: TailwindCSS 4.1.13
- **Bibliotecas**:
  - Flowbite 3.1.2 (componentes UI)
  - Font Awesome 6.6.0 (ícones)
  - PWA (Progressive Web App) com service worker

### Ferramentas de Desenvolvimento
- **Build**: TailwindCSS CLI para processamento de CSS
- **Dependências**: Gerenciadas via `package.json`
- **Deploy**: Configurado para Vercel

## Estrutura do Projeto

```
/home/sekieiyuugetsu/codigo/iamshiuba/
├── api/                          # Aplicação Django principal da API
│   ├── migrations/               # Migrações do banco de dados
│   ├── models.py                 # Modelos de dados (atualmente vazio)
│   ├── views.py                  # Views da API REST
│   ├── urls.py                   # URLs da API
│   ├── spotify_service.py        # Serviço para integração com Spotify
│   ├── youtube_service.py        # Serviço para integração com YouTube
│   ├── updates_service.py        # Serviço para gerenciar updates
│   └── exceptions.py             # Exceções customizadas
├── project/                      # Configurações principais do Django
│   ├── settings.py               # Configurações do projeto
│   ├── urls.py                   # URLs principais
│   ├── views.py                  # Views para páginas HTML
│   ├── context_processors.py     # Processadores de contexto
│   └── wsgi.py/asgi.py           # Configurações WSGI/ASGI
├── templates/                    # Templates HTML
│   ├── _base.html                # Template base
│   ├── pages/                    # Páginas principais
│   └── partials/                 # Componentes reutilizáveis
├── static/                       # Arquivos estáticos
└── requirements.txt              # Dependências Python
```

## Funcionalidades Principais

### 1. Página Inicial (`/`)
- **Hero Section**: Apresentação do artista com chamada para ação
- **Featured Content**: Exibe playlist em destaque (YouTube)
- **Social Proof**: Estatísticas animadas (tracks, vídeos, streams)
- **Integração**: Carrega dados dinâmicos via JavaScript

### 2. Streaming (`/streaming/`)
- Interface dedicada para plataformas de streaming
- Links para YouTube e Spotify
- Design responsivo com abas

### 3. Sobre (`/about/`)
- Página informativa sobre o artista
- Conteúdo multilíngue (internacionalização)

### 4. Updates (`/updates/`)
- Sistema de novidades/notícias
- Dados carregados dinamicamente via API
- Cache de 15 minutos para performance

### 5. API REST (`/api/`)

#### Endpoints Disponíveis:
- `GET /api/playlists/` - Lista playlists (YouTube/Spotify)
- `GET /api/playlists/youtube/` - Playlists do YouTube
- `GET /api/playlists/youtube/<playlist_id>/` - Detalhes de playlist específica
- `GET /api/playlists/spotify/` - Álbuns do Spotify
- `GET /api/playlists/spotify/<album_id>/` - Detalhes de álbum específico
- `GET /api/stats/spotify/` - Estatísticas do Spotify
- `GET /api/stats/youtube/` - Estatísticas do YouTube
- `GET /api/updates/` - Lista de atualizações

#### Parâmetros Comuns:
- `platform`: `youtube` ou `spotify`
- `q`: Query de busca
- `max_results`: Número máximo de resultados (padrão: 50, máximo: 100)

## Integrações Externas

### YouTube Data API
- **Arquivo**: `api/youtube_service.py`
- **Funcionalidades**:
  - Buscar playlists do canal
  - Pesquisar playlists por termo
  - Obter detalhes de playlist específica
  - Gerenciar autenticação e quotas

### Spotify Web API
- **Arquivo**: `api/spotify_service.py`
- **Funcionalidades**:
  - Buscar álbuns do artista
  - Pesquisar álbuns por termo
  - Obter estatísticas de streams
  - Gerenciar autenticação OAuth

### Sistema de Updates (JSONBin)
- **Arquivo**: `api/updates_service.py`
- **Funcionalidades**:
  - Cache inteligente (15 minutos)
  - Ordenação por versão
  - Tratamento de erros robusto

## Configuração e Variáveis de Ambiente

### Arquivo `.env`:
```env
SECRET_KEY=sua-chave-secreta-aqui
DEBUG=True/False
JSONBIN_ID=seu-bin-id
JSONBIN_ACCESS_KEY=sua-access-key
SPOTIFY_CLIENT_ID=seu-client-id
SPOTIFY_CLIENT_SECRET=seu-client-secret
YOUTUBE_API_KEY=sua-api-key
```

### Configurações no `settings.py`:
- **DEBUG**: Modo de desenvolvimento
- **ALLOWED_HOSTS**: Domínios permitidos
- **INSTALLED_APPS**: Aplicações habilitadas
- **MIDDLEWARE**: Middlewares configurados
- **STATIC_FILES**: Configurações de arquivos estáticos
- **COMPRESSOR**: Configurações de compressão

## Fluxo de Dados

### 1. Requisição de Página
```
Usuário → Django URL Router → View → Template → Frontend JavaScript
```

### 2. Carregamento de Dados Dinâmicos
```
Frontend JS → API Endpoint → External Service (YouTube/Spotify) → Response → Frontend
```

### 3. Sistema de Cache (Updates)
```
API → JSONBin → Cache (15min) → Response
```

## Recursos Frontend

### JavaScript Utilities (`static/js/utils/`):
- **CurrentPageLink.js**: Gerencia links ativos
- **ThemeSelector.js**: Sistema de temas
- **CounterAnimation.js**: Animações de contadores
- **ImageOptimizer.js**: Otimização de imagens
- **Translations.js**: Sistema multilíngue

### PWA (Progressive Web App):
- **Service Worker**: Cache offline
- **Manifest.json**: Configurações da app
- **Ícones**: Múltiplos tamanhos

## Deploy e Produção

### Vercel (`vercel.json`):
- **Build Command**: `python manage.py collectstatic --noinput`
- **Output Directory**: `staticfiles`
- **Install Command**: `pip install -r requirements.txt`

### Configurações de Produção:
- **COMPRESS_ENABLED**: Compressão de assets
- **DEBUG = False**: Modo produção
- **WhiteNoise**: Servir arquivos estáticos

## Desenvolvimento Local

### Pré-requisitos:
1. Python 3.x
2. Node.js (para TailwindCSS)
3. Virtual environment

### Passos:
```bash
# 1. Clonar e instalar dependências
python -m venv venv
source venv/bin/activate  # Linux/Mac
pip install -r requirements.txt

# 2. Instalar dependências Node.js
npm install

# 3. Configurar variáveis de ambiente
cp .env.example .env
# Editar .env com suas credenciais

# 4. Executar migrações
python manage.py migrate

# 5. Build do CSS (em outro terminal)
npm run dev

# 6. Executar servidor
python manage.py runserver
```

## Arquivos de Configuração Importantes

### `requirements.txt`:
```
asgiref==3.8.1
Django==5.2.6
django-compressor==4.5.1
djangorestframework==3.15.2
python-decouple==3.8
requests==2.32.3
```

### `package.json`:
```json
{
  "devDependencies": {
    "@tailwindcss/cli": "^4.1.13",
    "tailwindcss": "^4.1.13"
  },
  "dependencies": {
    "flowbite": "^3.1.2"
  }
}
```

## Considerações de Segurança

### Chaves de API:
- **YouTube API Key**: Deve estar em variável de ambiente
- **Spotify Credentials**: Client ID e Secret em ambiente
- **JSONBin**: ID e Access Key configurados

### Configurações de Produção:
- `DEBUG = False`
- `SECRET_KEY` segura
- `ALLOWED_HOSTS` configurado corretamente

## Estrutura de Templates

### Herança de Templates:
```
_base.html (layout geral)
├── pages/*.html (páginas específicas)
└── partials/*.html (componentes)
```

### Internacionalização:
- Sistema de tradução via JavaScript
- Textos traduzíveis marcados com `data-translate`
- Suporte a múltiplos idiomas

Este projeto representa uma aplicação web moderna e bem estruturada para portfólio de artista, com integração robusta com plataformas de streaming populares.

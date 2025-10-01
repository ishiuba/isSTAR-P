# IamSHIUBA - Projeto Multiplataforma

Este repositório contém todas as versões do projeto IamSHIUBA, implementado em três tecnologias diferentes: JavaScript Vanilla, Django e Flask. Cada implementação representa uma evolução do projeto, com diferentes abordagens e recursos.

## Visão Geral das Implementações

### 1. Vanilla JavaScript (v0.1.0 - v4.1.1)

A implementação original em JavaScript puro, evoluindo de uma simples página HTML para uma aplicação mais estruturada.

#### Características Principais:
- Desenvolvimento frontend puro com HTML, CSS e JavaScript
- Evolução de uma estrutura básica para componentes reutilizáveis
- Uso de Bootstrap para layout responsivo nas versões iniciais
- Implementação progressiva de recursos como internacionalização
- Organização modular de código com partials e componentes

#### Estrutura do Projeto (versão mais recente - v4.1.1):
```
src/
├── static/
│   ├── components/        # Componentes HTML reutilizáveis
│   ├── css/
│   │   ├── container/     # Estilos para containers
│   │   ├── components/    # Componentes CSS reutilizáveis
│   │   └── utils/         # Utilitários SCSS
│   ├── data/              # Dados em formato JSON
│   ├── img/               # Imagens e recursos gráficos
│   ├── js/                # Logica do app
│   └── translations/      # Arquivos de tradução
├── streaming.html         # Página de streaming
├── about.html             # Página sobre
├── articles.html          # Página de artigos
├── index.html             # Página principal
```

#### Como Executar:
Basta abrir o arquivo `index.html` em um navegador web ou usar um servidor local simples:
```bash
# Usando Python para criar um servidor local
cd iamshiuba/v4.1.1/
python -m http.server 8000

# Ou usando Node.js com http-server
npx http-server ./
```

### 2. Django (v1.0.0 - v3.0.3)

Migração para um framework backend robusto, com Django oferecendo um sistema completo para desenvolvimento web.

#### Características Principais:
- Framework MVC completo com Django
- Sistema de templates e herança de templates
- Configuração de admin Django para gerenciamento de conteúdo
- Sistema de migrações para gerenciamento de banco de dados
- Integração com django_{`compressor`, `rest_framework`}

#### Estrutura do Projeto (versão mais recente - v3.0.3):
```
v3.0.3/
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
│   ├── css/                      # Arquivos CSS
│   ├── img/                      # Arquivos de imagem
│   ├── js/                       # Arquivos JavaScript
│   └── playlists/                # Arquivos de playlists
├── staticfiles/                  # Arquivos estáticos coletados
└── requirements.txt              # Dependências Python
```

#### Como Executar:
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

### 3. Flask (v1.0.0 - v2.3.19)

A implementação atual, usando Flask como um framework mais leve e flexível, mantendo as funcionalidades principais.

#### Características Principais:
- Framework web leve e flexível
- Integração com Tailwind CSS e Flowbite para UI moderna
- Sistema de templates Jinja2
- Organização modular de código
- Recursos avançados de segurança (CORS, headers de segurança)
- Compressão de conteúdo e limitação de taxa
- Suporte a múltiplos idiomas
- Testes automatizados

#### Estrutura do Projeto (versão mais recente - v2.3.18):
```
v2.3.18/
├── blueprints/          # Rotas organizadas em blueprints
│   ├── __init__.py      # Inicialização dos blueprints
│   ├── main_routes.py   # Rotas da aplicação principal
│   └── api_routes.py    # Rotas da API
├── services/            # Camada de serviço
│   ├── __init__.py      # Inicialização dos serviços
│   ├── exceptions.py    # Exceções customizadas
│   ├── spotify_service.py 
│   ├── youtube_service.py
│   └── updates_service.py
├── static/                # Arquivos estáticos
│   ├── dist/              # Arquivos compilados (CSS/JS)
│   ├── img/               # Imagens e recursos gráficos
│   │   └── icons/         # Ícones do sistema
│   ├── js/                # JavaScript
│   │   └── utils/         # Utilitários JavaScript
│   ├── playlists/         # Dados de playlists
│   ├── scss/              # Arquivos SCSS
│   │   ├── components/    # Componentes SCSS
│   │   ├── container/     # Estilos para containers
│   │   └── utils/         # Utilitários SCSS
│   ├── src/               # Código-fonte para compilação
│   └── translations/      # Arquivos de tradução
├── templates/             # Templates HTML
│   ├── errors/            # Páginas de erro
│   ├── pages/             # Páginas principais
│   ├── partials/          # Componentes reutilizáveis
│   └── base.html          # Layout base
├── tests/                 # Testes automatizados
├── __init__.py            # Application Factory
├── app.py                 # Aplicação Flask principal
├── spotify_service.py     # Serviço para interagir com a API do Spotify
├── youtube_service.py     # Serviço para interagir com a API do YouTube
└── config.py              # Configurações da aplicação
```

#### Como Executar:
```bash
# Configurar ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt
npm install

# Compilar assets (se necessário)
npm run dev

# Iniciar servidor de desenvolvimento
python wsgi.py
```

## Comparação entre as Implementações

| Característica | JavaScript Vanilla | Django | Flask |
|----------------|-------------------|--------|-------|
| **Complexidade** | Baixa a Média | Alta | Média |
| **Escalabilidade** | Limitada | Excelente | Boa |
| **Velocidade de Desenvolvimento** | Rápida para projetos simples | Média (mais boilerplate) | Rápida e flexível |
| **Gerenciamento de Banco de Dados** | Manual/Inexistente | ORM integrado | Flexível (SQLAlchemy) |
| **Admin Backend** | Não | Sim, integrado | Não (precisa implementar) |
| **Segurança** | Básica | Robusta | Configurável |
| **Tamanho do Projeto** | Leve | Pesado | Leve a Médio |
| **Curva de Aprendizado** | Baixa | Alta | Média |

## Requisitos Técnicos

### Para JavaScript Vanilla
- Navegador web moderno
- Servidor web básico (opcional)

### Para Django
- Python 3.x
- Django 5.x
- Dependências listadas em `requirements.txt`
- Banco de dados SQLite (padrão) ou outro compatível
- Node.js (para TailwindCSS, Flowbite e outras dependências)

### Para Flask
- Python 3.x
- Flask 3.0.x
- Tailwind CSS
- Flowbite
- Dependências listadas em `requirements.txt`

## Desenvolvimento

### Configuração do Ambiente de Desenvolvimento Django (Atual)

1. Clone o repositório:
   ```bash
   git clone https://github.com/ishiuba/iamshiuba.git
   cd iamshiuba
   ```

2. Configure o ambiente virtual:
   ```bash
   python -m venv venv
   source venv/bin/activate  # No Windows: venv\Scripts\activate
   ```

3. Instale as dependências:
   ```bash
   pip install -r requirements.txt
   ```

4. Configure as variáveis de ambiente (`.env`):
   ```
   SPOTIFY_CLIENT_ID="sua-chave-cliente-spotify"
   SPOTIFY_CLIENT_SECRET="seu-client-secret-spotify"
   YOUTUBE_API_KEY="sua-chave-api-youtube"
   YOUTUBE_CHANNEL_ID="seu-id-de-canal-youtube"
   JSONBIN_ID="seu-id-do-jsonbin"
   JSONBIN_ACCESS_KEY="sua-chave-de-acesso-do-jsonbin"
   ```

5. Compile os assets CSS:
   ```bash
   npm run dev
   ```

6. Execute o servidor de desenvolvimento:
   ```bash
   python manage.py runserver
   ```

7. Acesse `http://localhost:8000` no navegador

### Testes

```bash
# Para a versão Flask
pytest tests/

# Para a versão Django
python manage.py test
```

## Recursos Adicionais

- [Documentação do Flask](https://flask.palletsprojects.com/)
- [Documentação do Django](https://docs.djangoproject.com/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Flowbite](https://flowbite.com/docs/getting-started/introduction/)
- [JSONBin](https://jsonbin.io/api-reference)
- [YouTube Data API](https://developers.google.com/youtube/v3)
- [Spotify Web API](https://developer.spotify.com/documentation/web-api)
- [Django Compressor](https://django-compressor.readthedocs.io/en/stable/)
- [Django Rest Framework](https://www.django-rest-framework.org/)
- [Decouple](https://github.com/henriquebastos/python-decouple)
- [WhiteNoise](https://whitenoise.readthedocs.io/en/stable/)

## Contribuição

Contribuições são bem-vindas! Por favor, siga estas etapas:

1. Fork o repositório
2. Crie uma branch para sua feature (`git checkout -b feature/nova-funcionalidade`)
3. Faça commit das suas mudanças (`git commit -am 'Adiciona nova funcionalidade'`)
4. Push para a branch (`git push origin feature/nova-funcionalidade`)
5. Crie um novo Pull Request

## Licença

Este projeto está licenciado sob a licença MIT - veja o arquivo LICENSE para detalhes.

## Contato

- GitHub: [@ishiuba](https://github.com/ishiuba)
- Telegram: [@contactishiubagithub](t.me/contactishiubagithub)

# IamSHIUBA - Projeto Multiplataforma

Este repositório contém todas as versões do projeto IamSHIUBA, implementado em três tecnologias diferentes: JavaScript Vanilla, Django e Flask. Cada implementação representa uma evolução do projeto, com diferentes abordagens e recursos.

## Visão Geral das Implementações

### 1. Vanilla JavaScript (v0.1.0 - v3.1.4)

A implementação original em JavaScript puro, evoluindo de uma simples página HTML para uma aplicação mais estruturada.

#### Características Principais:
- Desenvolvimento frontend puro com HTML, CSS e JavaScript
- Evolução de uma estrutura básica para componentes reutilizáveis
- Uso de Bootstrap para layout responsivo nas versões iniciais
- Implementação progressiva de recursos como internacionalização
- Organização modular de código com partials e componentes

#### Estrutura do Projeto (versão mais recente - v3.1.4):
```
src/
├── static/
│   ├── css/
│   │   ├── components/    # Componentes CSS reutilizáveis
│   │   └── container/     # Estilos para containers
│   ├── img/               # Imagens e recursos gráficos
│   ├── js/
│   │   └── utils/         # Utilitários JavaScript
│   ├── json/              # Dados em formato JSON
│   └── translations/      # Arquivos de tradução
└── index.html             # Página principal
```

#### Como Executar:
Basta abrir o arquivo `index.html` em um navegador web ou usar um servidor local simples:
```bash
# Usando Python para criar um servidor local
cd iamshiuba/v3.0.6
python -m http.server 8000

# Ou usando Node.js com http-server
npx http-server ./
```

### 2. Django (v1.3.18 - v2.0.27)

Migração para um framework backend robusto, com Django oferecendo um sistema completo para desenvolvimento web.

#### Características Principais:
- Framework MVC completo com Django
- Sistema de templates e herança de templates
- Aplicações modulares (home, videos, about, news, partials)
- Configuração de admin Django para gerenciamento de conteúdo
- Sistema de migrações para gerenciamento de banco de dados
- Integração com django_bootstrap5

#### Estrutura do Projeto (versão mais recente - v2.0.27):
```
v2.0.27/
├── layout/                # Componentes de layout
├── mywebsite/             # Configuração principal do Django
├── project/               # Aplicação principal
│   ├── migrations/        # Migrações de banco de dados
│   └── templates/         # Templates HTML
├── static/                # Arquivos estáticos
│   ├── css/               # Estilos CSS
│   ├── img/               # Imagens
│   ├── js/                # JavaScript
│   ├── playlists/         # Dados de playlists
│   └── translations/      # Arquivos de tradução
├── staticfiles/           # Arquivos estáticos coletados
└── manage.py              # Script de gerenciamento Django
```

#### Como Executar:
```bash
# Configurar ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Aplicar migrações
python manage.py migrate

# Iniciar servidor de desenvolvimento
python manage.py runserver
```

### 3. Flask (v2.1.28 - v3.2.19)

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

#### Estrutura do Projeto (versão mais recente - v3.2.19):
```
v3.2.19/
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
│   ├── base.html          # Layout base
│   ├── admin/             # Templates de administração
│   ├── errors/            # Páginas de erro
│   ├── pages/             # Páginas principais
│   └── partials/          # Componentes reutilizáveis
├── updates/               # Módulo para gerenciamento de atualizações
├── tests/                 # Testes automatizados
├── app.py                 # Aplicação Flask principal
└── config.py              # Configurações da aplicação
```

#### Como Executar:
```bash
# Configurar ambiente virtual
python -m venv venv
source venv/bin/activate  # No Windows: venv\Scripts\activate

# Instalar dependências
pip install -r requirements.txt

# Compilar assets (se necessário)
npx tailwindcss -i ./static/scss/input.scss -o ./static/dist/css/output.css

# Iniciar servidor de desenvolvimento
flask run
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

### Para Flask
- Python 3.x
- Flask 3.0.x
- Tailwind CSS
- Flowbite
- Dependências listadas em `requirements.txt`

## Desenvolvimento

### Configuração do Ambiente de Desenvolvimento Flask (Atual)

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

4. Configure as variáveis de ambiente (crie um arquivo `.env`):
   ```
   FLASK_APP=app.py
   FLASK_DEBUG=1
   ADMIN_PASSWORD=sua-chave-secreta
   ```

5. Compile os assets CSS:
   ```bash
   npx tailwindcss -i ./static/css/input.css -o ./static/dist/css/output.css --watch
   ```

6. Execute o servidor de desenvolvimento:
   ```bash
   flask run
   ```

7. Acesse `http://localhost:5000` no navegador

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

# iamshiuba Version History

Este documento fornece um registro detalhado das mudanças em todas as versões do projeto iamshiuba, baseado na análise da estrutura real dos diretórios e arquivos.

## Versões Vanilla JavaScript

### v0.1.0 (PreAlpha JS)
- Implementação inicial com HTML, CSS e JavaScript básicos
- Estrutura simples com Bootstrap 5.3.3
- Navegação básica com navbar
- Páginas: index.html, videos.html, about.html
- Layout responsivo básico

### v0.2.2 (PreAlpha2025 JS)
- Estrutura de diretórios melhorada
- Organização em pastas: css, js, templates
- Separação de componentes em partials
- Estrutura CSS com containers e partials
- Melhorias na navegação

### v1.0.0 (Alpha JS)
- Adição de pasta de imagens
- Novos idiomas (Português e Japonês)
- Navegação de páginas usando carousel

### v1.1.4 (Alpha2025 JS)
- Substituição do Framework Bootstrap 5 pelo TailwindCSS 4 + Flowbite Library
- Componente de navegação, Botão seletor de idiomas e Icones de redes sociais aprimorados

### v2.0.0 (Beta JS)
- Melhorias na organização de arquivos
- Adição de botão de alternância de tema
- Seção de destaques na página inicial
- Botões para colapsar cabeçalho e rodapé
- Pequenas melhorias na estrutura de arquivos estáticos

### v2.1.3 (Beta2025 JS)
- Melhorias no design e usabilidade
- Pequenas correções e melhorias

### v2.1.6 (jsa1)
- Pequenas correções e melhorias

### v2.1.15 (jsb1)
- Adição da página de Notícias
- Pequenas correções e melhorias

### v3.0.0 (jsb2)
- Página de Notícias substituída por página de Artigos
- Remoção da página de Streaming
- Adição de Termos de Serviço e Política de Privacidade
- Adição de favicon
- Paleta de cores atualizada
- Pequenas correções e melhorias

### v4.0.0 (jsc1)
- Bootstrap 5 substituído pelo TailwindCSS 4
- Melhorias significativas no design do website
- Adição de página de Streaming
- Buscador de vídeos do YouTube e músicas do Spotify
- Adição de menu mobile para dispositivos móveis
- Pequenas correções e melhorias

### v4.1.0 (jsc2)
- Melhorias no design e usabilidade (originário da versão v3.2.25)
- Pequenas correções e melhorias

### v4.1.1 (jsc3)
- Codigo levemente refatorado
- pequenas correções e melhorias

## Versões Django

### v1.0.0 (dj2024v1)
- Primeira implementação com Django
- Pequnas correções e melhorias (originário da versão STARb2)

### v2.0.0 (dj2024v2)
- Evolução da versão v1.3.18
- Novos idiomas (Russo e Hindi)
- Adição de tema personalizado (Ano Novo 2025)
- Pequenas correções e melhorias

### v3.0.3 (dj20250919)
- Melhorias no design e usabilidade (Tem tudo do F20250729, só que é Django)
- Pequenas correções e melhorias


## Versões Flask

### v1.0.0 (F202501)
- Primeira implementação com Flask
- Pequenas correções e melhorias (originário da versão STARdj2)

### v2.0.0 (F202502)
- Versão atualizada da v2.1.28
- Redesign de 3ª geração
- Novo idioma (Chinês)
- Pequenas correções e melhorias

### v2.0.1 (F202502-latest)
- Patch da v3.0.5
- Correções e melhorias incrementais

### v2.1.2 (F202503)
- Melhorias no design e usabilidade (originário da versão jsc1)
- Pequenas correções e melhorias

### v2.2.0 (F202504)
- Adição de componentes Flowbite
- Implementação de PWA (App Instalável)
- Novo uso de temas (Claro, Escuro e Vermelho)
- Pequenas correções e melhorias

### v2.3.0 (F202505)
- Novo tema (Preto)
- Seção de versões substituída por uma página de Atualizações
- Correções e melhorias incrementais


### v2.3.10 (F202506)
- Melhor integração com APIs externas (YouTube e Spotify)
- Correções e melhorias incrementais

### v2.3.17 (F20250716)
Tema e Navbar
- Atualização das cores do tema.
- Ajuste na estrutura da navbar.
- Remoção do logo da navbar.

HTML e Estrutura
- Ajustes na estrutura do HTML.

Estilos e SCSS
- Ajuste no brilho de elementos com hover para 1.2.
- Refatoração de estilos SCSS.
- Atualização das classes de botões.

Limpeza de Código
- Remoção de arquivos de template desnecessários.

### v2.3.18 (F20250729)

Navbar e ícones sociais:
- Adição de novas classes utilitárias CSS.
- Ajuste dos estilos dos ícones sociais, incluindo aplicação de flex-wrap.
- Remoção de estilos de hover desnecessários.

Footer e links:
- Ajuste de estilos do footer e da navbar.
- Inclusão de links de streaming de música no footer.

Tema e cores:
- Ajuste e atualização de cores do tema.
- Alteração de cores de destaque e bordas nos campos de busca.
- Refatoração de estilos do tema.
- Remoção de comentários desnecessários em templates.

### v2.3.19 (F20250819)

#### Refatoração Completa da Arquitetura
Estrutura Modular:

- Implementação do padrão Application Factory em `__init__.py`
- Criação de blueprints para organização de rotas (`main_routes.py`, `api_routes.py`)
- Reorganização dos serviços em diretório services/ dedicado
- Simplificação do app.py para wrapper de compatibilidade (487→22 linhas)

Melhorias nos Serviços:
- Criação de exceções customizadas (YouTubeServiceError, SpotifyServiceError, UpdatesServiceError)
- Implementação do UpdatesService centralizado com cache inteligente
- Correção da estrutura de resposta da API JSONBin
- Tratamento robusto de erros com códigos HTTP apropriados

Frontend Aprimorado:

- Remoção de valores hardcoded do `highlights.js`
- Implementação de data attributes para playlist ID dinâmico
- Melhoria no fluxo de dados backend→frontend

Performance e Qualidade:

- Validação de parâmetros de entrada nas APIs
- Cache de 15 minutos para updates com cache-busting
- Eliminação completa de duplicação de código
- Manutenção de 100% compatibilidade com versões anteriores


## Observações sobre a Evolução do Projeto

- Evolução de uma simples página HTML para uma aplicação Django completa
- Transição por diferentes frameworks: Vanilla JS → Django → Flask → Django
- Melhoria constante na organização de arquivos e estrutura de diretórios
- Adição progressiva de recursos de segurança e desempenho
- Implementação de internacionalização e suporte a múltiplos idiomas
- Evolução para arquitetura mais modular e manutenível

---

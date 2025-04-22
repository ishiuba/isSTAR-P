# iamshiuba Version History

Este documento fornece um registro detalhado das mudanças em todas as versões do projeto iamshiuba, baseado na análise da estrutura real dos diretórios e arquivos.

## Versões Vanilla JavaScript

### v0.1.0 (PreAlpha)
- Implementação inicial com HTML, CSS e JavaScript básicos
- Estrutura simples com Bootstrap 5.3.3
- Navegação básica com navbar
- Páginas: index.html, videos.html, about.html
- Layout responsivo básico

### v0.1.2 (PreAlpha2025)
- Estrutura de diretórios melhorada
- Organização em pastas: css, js, templates
- Separação de componentes em partials
- Estrutura CSS com containers e partials
- Melhorias na navegação

### v0.2.7 (Alpha)
- Adição de pasta de imagens
- Melhorias na estrutura JavaScript
- Aprimoramento do CSS
- Melhor organização de assets

### v1.0.11 (Beta)
- Reorganização para estrutura static/
- Separação clara de CSS, JS e imagens
- Melhorias na organização de arquivos
- Implementação de componentes reutilizáveis

### v1.1.2 (STARa1)
- Introdução de partials como componentes separados
- Melhorias na estrutura de arquivos estáticos
- Organização mais modular do código

### v1.2.7 (STARb1)
- Continuação da arquitetura de partials
- Melhorias na estrutura de arquivos estáticos
- Refinamentos na organização do código

### v1.3.5 (STARb2)
- Adição de suporte a traduções (pasta json/translations)
- Componentes CSS aprimorados
- Melhorias na estrutura de arquivos estáticos
- Versão de produção estável

### v3.0.4 (STARc1)
- Reorganização completa com estrutura src/
- Componentes CSS mais avançados
- Utilitários JavaScript (pasta js/utils)
- Suporte a traduções aprimorado
- Estrutura de containers CSS

## Versões Django

### v1.3.18 (STARdj1)
- Primeira implementação com Django
- Estrutura de aplicações Django: home, videos, about, news, partials
- Sistema de templates Django
- Configuração de arquivos estáticos e staticfiles
- Configuração básica de banco de dados SQLite
- Uso do django_bootstrap5
- Migrações para cada aplicação

### v2.0.27 (STARdj2)
- Estrutura Django aprimorada
- Novas aplicações: project, layout
- Melhor organização de templates
- Componentes CSS avançados
- Suporte a playlists e traduções
- Melhorias na estrutura de arquivos estáticos
- Configuração de staticfiles aprimorada

## Versões Flask

### v2.1.28 (PySTAR202501)
- Migração para Flask
- Estrutura myapp/ para organização do código
- Templates organizados em pages e partials
- Arquivos estáticos com componentes CSS
- Suporte a playlists e traduções

### v3.0.5 (PySTAR202502)
- Estrutura Flask aprimorada
- Adição de templates de erro
- Implementação de testes
- Melhor organização de templates e partials

### v3.0.6 (PySTAR202502-latest)
- Versão atualizada da v3.0.5
- Correções e melhorias incrementais
- Mantém a mesma estrutura básica da v3.0.5

### v3.1.7 (PySTAR202503)
- Adição de pasta dist para arquivos compilados
- Utilitários JavaScript (pasta js/utils)
- Estrutura CSS com containers
- Melhorias nos testes
- Organização aprimorada de arquivos estáticos

### v3.2.12 (PySTAR202504)
- Versão Flask atual de produção
- Migração para SCSS (pasta scss/)
- Estrutura avançada com utils, components e containers
- Pasta de ícones dedicada
- Implementação de compressão e limitação de taxa
- Middleware de proxy e segurança avançada
- Headers de segurança e CORS
- Modo de manutenção
- Tratamento de erros aprimorado
- Validação de códigos de idioma
- Endpoint de verificação de saúde

## Observações sobre a Evolução do Projeto

- Evolução de uma simples página HTML para uma aplicação Flask completa
- Transição por diferentes frameworks: Vanilla JS → Django → Flask
- Melhoria constante na organização de arquivos e estrutura de diretórios
- Adição progressiva de recursos de segurança e desempenho
- Implementação de internacionalização e suporte a múltiplos idiomas
- Evolução para arquitetura mais modular e manutenível

---

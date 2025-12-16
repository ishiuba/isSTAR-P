# 📦 isUpdate - Serviço de Atualizações

Aplicação Express com SQLite para gerenciar e exportar atualizações de software.

## 🎯 O que faz

Esta aplicação busca atualizações do JSONBin, armazena em um banco SQLite local e disponibiliza uma API REST para consumo externo.

## 📋 Requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🚀 Instalação

1. Entre no diretório do projeto:

```bash
cd isupdate
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.exemplo .env
```

4. Edite o arquivo `.env` com suas credenciais:

```
JSONBIN_ID=seu_bin_id_aqui
JSONBIN_ACCESS_KEY=sua_chave_de_acesso_aqui
PORTA=3000
DURACAO_CACHE_MINUTOS=15
```

## ▶️ Como Executar

### Modo normal:

```bash
npm run iniciar
```

### Modo desenvolvimento (com auto-reload):

```bash
npm run dev
```

O servidor vai iniciar em `http://localhost:3000`

## 🖥️ Interface de Administração

Acesse `http://localhost:3000/admin.html` no navegador para gerenciar as atualizações através de uma interface gráfica com tema escuro.

### Funcionalidades:

- ➕ Adicionar novas atualizações manualmente
- ✏️ Editar atualizações existentes
- 🗑️ Deletar atualizações
- 📋 Visualizar todas as atualizações em tabela
- 🔄 Sincronizar com JSONBin
- ♻️ Recarregar dados

## 📡 Endpoints da API

### 1. Página Inicial

```
GET /
```

Retorna informações sobre a API e lista de endpoints disponíveis.

### 2. Listar Todas as Atualizações

```
GET /api/atualizacoes
```

Retorna todas as atualizações ordenadas por versão.

**Resposta:**

```json
{
  "sucesso": true,
  "total": 10,
  "atualizacoes": [...]
}
```

### 3. Buscar Atualização por Versão

```
GET /api/atualizacoes/:versao
```

Busca uma atualização específica pela versão.

**Exemplo:**

```
GET /api/atualizacoes/fl-2.3.18
```

**Resposta:**

```json
{
  "sucesso": true,
  "atualizacao": {
    "id": 1,
    "versao": "fl-2.3.18",
    "titulo": "Nova versão",
    "conteudo": "Descrição da atualização",
    "link_preview": "https://...",
    "prefixo": "fl",
    "data_criacao": "2024-01-01 10:00:00",
    "data_atualizacao": "2024-01-01 10:00:00"
  }
}
```

### 4. Buscar Atualizações por Prefixo

```
GET /api/atualizacoes/prefixo/:prefixo
```

Retorna todas as atualizações de um prefixo específico (js, fl, dj).

**Exemplo:**

```
GET /api/atualizacoes/prefixo/fl
```

### 5. Sincronizar com JSONBin

```
POST /api/sincronizar
```

Força uma sincronização imediata com o JSONBin e atualiza o banco de dados.

**Resposta:**

```json
{
  "sucesso": true,
  "mensagem": "Atualizações sincronizadas com sucesso"
}
```

### 6. Exportar Dados

```
GET /api/exportar
```

Exporta todos os dados do banco em formato JSON para consumo externo.

**Resposta:**

```json
{
  "sucesso": true,
  "total": 10,
  "dados": [...],
  "exportadoEm": "2024-01-01T10:00:00.000Z"
}
```

### 7. Estatísticas

```
GET /api/estatisticas
```

Retorna estatísticas sobre as atualizações armazenadas.

**Resposta:**

```json
{
  "sucesso": true,
  "estatisticas": {
    "total": 10,
    "porPrefixo": {
      "js": 3,
      "fl": 5,
      "dj": 2
    }
  }
}
```

### 8. Adicionar Atualização

```
POST /api/atualizacoes
```

Adiciona uma nova atualização diretamente no banco de dados.

**Body:**

```json
{
  "version": "fl-2.3.19",
  "title": "Nova atualização",
  "content": "Descrição da atualização",
  "preview_link": "https://exemplo.com" // opcional
}
```

**Resposta:**

```json
{
  "sucesso": true,
  "mensagem": "Atualização adicionada com sucesso",
  "id": 15
}
```

### 9. Deletar Atualização

```
DELETE /api/atualizacoes/:id
```

Remove uma atualização do banco de dados.

**Exemplo:**

```
DELETE /api/atualizacoes/15
```

**Resposta:**

```json
{
  "sucesso": true,
  "mensagem": "Atualização deletada com sucesso"
}
```

## 🔄 Como Consumir em Aplicações Externas

### JavaScript/Node.js

```javascript
const axios = require("axios");

async function buscarAtualizacoes() {
  const resposta = await axios.get("http://localhost:3000/api/atualizacoes");
  return resposta.data.atualizacoes;
}
```

### Python

```python
import requests

def buscar_atualizacoes():
    resposta = requests.get('http://localhost:3000/api/atualizacoes')
    return resposta.json()['atualizacoes']
```

### cURL

```bash
curl http://localhost:3000/api/atualizacoes
```

## 🗄️ Estrutura do Banco de Dados

Tabela: `atualizacoes`

| Campo            | Tipo     | Descrição                             |
| ---------------- | -------- | ------------------------------------- |
| id               | INTEGER  | Identificador único                   |
| versao           | TEXT     | Versão da atualização (ex: fl-2.3.18) |
| titulo           | TEXT     | Título da atualização                 |
| conteudo         | TEXT     | Descrição/conteúdo                    |
| link_preview     | TEXT     | Link para preview (opcional)          |
| prefixo          | TEXT     | Prefixo da versão (js, fl, dj)        |
| data_criacao     | DATETIME | Data de criação                       |
| data_atualizacao | DATETIME | Data da última atualização            |

## ⚙️ Funcionamento

1. Ao iniciar, o servidor conecta ao banco SQLite
2. Busca atualizações do JSONBin
3. Armazena no banco de dados local
4. Mantém cache em memória por 15 minutos (configurável)
5. Disponibiliza API REST para consulta
6. Permite exportação completa dos dados

### 🛡️ Sistema de Fallback Automático

A aplicação possui um sistema robusto de fallback:

1. **Primeira tentativa**: Busca dados do JSONBin (fonte principal)
2. **Se JSONBin falhar**: Automaticamente busca do banco SQLite local
3. **Resultado**: Sua API continua funcionando mesmo se o JSONBin estiver fora do ar

Isso garante alta disponibilidade - enquanto houver dados no banco local, a API responde normalmente!

## 🛠️ Estrutura de Arquivos

```
isupdate/
├── servidor.js              # Servidor Express principal
├── servicoAtualizacoes.js   # Lógica de busca e cache
├── bancoDados.js            # Operações com SQLite
├── package.json             # Dependências
├── .env                     # Configurações (não versionado)
├── .env.exemplo             # Exemplo de configuração
├── atualizacoes.db          # Banco SQLite (criado automaticamente)
├── public/
│   ├── admin.html          # Interface de administração
│   └── admin.js            # Lógica da interface
├── testarFallback.js       # Script de teste
└── COMO_USAR.md            # Esta documentação
```

## 📝 Notas

- O cache em memória evita requisições excessivas ao JSONBin
- O banco SQLite permite consultas rápidas e offline
- **Fallback automático**: Se JSONBin falhar, usa dados do banco local
- Todas as respostas incluem CORS habilitado
- A sincronização inicial acontece ao iniciar o servidor
- Use `/api/sincronizar` para forçar atualização manual
- A API continua funcionando mesmo se o JSONBin estiver indisponível

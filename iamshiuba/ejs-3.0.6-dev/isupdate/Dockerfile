# Usar imagem Alpine (mais leve)
FROM node:24-alpine

# Criar diretório da aplicação
WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production

# Copiar código da aplicação
COPY . .

# Expor porta (Fly.io usa PORT dinâmico)
EXPOSE 3000

# Comando para iniciar o servidor
CMD ["node", "servidor.js"]
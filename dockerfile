# Base Playwright (Chromium e dependências já incluídos)
FROM mcr.microsoft.com/playwright:v1.46.0-jammy

WORKDIR /app
COPY package*.json ./
RUN npm ci --silent

# A imagem base já deve ter o Chromium instalado, mas mantemos o install para segurança (se necessário)
# RUN npx playwright install --with-deps chromium

COPY . .

# Build da extensão para dist/ (copia arquivos e gera o ZIP)
# O script de build é necessário para criar o diretório 'dist' que será usado para carregar a extensão.
RUN node scripts/build-extension.mjs

CMD ["npm","test"]
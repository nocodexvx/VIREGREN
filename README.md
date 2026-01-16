# VariaGen - SaaS Video & AI Platform

**Documentação Técnica para Deploy e Infraestrutura**

Este documento detalha a arquitetura, requisitos e passos para deploy do VariaGen. Use este guia para configurar o ambiente de produção em uma VPS (Hostinger, DigitalOcean, AWS, etc).

---

## 1. 🏗️ Arquitetura do Sistema

O VariaGen é um SaaS monolítico híbrido composto por:
1.  **Backend (Node.js/Express)**: API REST que gerencia usuários, pagamentos e processamento de vídeo.
2.  **Frontend (React/Vite)**: SPA servida estaticamente ou via SSR (atualmente build estático).
3.  **Processamento de Mídia**: Utiliza `ffmpeg` no servidor para manipular vídeos (CPU Intensive).
4.  **Banco de Dados**: Supabase (PostgreSQL) para persistência de dados e autenticação.
5.  **Pagamentos**: Integração via Webhooks com SyncPay (PIX).

### 🚨 Requisito Crítico: Disco Persistente
O sistema salva arquivos temporários (`uploads/`) e processados (`outputs/`) no disco local antes de gerar o ZIP final.
*   **NÃO USE**: Vercel, Netlify, Cloudflare Pages (Serverless não suporta FFmpeg longo ou disco persistente).
*   **USE**: VPS (Virtual Private Server) com disco SSD.

---

## 2. 💻 Requisitos do Servidor (VPS)

Para rodar o VariaGen em produção, a VPS deve atender aos seguintes requisitos mínimos:

| Recurso | Mínimo Recomendado | Motivo |
| :--- | :--- | :--- |
| **OS** | Ubuntu 22.04 LTS (ou 24.04) | Compatibilidade com Node e FFmpeg |
| **CPU** | 2 vCPUs (Intel/AMD) | Processamento de vídeo exige CPU |
| **RAM** | 4 GB | Node.js + FFmpeg consomem memória |
| **Disk** | 40 GB NVMe SSD | Armazenamento de uploads temporários |
| **Rede** | IPv4 Público e Portas Abertas | Acesso HTTP/HTTPS e SSH |

**Sugestão de Plano Hostinger:** KVM 2 ou superior.

---

## 3. �️ Dependências de Sistema

Antes de rodar a aplicação, instale os pacotes no Ubuntu:

```bash
# Atualizar repositórios
sudo apt update && sudo apt upgrade -y

# Instalar FFmpeg (CRÍTICO)
sudo apt install ffmpeg -y

# Instalar Node.js 20 (LTS)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Instalar PM2 (Process Manager)
sudo npm install -g pm2
```

---

## 4. 🚀 Instalação e Deploy

### Passo 1: Clonar o Projeto
```bash
git clone <URL_DO_GITHUB>
cd variagen
```

### Passo 2: Configurar Variáveis de Ambiente
Crie o arquivo `.env` na raiz do projeto (`/variagen/.env`).
**Importante:** Copie exatamente as chaves abaixo e preencha com os valores de produção.

```env
# ========================
# SERVIDOR
# ========================
PORT=3000

# ========================
# SUPABASE (Banco de Dados & Auth)
# ========================
# URL do Projeto Supabase
SUPABASE_URL=https://seu-projeto.supabase.co
# Service Role Key (Para o Backend poder escrever no DB)
SUPABASE_KEY=sua_chave_service_role_secreta
# URL Pública (Para o Frontend)
VITE_SUPABASE_URL=https://seu-projeto.supabase.co
# Anon Key (Para o Frontend)
VITE_SUPABASE_KEY=sua_chave_anon_publica
# Connection String (Para migrações DB)
DATABASE_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[ref]:[password]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"

# ========================
# API EXTERNAS
# ========================
# SyncPay (Pagamentos)
SYNCPAY_BASE_URL=https://api.syncpayments.com.br
SYNCPAY_CLIENT_ID=seu_client_id
SYNCPAY_CLIENT_SECRET=seu_client_secret

# Google AI (Gemini)
GOOGLE_AI_API_KEY=sua_api_key_google
VITE_API_URL=https://seu-dominio.com
```

### Passo 3: Instalar e Buildar

```bash
# Instalar dependências
npm install

# Buildar o Frontend (React -> dist/)
npm run build
```

### Passo 4: Migração de Banco de Dados
Certifique-se de que a tabela `video_jobs` e outras existem.
```bash
node server/setup-jobs-db.js
```

### Passo 5: Rodar com PM2 (Background)
Não rode com `npm run dev`. Em produção, use o PM2 para manter o servidor online.

```bash
# Iniciar o servidor
pm2 start server/index.js --name "variagen-api"

# (Opcional) Servir o Frontend estático se não usar Nginx separado
# O server/index.js já deve estar configurado para servir a pasta 'dist' se a rota API falhar?
# Se não, recomenda-se usar Nginx como Proxy Reverso.
```

---

## 5. 🌐 Configuração Nginx (Reverso Proxy)

Para ter HTTPS (Cadeado de segurança) e seu domínio (`seusite.com`), instale o Nginx.

```nginx
server {
    listen 80;
    server_name seusite.com;

    # Frontend (Arquivos Estáticos)
    location / {
        root /caminho/para/variagen/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend (API)
    location /api {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

---

## 6. 🛡️ Manutenção

*   **Logs**: `pm2 logs variagen-api`
*   **Reiniciar**: `pm2 restart variagen-api`
*   **Limpeza de Disco**: O script não deleta automaticamente os ZIPs antigos. Configure um CRON job para limpar a pasta `server/outputs` a cada 24h.
    *   `0 3 * * * find /caminho/para/variagen/server/outputs -type f -mtime +1 -delete`

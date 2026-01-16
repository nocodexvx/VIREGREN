# Documentação Técnica e Arquitetural do SaaS (VariaGen)

Este documento descreve a arquitetura completa do VariaGen transformado em um SaaS (Software as a Service). Ele serve como guia para o desenvolvimento do Painel Administrativo, gestão de assinaturas (MRR) e integrações de API.

## 1. Visão Geral do Produto

O **VariaGen** é uma plataforma SaaS híbrida que oferece ferramentas de manipulação de mídia impulsionadas por IA e processamento local.

*   **Produto A (Video Processor)**: Ferramenta de geração de variações de vídeo em massa (foco em dropshipping/ads). Processamento atualmente local, com potencial para nuvem.
*   **Produto B (Image Cloning)**: Ferramenta de clonagem de identidade e estilo em imagens usando IA Generativa (Google AI/Gemini).

## 2. Arquitetura do Sistema (SaaS)

Para operar como um negócio escalável, a aplicação deve evoluir da execução local "localhost" para uma arquitetura baseada em nuvem.

### Stack Tecnológica Recomendada
*   **Frontend**: React (Vite), Tailwind CSS, shadcn/ui (Já existente).
*   **Backend API**: Node.js (Express) ou Serverless Functions (AWS Lambda/Vercel).
*   **Banco de Dados**: PostgreSQL (Supabase ou Neon) para dados relacionais (Users, Subs) e consistência.
*   **Auth**: Clerk, Supabase Auth ou Auth0 (Gerenciamento de usuários seguro).
*   **Pagamentos**: Stripe ou LemonSqueezy (Gestão de Assinaturas e MRR).
*   **AI Provider**: Google AI Studio (Gemini Pro Vision) para processamento de imagens.

## 3. Especificação do Painel Administrativo

O Painel Administrativo (`/admin`) será o centro de comando para o "Dono do SaaS". Ele deve ser protegido e acessível apenas por super-admins.

### 3.1. Dashboard Principal (Visão Geral)
*   **KPIs Financeiros**:
    *   **MRR (Monthly Recurring Revenue)**: Receita recorrente mensal atual.
    *   **ARR (Annual Recurring Revenue)**: Projeção anual.
    *   **Ticket Médio**: Valor médio gasto por usuário.
*   **KPIs de Usuários**:
    *   **Total Users**: Número total de cadastros.
    *   **Active Subscribers**: Usuários pagantes ativos.
    *   **Churn Rate**: Porcentagem de cancelamentos no período.
    *   **New Signups**: Novos usuários (últimos 30 dias).

### 3.2. Gerenciamento de Usuários
Tabela listando todos os usuários com as colunas:
*   ID / Email / Nome.
*   **Plano Atual** (Free, Pro, Enterprise).
*   **Status** (Ativo, Cancelado, Inadimplente).
*   **Data de Cadastro**.
*   **Ações**:
    *   *Ver Detalhes*: Histórico de uso, logs.
    *   *Banir/Bloquear*: Revogar acesso.
    *   *Dar Upgrade Manual*: Conceder dias VIP ou mudar plano manualmente.

### 3.3. Configuração de Sistema (System Config)
Área para gerenciar chaves de API sem precisar redeployar o código (Environment Variables via UI ou Banco de Dados).
*   **Gateway de Pagamento**:
    *   `STRIPE_SECRET_KEY`
    *   `STRIPE_WEBHOOK_SECRET`
*   **AI Providers**:
    *   `GOOGLE_AI_API_KEY` (Para o módulo "Google Banana Pro"/Gemini).
    *   Configuração de Modelos (ex: selecionar `gemini-1.5-pro` ou `gemini-flash`).

## 4. Integrações de API

### 4.1. Gateway de Pagamento (Stripe/LemonSqueezy)
*   **Webhook Handler**: O backend deve receber notificações do Gateway.
    *   Evento `checkout.session.completed`: Cria a assinatura no banco de dados e libera acesso Premium.
    *   Evento `customer.subscription.deleted`: Remove acesso Premium (Churn).
    *   Evento `invoice.payment_failed`: Notifica usuário sobre falha.

### 4.2. Google AI (Image Cloning)
A funcionalidade de "Clonagem de Imagens" no frontend envia as imagens Base64 para o seu Backend (para não expor a API Key no navegador do cliente), que repassa para o Google AI.

**Fluxo:**
1.  **Client**: Envia Imagem A (Modelo) + Imagem B (Ref) + Prompt.
2.  **SaaS Backend**: Valida se usuário tem créditos/plano ativo.
3.  **SaaS Backend**: Chama API Google Gemini Vision (`Google Banana Pro`).
4.  **Google AI**: Retorna imagem processada.
5.  **SaaS Backend**: Salva log de uso (para cobrança/limites) e devolve imagem ao cliente.

## 5. Modelo de Dados (Schema Sugerido)

```sql
-- Tabela de Usuários
create table users (
  id uuid primary key,
  email text unique not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

-- Tabela de Assinaturas
create table subscriptions (
  id uuid primary key,
  user_id uuid references users(id),
  status text check (status in ('active', 'canceled', 'past_due')),
  plan_id text, -- 'price_basic', 'price_pro'
  current_period_end timestamp with time zone,
  stripe_customer_id text
);

-- Tabela de Uso de IA (Logs)
create table ai_usage_logs (
  id uuid primary key,
  user_id uuid references users(id),
  feature text, -- 'video_gen', 'image_clone'
  provider text, -- 'google_gemini'
  cost_tokens int,
  created_at timestamp with time zone default now()
);
```

## 6. Roteiro de Implementação (Próximos Passos)

1.  **Setup do Banco de Dados**: Criar projeto no Supabase.
2.  **Autenticação**: Configurar Login/Cadastro na aplicação.
3.  **Backend Cloud**: Migrar lógica de API para um servidor real (Vercel API Routes ou VPS).
4.  **Painel Admin**: Criar a rota `/admin` e consumir os dados acima.
5.  **Integração Stripe**: Criar produtos e linkar com o banco.

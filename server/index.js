import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
// import { setupImageRoutes } from '../image-ai-module/backend/imageRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// FIX #1: Aumentar limite de payload para 200MB
// ============================================
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// FIX #2: CORS Permissivo (Correção solicitada)
app.use(cors({
  origin: '*', // Aceitar qualquer origem (8080, 8081, 5173, etc)
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));

// Middleware adicional para garantir headers CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', '*');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

// ============================================
// Configuração do Supabase (REAL TIME DB)
// ============================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('⚠️  AVISO: Credenciais do Supabase não encontradas no .env');
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// MODULO DE IMAGEM (ISOLADO) - REMOVIDO
// ============================================
// setupImageRoutes(app, supabase);

// ============================================
// Endpoints do Admin Panel (SHARED/VIDEO/SYSTEM)
// ============================================
import { requireAdmin } from './middleware/auth.js';

// Listar Usuários
app.get('/api/admin/users', requireAdmin, async (req, res) => {
  try {
    const { data: users, error } = await supabase.from('users').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    res.json({ users, total: users.length });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Listar Assinaturas
app.get('/api/admin/subscriptions', requireAdmin, async (req, res) => {
  try {
    const { data: subs, error } = await supabase
      .from('subscriptions')
      .select('*, users(email, full_name, avatar_url)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    res.json({ subscriptions: subs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Listar Logs de IA
app.get('/api/admin/logs', requireAdmin, async (req, res) => {
  try {
    const { data: logs, error } = await supabase
      .from('ai_usage_logs')
      .select('*, users(email)')
      .order('created_at', { ascending: false })
      .limit(100);

    if (error) throw error;
    res.json({ logs: logs });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Estatísticas
app.get('/api/admin/stats', requireAdmin, async (req, res) => {
  try {
    // Busca real de contagens
    const { count: userCount } = await supabase.from('users').select('*', { count: 'exact', head: true });

    // Buscar assinaturas ativas
    const { data: subs, error } = await supabase.from('subscriptions').select('plan_id').eq('status', 'active');

    if (error) throw error;

    // Calcular MRR real
    const mrr = subs.reduce((total, sub) => {
      const price = sub.plan_id === 'business' ? 99 : sub.plan_id === 'pro' ? 29 : 0;
      return total + price;
    }, 0);

    res.json({
      mrr,
      activeSubscribers: subs.length,
      totalUsers: userCount || 0,
      churnRate: 0 // Mock por enquanto
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// Status da Config
app.get('/api/admin/config/status', requireAdmin, async (req, res) => {
  // Testar conexão real
  const { error } = await supabase.from('users').select('id').limit(1);

  // Verificar API Key do Google
  const googleKey = process.env.GOOGLE_AI_API_KEY;

  res.json({
    googleAI: {
      configured: !!googleKey
    },
    database: {
      type: 'supabase (production)',
      status: error ? 'error' : 'connected'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: 'production' });
});

// ============================================
// VIDEO PROCESSOR (FFmpeg Local) - REAL
// ============================================
import videoRoutes from './routes/video.js';
app.use('/api', videoRoutes);

// ============================================
// PAGAMENTOS (SyncPay)
// ============================================
import paymentRoutes from './routes/payments.js';
app.use('/api/payments', paymentRoutes);

// ============================================
// SERVING FRONTEND (PRODUCTION)
// ============================================
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from the React app
// Assumes 'dist' is one level up from 'server' folder (in root)
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

import fs from 'fs';

// Handle React Routing, return all requests to React app
app.get('*', (req, res) => {
  // Check if it's an API request first to avoid HTML response
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint not found', path: req.originalUrl });
  }

  const indexPath = path.join(distPath, 'index.html');

  // Inject Runtime Environment Variables
  fs.readFile(indexPath, 'utf8', (err, htmlData) => {
    if (err) {
      console.error('Error reading index.html', err);
      return res.status(500).send('Error loading frontend');
    }

    const envPayload = {
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL,
      VITE_SUPABASE_KEY: process.env.VITE_SUPABASE_KEY || process.env.SUPABASE_KEY
    };

    const injectedScript = `<script>window._env_ = ${JSON.stringify(envPayload)}</script>`;
    const finalHtml = htmlData.replace('</head>', `${injectedScript}</head>`);

    res.send(finalHtml);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT} (SyncPay + Supabase Check)`);
});

export default app;

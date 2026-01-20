import fs from "fs";
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
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ limit: '500mb', extended: true }));

// FIX #2: CORS Restrictions (Security Hardening)
const allowedOrigins = [
  'https://variagen.com.br',
  'http://localhost:8080',
  'http://localhost:3000', // Local Dev
  'http://127.0.0.1:8080'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // Intentionally lenient for now to avoid breaking existing users, but logging warning
      console.warn(`[CORS] Request from unknown origin: ${origin}`);
      return callback(null, true); // Change to false to block
    }
    return callback(null, true);
  },
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));

// STARTUP CLEANUP: Reset Stuck Jobs
// If server restarts, jobs marked 'processing' are dead. Mark them as 'error'.
async function cleanupStaleJobs() {
  try {
    const { error } = await supabase
      .from('video_jobs')
      .update({ status: 'error', progress: 0 })
      .eq('status', 'processing');

    if (!error) console.log('🧹 Startup: Stuck jobs cleaned up.');
    else console.warn('⚠️ Startup: Failed to clean jobs', error.message);
  } catch (e) {
    console.error('Startup cleanup error:', e);
  }
}
// Run cleanup slightly after boot
setTimeout(cleanupStaleJobs, 5000);

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
import adminRoutes from './routes/admin.js';

app.use('/api/admin', adminRoutes);

// Endpoints do Admin Panel (SHARED/VIDEO/SYSTEM) are handled in ./routes/admin.js

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', environment: 'production' });
});

// DEBUG ENV VARS (Temporary)
app.get('/api/debug-env', (req, res) => {
  res.json({
    SUPABASE_URL_EXISTS: !!process.env.SUPABASE_URL,
    VITE_SUPABASE_URL_EXISTS: !!process.env.VITE_SUPABASE_URL,
    PORT: process.env.PORT
  });
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
// FERRAMENTAS EXTRAS
// ============================================
import toolRoutes from './routes/tools.js';
app.use('/api/tools', toolRoutes);

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
// Disable 'index' so that root directory requests fall through to our custom handler
app.use(express.static(distPath, { index: false }));

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

    // LOG PARA DEBUG
    console.log('Injecting Env Vars:', {
      url: !!envPayload.VITE_SUPABASE_URL,
      key: !!envPayload.VITE_SUPABASE_KEY
    });

    const injectedScript = `<script>window._env_ = ${JSON.stringify(envPayload)}</script>`;
    const finalHtml = htmlData.replace('</head>', `${injectedScript}</head>`);

    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.send(finalHtml);
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT} (SyncPay + Supabase Check)`);
});

export default app;

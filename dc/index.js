/**
 * VariaGen Backend Server - VERSÃO CORRIGIDA
 * 
 * CORREÇÕES APLICADAS:
 * 1. ✅ Limite de payload aumentado para 200MB (erro 413)
 * 2. ✅ Modelo Gemini corrigido para gemini-2.0-flash-exp (erro 404)
 * 3. ✅ Adicionado responseModalities para geração de imagens
 * 4. ✅ Tratamento de erros melhorado (erro JSON parsing)
 * 5. ✅ Validação de API Key
 */

import express from 'express';
import cors from 'cors';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// FIX #1: Aumentar limite de payload para 200MB
// O erro 413 (Payload Too Large) ocorria porque
// imagens base64 em alta resolução são muito grandes
// ============================================
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));

// CORS para permitir requests do frontend
app.use(cors({
  origin: ['http://localhost:8080', 'http://localhost:5173', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'user-id']
}));

// ============================================
// Configuração do Google Generative AI
// ============================================
const API_KEY = process.env.GOOGLE_AI_API_KEY || '';

// Validar se a API Key existe
if (!API_KEY) {
  console.warn('⚠️  AVISO: GOOGLE_AI_API_KEY não configurada no .env');
  console.warn('   Crie um arquivo .env com: GOOGLE_AI_API_KEY=sua_chave_aqui');
}

// ============================================
// Banco de dados em memória (mock)
// Em produção, usar PostgreSQL/Supabase
// ============================================
const mockDatabase = {
  users: new Map(),
  subscriptions: new Map(),
  usageLogs: []
};

// Inicializar usuário mock
mockDatabase.users.set('mock-user-id-123', {
  id: 'mock-user-id-123',
  email: 'demo@variagen.com',
  plan: 'pro',
  credits: 1000
});

// ============================================
// ENDPOINT PRINCIPAL: Gerar Clone de Imagem
// ============================================
app.post('/api/generate-clone', async (req, res) => {
  console.log('\n📸 Nova requisição de clonagem recebida');
  
  try {
    const { modelImage, referenceImage, prompt } = req.body;
    const userId = req.headers['user-id'] || 'anonymous';

    // Validações
    if (!modelImage || !referenceImage) {
      console.log('❌ Erro: Imagens não fornecidas');
      return res.status(400).json({ 
        error: 'Imagens do modelo e referência são obrigatórias',
        code: 'MISSING_IMAGES'
      });
    }

    if (!API_KEY) {
      console.log('❌ Erro: API Key não configurada');
      return res.status(500).json({ 
        error: 'API Key do Google AI não configurada no servidor',
        code: 'MISSING_API_KEY',
        solution: 'Configure GOOGLE_AI_API_KEY no arquivo .env'
      });
    }

    console.log('✅ Imagens recebidas');
    console.log(`   Usuário: ${userId}`);
    console.log(`   Tamanho modelo: ${Math.round(modelImage.length / 1024)}KB`);
    console.log(`   Tamanho referência: ${Math.round(referenceImage.length / 1024)}KB`);

    // ============================================
    // FIX #2: Usar modelo correto para geração de imagens
    // 
    // IMPORTANTE: gemini-1.5-flash NÃO suporta geração de imagens!
    // Para gerar imagens, você precisa usar:
    // - gemini-2.0-flash-exp (com responseModalities)
    // - Ou a API do Imagen 3 separadamente
    // ============================================
    
    const genAI = new GoogleGenerativeAI(API_KEY);
    
    // Tentar primeiro com gemini-2.0-flash-exp (suporta imagens)
    let model;
    let useImageGeneration = false;
    
    try {
      // Modelo que suporta geração de imagens
      model = genAI.getGenerativeModel({ 
        model: 'gemini-2.0-flash-exp',
        generationConfig: {
          // FIX #3: Adicionar responseModalities para gerar imagens
          responseModalities: ['text', 'image'],
          temperature: 0.9,
          maxOutputTokens: 8192,
        }
      });
      useImageGeneration = true;
      console.log('🤖 Usando modelo: gemini-2.0-flash-exp (com geração de imagens)');
    } catch (modelError) {
      // Fallback para modelo de análise (sem geração de imagem)
      console.log('⚠️  gemini-2.0-flash-exp não disponível, usando fallback');
      model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-pro',
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 4096,
        }
      });
      console.log('🤖 Usando modelo fallback: gemini-1.5-pro (apenas análise)');
    }

    // Extrair base64 puro (remover prefixo data:image/...)
    const extractBase64 = (dataUrl) => {
      if (dataUrl.includes(',')) {
        return dataUrl.split(',')[1];
      }
      return dataUrl;
    };

    const modelImageBase64 = extractBase64(modelImage);
    const referenceImageBase64 = extractBase64(referenceImage);

    // Determinar tipo MIME
    const getMimeType = (dataUrl) => {
      if (dataUrl.startsWith('data:')) {
        const match = dataUrl.match(/data:([^;]+);/);
        return match ? match[1] : 'image/jpeg';
      }
      return 'image/jpeg';
    };

    console.log('🔄 Enviando para Gemini...');

    // Construir requisição com as duas imagens
    const imageParts = [
      {
        inlineData: {
          mimeType: getMimeType(modelImage),
          data: modelImageBase64
        }
      },
      {
        inlineData: {
          mimeType: getMimeType(referenceImage),
          data: referenceImageBase64
        }
      }
    ];

    const fullPrompt = prompt || `
      Analyze these two images:
      - Image 1: The model whose identity should be preserved
      - Image 2: The reference scene/pose to replicate
      
      Describe how you would combine them maintaining the model's face from image 1 
      while adopting the pose, clothing, and scene from image 2.
    `;

    // Gerar conteúdo
    const result = await model.generateContent([
      fullPrompt,
      ...imageParts
    ]);

    const response = await result.response;
    
    // Processar resposta
    let imageUrl = null;
    let textResponse = '';

    // Verificar se há imagem na resposta
    if (response.candidates && response.candidates[0]) {
      const candidate = response.candidates[0];
      
      for (const part of candidate.content.parts) {
        if (part.inlineData) {
          // Imagem gerada!
          const base64Image = part.inlineData.data;
          const mimeType = part.inlineData.mimeType || 'image/png';
          imageUrl = `data:${mimeType};base64,${base64Image}`;
          console.log('✅ Imagem gerada com sucesso!');
        } else if (part.text) {
          textResponse += part.text;
        }
      }
    }

    // Se não gerou imagem, retornar análise de texto
    if (!imageUrl && !useImageGeneration) {
      console.log('ℹ️  Modelo não suporta geração de imagem, retornando análise');
      return res.json({
        success: true,
        imageUrl: null,
        analysis: textResponse || response.text(),
        message: 'O modelo atual não suporta geração de imagens. Upgrade para gemini-2.0-flash-exp necessário.',
        code: 'TEXT_ONLY_RESPONSE'
      });
    }

    // Log de uso para o Admin Panel
    mockDatabase.usageLogs.push({
      id: `log_${Date.now()}`,
      userId,
      feature: 'image_clone',
      provider: 'google_gemini',
      model: useImageGeneration ? 'gemini-2.0-flash-exp' : 'gemini-1.5-pro',
      timestamp: new Date().toISOString(),
      success: !!imageUrl
    });

    console.log('✅ Processamento concluído');
    console.log(`   Imagem gerada: ${imageUrl ? 'SIM' : 'NÃO'}`);

    return res.json({
      success: true,
      imageUrl: imageUrl,
      analysis: textResponse,
      model: useImageGeneration ? 'gemini-2.0-flash-exp' : 'gemini-1.5-pro'
    });

  } catch (error) {
    // ============================================
    // FIX #4: Tratamento de erros melhorado
    // Sempre retornar JSON válido, nunca HTML
    // ============================================
    console.error('\n❌ Erro ao gerar imagem:', error);
    
    // Identificar tipo de erro
    let errorResponse = {
      success: false,
      error: 'Erro interno do servidor',
      code: 'INTERNAL_ERROR'
    };

    if (error.message?.includes('404')) {
      errorResponse = {
        success: false,
        error: 'Modelo de IA não encontrado. Verifique se sua API Key tem acesso ao modelo.',
        code: 'MODEL_NOT_FOUND',
        details: error.message,
        solution: 'Verifique no Google AI Studio se você tem acesso ao modelo gemini-2.0-flash-exp'
      };
    } else if (error.message?.includes('API key')) {
      errorResponse = {
        success: false,
        error: 'API Key inválida ou sem permissão',
        code: 'INVALID_API_KEY',
        solution: 'Gere uma nova API Key em https://aistudio.google.com/app/apikey'
      };
    } else if (error.message?.includes('quota') || error.message?.includes('429')) {
      errorResponse = {
        success: false,
        error: 'Limite de requisições excedido',
        code: 'QUOTA_EXCEEDED',
        solution: 'Aguarde alguns minutos ou aumente seu limite no Google Cloud Console'
      };
    } else if (error.message?.includes('SAFETY')) {
      errorResponse = {
        success: false,
        error: 'Conteúdo bloqueado por filtros de segurança',
        code: 'SAFETY_BLOCK',
        solution: 'Tente com imagens diferentes ou ajuste o prompt'
      };
    } else {
      errorResponse.details = error.message;
    }

    // Sempre retornar JSON, nunca HTML
    return res.status(500).json(errorResponse);
  }
});

// ============================================
// Endpoints do Admin Panel
// ============================================

// Listar todos os usuários
app.get('/api/admin/users', (req, res) => {
  const users = Array.from(mockDatabase.users.values());
  res.json({ users, total: users.length });
});

// Obter estatísticas (KPIs)
app.get('/api/admin/stats', (req, res) => {
  const logs = mockDatabase.usageLogs;
  const today = new Date().toISOString().split('T')[0];
  
  res.json({
    mrr: 1250.00, // Mock
    arr: 15000.00,
    totalUsers: mockDatabase.users.size,
    activeSubscribers: 12,
    churnRate: 2.5,
    newSignups: 5,
    todayRequests: logs.filter(l => l.timestamp.startsWith(today)).length,
    totalRequests: logs.length,
    successRate: logs.length > 0 
      ? Math.round((logs.filter(l => l.success).length / logs.length) * 100) 
      : 100
  });
});

// Obter logs de uso
app.get('/api/admin/logs', (req, res) => {
  const limit = parseInt(req.query.limit) || 50;
  const logs = mockDatabase.usageLogs.slice(-limit).reverse();
  res.json({ logs, total: mockDatabase.usageLogs.length });
});

// Verificar status da API Key
app.get('/api/admin/config/status', (req, res) => {
  res.json({
    googleAI: {
      configured: !!API_KEY,
      keyPrefix: API_KEY ? `${API_KEY.substring(0, 8)}...` : null
    },
    stripe: {
      configured: !!process.env.STRIPE_SECRET_KEY,
    },
    database: {
      type: 'memory (mock)',
      status: 'connected'
    }
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '2.0.0-fixed'
  });
});

// ============================================
// Iniciar servidor
// ============================================
app.listen(PORT, () => {
  console.log('\n🚀 ========================================');
  console.log(`   VariaGen Server v2.0 (CORRIGIDO)`);
  console.log(`   Rodando em: http://localhost:${PORT}`);
  console.log('==========================================');
  console.log('\n📋 Status das correções:');
  console.log('   ✅ Limite de payload: 200MB');
  console.log('   ✅ Modelo Gemini: gemini-2.0-flash-exp');
  console.log('   ✅ Tratamento de erros: JSON sempre');
  console.log(`   ${API_KEY ? '✅' : '❌'} Google AI API Key: ${API_KEY ? 'Configurada' : 'NÃO CONFIGURADA'}`);
  console.log('\n');
});

export default app;

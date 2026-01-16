# 🔧 GUIA DE CORREÇÃO - VariaGen

## Análise dos Erros Identificados

### ❌ Erro 1: 413 Payload Too Large
```
POST http://localhost:3000/api/generate-clone 413 (Payload Too Large)
```
**Causa:** O Express.js tem limite padrão de ~1MB para JSON. Imagens base64 em alta resolução facilmente excedem isso.

**Solução:** Aumentar limite para 200MB:
```javascript
app.use(express.json({ limit: '200mb' }));
app.use(express.urlencoded({ limit: '200mb', extended: true }));
```

---

### ❌ Erro 2: 404 Model Not Found
```
[404 Not Found] models/gemini-1.5-flash is not found for API version v1beta, 
or is not supported for generateContent
```
**Causa:** O modelo `gemini-1.5-flash` **NÃO suporta geração de imagens**. Ele só faz análise de texto/imagem.

**Solução:** Usar o modelo correto para geração de imagens:
```javascript
// ❌ ERRADO - não gera imagens
model: 'gemini-1.5-flash'

// ✅ CORRETO - suporta geração de imagens
model: 'gemini-2.0-flash-exp',
generationConfig: {
  responseModalities: ['text', 'image']  // IMPORTANTE!
}
```

---

### ❌ Erro 3: SyntaxError JSON
```
SyntaxError: Unexpected token '<', "<!DOCTYPE "... is not valid JSON
```
**Causa:** Quando o servidor dá erro, ele retorna HTML (página de erro) em vez de JSON. O frontend tenta fazer `JSON.parse()` no HTML e quebra.

**Solução:** Sempre retornar JSON nos erros:
```javascript
// ❌ ERRADO
res.status(500).send('Error');

// ✅ CORRETO
res.status(500).json({ error: 'Mensagem de erro', code: 'ERROR_CODE' });
```

---

## 📋 Instruções de Instalação

### Passo 1: Substituir o arquivo index.js
Copie o conteúdo do arquivo `index.js` corrigido para substituir o seu atual em:
```
/Users/macbookpro/Downloads/app meu/server/index.js
```

### Passo 2: Criar arquivo .env
Na pasta `server`, crie um arquivo `.env`:
```bash
cd "/Users/macbookpro/Downloads/app meu/server"
touch .env
```

Adicione sua API Key:
```env
GOOGLE_AI_API_KEY=sua_chave_aqui_do_google_ai_studio
PORT=3000
```

### Passo 3: Obter API Key (se não tiver)
1. Acesse: https://aistudio.google.com/app/apikey
2. Clique em "Create API Key"
3. Copie a chave gerada
4. Cole no arquivo `.env`

### Passo 4: Atualizar dependências
```bash
cd "/Users/macbookpro/Downloads/app meu/server"
npm install @google/generative-ai@latest
```

### Passo 5: Reiniciar servidor
```bash
# Matar processo antigo
lsof -i :3000 -t | xargs kill -9

# Iniciar novo
npm run dev
```

---

## ⚠️ IMPORTANTE: Sobre Geração de Imagens

O Google Gemini tem limitações para **gerar** imagens:

| Modelo | Análise de Imagens | Geração de Imagens |
|--------|-------------------|-------------------|
| gemini-1.5-flash | ✅ Sim | ❌ **NÃO** |
| gemini-1.5-pro | ✅ Sim | ❌ **NÃO** |
| gemini-2.0-flash-exp | ✅ Sim | ✅ Sim (experimental) |
| Imagen 3 | ❌ Não | ✅ Sim (API separada) |

Se o modelo `gemini-2.0-flash-exp` não estiver disponível na sua conta, você precisará:

1. **Usar a API do Imagen 3** (separada do Generative AI)
2. **Usar outra API** como Replicate, Stability AI, ou Midjourney
3. **Solicitar acesso** ao modelo experimental no Google AI Studio

---

## 🧪 Teste Rápido

Após aplicar as correções, teste com:

```bash
curl -X POST http://localhost:3000/api/health
```

Deve retornar:
```json
{"status":"ok","timestamp":"2025-01-16T...","version":"2.0.0-fixed"}
```

---

## 📊 Verificar no Admin Panel

Após gerar uma imagem com sucesso, os logs devem aparecer em:
- **Dashboard:** Estatísticas de uso
- **Logs:** Histórico de requisições
- **Config:** Status das API Keys

---

## 🆘 Se Ainda Der Erro

### Erro de API Key
```
API Key inválida ou sem permissão
```
→ Gere uma nova key em https://aistudio.google.com/app/apikey

### Erro de Quota
```
Limite de requisições excedido
```
→ Aguarde 1 minuto ou aumente quota no Google Cloud Console

### Erro de Modelo
```
Model not found
```
→ O modelo experimental pode não estar disponível na sua região. Use Imagen 3 ou outra API.

---

## 📞 Próximos Passos

1. ✅ Aplicar correções do servidor
2. ✅ Testar geração de imagem
3. 🔜 Implementar campo de chat/prompt customizado
4. 🔜 Integrar Stripe para pagamentos
5. 🔜 Deploy em produção (Vercel/Railway)

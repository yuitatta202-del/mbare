import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// Import delle rotte (con estensione .js per ES Modules)
import newsRoutes from './routes/news.routes.js';
import spifferaRoutes from './routes/spiffera.routes.js';
import commentRoutes from './routes/comment.routes.js'; // <-- AGGIUNTO
import authRoutes from './routes/auth.routes.js';
import eventRoutes from './routes/event.routes.js';
import groupRoutes from './routes/group.routes.js';
import adminRoutes from './routes/admin.routes.js';
import chatRoutes from './routes/chat.routes.js';
import boardRoutes from './routes/board.routes.js';
import tokenRoutes from './routes/token.routes.js';

dotenv.config();

// ==========================================
// FIX GLOBALE PER PRISMA BIGINT
// ==========================================
// Node.js non sa gestire i BigInt in JSON. Diciamo di convertirli in stringhe.
// @ts-ignore
BigInt.prototype.toJSON = function () { return this.toString(); };

const app = express();
const PORT = process.env.PORT || 3001;

// Necessario per il corretto funzionamento del Rate Limit in produzione (dietro proxy come Render/Railway)
app.set('trust proxy', 1);

// ==========================================
// MIDDLEWARE DI SICUREZZA
// ==========================================

// 1. CORS (Usa variabile d'ambiente per il frontend, fallback su localhost)
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({ 
  origin: frontendUrl,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Helmet (Imposta intestazioni di sicurezza)
app.use(helmet());

// 3. Body Parser (Aumentato a 5MB per supportare articoli lunghi o immagini base64)
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: true, limit: '5mb' }));

// 4. Rate Limiting Differenziato
// Limitatore stretto per Auth (evita attacchi brute-force)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 15, // Max 15 tentativi di login/registrazione per IP
  message: { error: 'Troppi tentativi di accesso. Riprova più tardi, minchia!' }
});

// Limitatore generale per il resto delle API (più permissivo per la navigazione)
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minuti
  max: 500, // Max 500 richieste per IP
  message: { error: 'Troppe richieste. Riprova più tardi.' }
});

// Applica i limiter alle rispettive rotte
app.use('/api/auth', authLimiter);
app.use('/api', generalLimiter);

// ==========================================
// ROTTE
// ==========================================

// Health Check (FIX: Ora è VERAMENTE prima del Rate Limit, così i monitoraggi non vengono bloccati)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend Mbare attivo e blindato!' });
});

// Rotte applicative
app.use('/api/news', newsRoutes);
app.use('/api/confessions', spifferaRoutes); 
app.use('/api/comments', commentRoutes); // <-- AGGIUNTO
app.use('/api/auth', authRoutes); 
app.use('/api/events', eventRoutes);
app.use('/api/groups', groupRoutes);
app.use('/api/super-admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/board', boardRoutes);
app.use('/api/tokens', tokenRoutes);

// ==========================================
// GESTIONE ERRORI
// ==========================================

// 404 Handler per le API (se la rotta non esiste)
app.use((req, res, next) => {
  res.status(404).json({ error: `Rotta API non trovata: ${req.method} ${req.originalUrl}` });
});

// Error Handler Globale
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('❌ ERRORE API:', err.message);
  
  // Se l'errore ha uno statusCode (es. dal tuo AppError), usalo. Altrimenti 500.
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Errore interno del server. Minchia, quarchi cosa ruppi!';
  
  res.status(statusCode).json({ error: message });
});

// ==========================================
// AVVIO SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`🚀 Server in ascolto su http://localhost:${PORT}`);
  console.log(`🛡️  Sicurezza attiva: Helmet, CORS, Rate Limit`);
  console.log(`🔗 Frontend consentito: ${frontendUrl}`);
});
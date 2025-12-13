import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Charger les variables d'environnement avec le bon chemin
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
dotenv.config({ path: join(__dirname, '..', '.env') });

// Importer les routes
import authRoutes from './routes/auth.routes.js';
import userRoutes from './routes/user.routes.js';
import servicesRoutes from './routes/services.routes.js';

// Importer les middlewares et la config DB
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import { testConnection } from './config/database.js';

const app = express();
const PORT = process.env.PORT || 3001;

// =====================
// MIDDLEWARES GLOBAUX
// =====================

// Sécurité HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:8080',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Parser JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Trust proxy (pour récupérer la vraie IP derrière un reverse proxy)
app.set('trust proxy', 1);

// Rate limiting global
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // 1000 requêtes par fenêtre
  message: {
    success: false,
    error: 'Trop de requêtes, veuillez réessayer plus tard'
  },
  standardHeaders: true,
  legacyHeaders: false
});
app.use(globalLimiter);

// Rate limiting strict pour l'authentification
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 tentatives
  message: {
    success: false,
    error: 'Trop de tentatives de connexion, veuillez réessayer dans 15 minutes'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// =====================
// ROUTES
// =====================

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Routes API
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/services', servicesRoutes);

// Route 404
app.use(notFoundHandler);

// Gestionnaire d'erreurs global
app.use(errorHandler);

// =====================
// DÉMARRAGE SERVEUR
// =====================

async function startServer() {
  console.log('');
  console.log('========================================');
  console.log('  MYSTRAL HOSTING API');
  console.log('========================================');
  console.log('');

  // Test de connexion à la base de données
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('');
    console.error('⚠️  Impossible de se connecter à la base de données.');
    console.error('   Vérifiez que MariaDB est démarré et que les credentials sont corrects.');
    console.error('');
    console.error('   Configuration actuelle:');
    console.error(`   - Host: ${process.env.DB_HOST}`);
    console.error(`   - Port: ${process.env.DB_PORT}`);
    console.error(`   - User: ${process.env.DB_USER}`);
    console.error(`   - Database: ${process.env.DB_NAME}`);
    console.error('');

    // On démarre quand même le serveur pour permettre le debug
    console.log('⚠️  Démarrage du serveur sans base de données...');
  }

  app.listen(PORT, () => {
    console.log('');
    console.log(`🚀 Serveur API démarré sur http://localhost:${PORT}`);
    console.log('');
    console.log('📚 Endpoints disponibles:');
    console.log(`   - POST   /api/auth/register`);
    console.log(`   - POST   /api/auth/login`);
    console.log(`   - POST   /api/auth/logout`);
    console.log(`   - GET    /api/auth/me`);
    console.log(`   - PUT    /api/auth/password`);
    console.log(`   - GET    /api/user/profile`);
    console.log(`   - PUT    /api/user/profile`);
    console.log(`   - GET    /api/services`);
    console.log(`   - GET    /api/services/categories`);
    console.log(`   - GET    /api/services/products`);
    console.log(`   - GET    /api/services/locations`);
    console.log(`   - GET    /api/health`);
    console.log('');
    console.log(`🌐 CORS autorisé pour: ${process.env.FRONTEND_URL}`);
    console.log('');
    console.log('========================================');
  });
}

startServer();

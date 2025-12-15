import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { testConnection } from './config/database.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/user.js';
import servicesRoutes from './routes/services.js';
import productsRoutes from './routes/products.js';
import paymentsRoutes from './routes/payments.js';
import { sendTestEmail } from './services/email.js';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware - CORS permissif pour le dev
app.use(cors({
  origin: true, // Accepte toutes les origines en dev
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging (always on for debugging)
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Email test endpoint (admin only - should be protected in production)
app.post('/api/test-email', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }
    const result = await sendTestEmail(email);
    res.json(result);
  } catch (err) {
    console.error('Test email error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/services', servicesRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/payments', paymentsRoutes);

// 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint non trouvé',
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    success: false,
    message: 'Erreur serveur interne',
  });
});

// Start server
async function startServer() {
  // Test database connection
  const dbConnected = await testConnection();

  if (!dbConnected) {
    console.error('⚠️  Warning: Database connection failed. Server will start but some features may not work.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Mystral API Server running on http://0.0.0.0:${PORT}`);
    console.log(`📚 API endpoints available at http://localhost:${PORT}/api`);
  });
}

startServer();

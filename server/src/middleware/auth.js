import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

const JWT_SECRET = process.env.JWT_SECRET || 'mystral-super-secret-jwt-key';

// Generate JWT token
export function generateToken(user) {
  return jwt.sign(
    {
      uuid: user.uuid,
      email: user.email,
      role: user.role,
    },
    JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
  );
}

// Verify JWT token
export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// Authentication middleware
export async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'Token d\'authentification manquant',
    });
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (!decoded) {
    return res.status(401).json({
      success: false,
      message: 'Token invalide ou expiré',
    });
  }

  try {
    // Fetch user from database to ensure they still exist and are active
    const users = await query(
      `SELECT id, uuid, email, email_verified, first_name, last_name,
              phone, company_name, address_line1, address_line2, city,
              postal_code, country_code, role, status, totp_enabled,
              created_at, last_login_at
       FROM users
       WHERE uuid = ? AND status = 'active'`,
      [decoded.uuid]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Utilisateur non trouvé ou compte désactivé',
      });
    }

    req.user = users[0];
    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
}

// Optional authentication (doesn't fail if no token)
export async function optionalAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next();
  }

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);

  if (decoded) {
    try {
      const users = await query(
        `SELECT id, uuid, email, role, status FROM users WHERE uuid = ?`,
        [decoded.uuid]
      );
      if (users.length > 0) {
        req.user = users[0];
      }
    } catch (err) {
      // Silently fail for optional auth
    }
  }

  next();
}

// Role-based authorization middleware
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Non authentifié',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Accès non autorisé',
      });
    }

    next();
  };
}

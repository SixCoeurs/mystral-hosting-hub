import { verifyJWT } from '../utils/helpers.js';
import { queryOne } from '../config/database.js';

// Middleware d'authentification JWT
export async function authenticate(req, res, next) {
  try {
    // Récupérer le token du header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Token d\'authentification requis'
      });
    }

    const token = authHeader.split(' ')[1];

    // Vérifier le JWT
    const decoded = verifyJWT(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        error: 'Token invalide ou expiré'
      });
    }

    // Récupérer l'utilisateur depuis la DB
    const user = await queryOne(
      `SELECT id, uuid, email, email_verified, first_name, last_name,
              phone, company_name, address_line1, address_line2, city,
              postal_code, country_code, role, status, totp_enabled,
              created_at, last_login_at
       FROM users
       WHERE uuid = ? AND status = 'active'`,
      [decoded.uuid]
    );

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Utilisateur non trouvé ou inactif'
      });
    }

    // Attacher l'utilisateur à la requête
    req.user = user;
    next();
  } catch (error) {
    console.error('Erreur d\'authentification:', error);
    return res.status(500).json({
      success: false,
      error: 'Erreur d\'authentification'
    });
  }
}

// Middleware optionnel (authentifie si token présent, sinon continue)
export async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyJWT(token);

    if (decoded) {
      const user = await queryOne(
        `SELECT id, uuid, email, role, status FROM users WHERE uuid = ? AND status = 'active'`,
        [decoded.uuid]
      );
      if (user) {
        req.user = user;
      }
    }

    next();
  } catch (error) {
    next();
  }
}

// Middleware pour vérifier les rôles
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentification requise'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: 'Accès non autorisé'
      });
    }

    next();
  };
}

// Middleware pour vérifier que l'email est vérifié
export function requireVerifiedEmail(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentification requise'
    });
  }

  if (!req.user.email_verified) {
    return res.status(403).json({
      success: false,
      error: 'Email non vérifié. Veuillez vérifier votre adresse email.'
    });
  }

  next();
}

import express from 'express';
import argon2 from 'argon2';
import crypto from 'crypto';
import { v4 as uuidv4 } from 'uuid';
import { query, transaction } from '../config/database.js';
import { generateToken, authenticate } from '../middleware/auth.js';
import {
  sendVerificationEmail,
  sendWelcomeEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendNewLoginAlertEmail,
} from '../services/email.js';

const router = express.Router();

// Generate secure random token
function generateSecureToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Helper to convert BigInt to Number (MariaDB returns BigInt for BIGINT columns)
function toNumber(val) {
  return typeof val === 'bigint' ? Number(val) : val;
}

// Helper to format user for response (exclude sensitive fields)
function formatUser(user) {
  return {
    id: toNumber(user.id),
    uuid: user.uuid,
    email: user.email,
    email_verified: Boolean(user.email_verified),
    first_name: user.first_name,
    last_name: user.last_name,
    phone: user.phone || null,
    company_name: user.company_name || null,
    address_line1: user.address_line1 || null,
    address_line2: user.address_line2 || null,
    city: user.city || null,
    postal_code: user.postal_code || null,
    country_code: user.country_code || 'FR',
    role: user.role,
    status: user.status,
    totp_enabled: Boolean(user.totp_enabled),
    created_at: user.created_at,
    last_login_at: user.last_login_at || null,
  };
}

// Log security event
async function logSecurityEvent(userId, eventType, ip, userAgent, details = null) {
  try {
    await query(
      `INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, details)
       VALUES (?, ?, ?, ?, ?)`,
      [toNumber(userId), eventType, ip, userAgent, details ? JSON.stringify(details) : null]
    );
  } catch (err) {
    console.error('Failed to log security event:', err);
  }
}

// POST /auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email et mot de passe requis',
      });
    }

    // Find user by email
    const users = await query(
      `SELECT id, uuid, email, email_verified, password_hash, first_name, last_name,
              phone, company_name, address_line1, address_line2, city,
              postal_code, country_code, role, status, totp_enabled,
              created_at, last_login_at
       FROM users
       WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      await logSecurityEvent(null, 'login_failed', ip, userAgent, { email, reason: 'user_not_found' });
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects',
      });
    }

    const user = users[0];

    // Check account status
    if (user.status === 'banned') {
      await logSecurityEvent(user.id, 'login_failed', ip, userAgent, { reason: 'account_banned' });
      return res.status(403).json({
        success: false,
        message: 'Votre compte a été suspendu. Contactez le support.',
      });
    }

    if (user.status === 'suspended') {
      await logSecurityEvent(user.id, 'login_failed', ip, userAgent, { reason: 'account_suspended' });
      return res.status(403).json({
        success: false,
        message: 'Votre compte est temporairement suspendu.',
      });
    }

    // Verify password
    let passwordValid = false;
    try {
      passwordValid = await argon2.verify(user.password_hash, password);
    } catch (err) {
      console.error('Password verification error:', err);
    }

    if (!passwordValid) {
      await logSecurityEvent(user.id, 'login_failed', ip, userAgent, { reason: 'invalid_password' });
      return res.status(401).json({
        success: false,
        message: 'Identifiants incorrects',
      });
    }

    // Update last login info
    await query(
      `UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?`,
      [ip, user.id]
    );

    // Generate token
    const token = generateToken(user);

    // Log successful login
    await logSecurityEvent(user.id, 'login_success', ip, userAgent, null);

    // Return user and token
    res.json({
      success: true,
      user: formatUser(user),
      token,
    });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la connexion',
    });
  }
});

// POST /auth/register
router.post('/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, phone, company_name } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    // Validate required fields
    if (!email || !password || !first_name || !last_name) {
      return res.status(400).json({
        success: false,
        message: 'Tous les champs obligatoires doivent être remplis',
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Format d\'email invalide',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caractères',
      });
    }

    // Check if email already exists
    const existingUsers = await query(
      'SELECT id FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Cette adresse email est déjà utilisée',
      });
    }

    // Hash password with Argon2id
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Generate UUID
    const uuid = uuidv4();

    // Create user
    let userId;
    try {
      const insertResult = await query(
        `INSERT INTO users (uuid, email, password_hash, first_name, last_name, phone, company_name, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
        [uuid, email.toLowerCase().trim(), passwordHash, first_name.trim(), last_name.trim(), phone || null, company_name || null]
      );
      userId = insertResult.insertId;
      console.log('User created with ID:', userId);

      // Try to initialize user credits (optional - may not exist in all DB setups)
      try {
        await query(
          'INSERT INTO user_credits (user_id, balance) VALUES (?, 0)',
          [userId]
        );
      } catch (creditErr) {
        console.log('Note: user_credits table may not exist, skipping:', creditErr.message);
      }
    } catch (insertErr) {
      console.error('User insert error:', insertErr);
      throw insertErr;
    }

    const result = userId;

    // Generate email verification token
    const verificationToken = generateSecureToken();
    try {
      await query(
        `INSERT INTO user_tokens (user_id, token_type, token, expires_at)
         VALUES (?, 'email_verification', ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
        [result, verificationToken]
      );
    } catch (tokenErr) {
      console.log('Note: user_tokens table may not exist, skipping verification token:', tokenErr.message);
    }

    // Fetch created user
    const users = await query(
      `SELECT id, uuid, email, email_verified, first_name, last_name,
              phone, company_name, address_line1, address_line2, city,
              postal_code, country_code, role, status, totp_enabled,
              created_at, last_login_at
       FROM users WHERE id = ?`,
      [result]
    );

    const user = users[0];

    // Generate token
    const token = generateToken(user);

    // Log registration
    await logSecurityEvent(user.id, 'register', ip, userAgent, null);

    // Send verification email (async, don't wait)
    sendVerificationEmail(user, verificationToken).catch(err => {
      console.error('Failed to send verification email:', err);
    });

    res.status(201).json({
      success: true,
      user: formatUser(user),
      token,
      message: 'Inscription reussie ! Un email de verification a ete envoye.',
    });
  } catch (err) {
    console.error('Registration error:', err.message);
    console.error('Full error:', err);
    res.status(500).json({
      success: false,
      message: process.env.NODE_ENV === 'development'
        ? `Erreur: ${err.message}`
        : 'Erreur serveur lors de l\'inscription',
    });
  }
});

// POST /auth/logout
router.post('/logout', authenticate, async (req, res) => {
  try {
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    // Log logout event
    await logSecurityEvent(req.user.id, 'logout', ip, userAgent, null);

    res.json({
      success: true,
      message: 'Déconnexion réussie',
    });
  } catch (err) {
    console.error('Logout error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// GET /auth/me - Get current user
router.get('/me', authenticate, async (req, res) => {
  try {
    res.json({
      success: true,
      user: formatUser(req.user),
    });
  } catch (err) {
    console.error('Get current user error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// POST /auth/request-password-reset
router.post('/request-password-reset', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email requis',
      });
    }

    // Always return success to prevent email enumeration
    const users = await query(
      'SELECT id, uuid, email, first_name, last_name FROM users WHERE email = ?',
      [email.toLowerCase().trim()]
    );

    if (users.length > 0) {
      const user = users[0];
      const resetToken = generateSecureToken();

      // Delete any existing reset tokens for this user
      try {
        await query(
          `DELETE FROM user_tokens WHERE user_id = ? AND token_type = 'password_reset'`,
          [user.id]
        );
      } catch (delErr) {
        console.log('Note: Could not delete old reset tokens:', delErr.message);
      }

      // Store new reset token (expires in 1 hour)
      try {
        await query(
          `INSERT INTO user_tokens (user_id, token_type, token, expires_at)
           VALUES (?, 'password_reset', ?, DATE_ADD(NOW(), INTERVAL 1 HOUR))`,
          [user.id, resetToken]
        );

        // Send reset email
        await sendPasswordResetEmail(user, resetToken);
        console.log(`Password reset email sent to: ${email}`);
      } catch (tokenErr) {
        console.error('Error creating reset token:', tokenErr.message);
      }
    }

    res.json({
      success: true,
      message: 'Si cette adresse existe, un email de reinitialisation a ete envoye',
    });
  } catch (err) {
    console.error('Password reset request error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// POST /auth/reset-password - Reset password with token
router.post('/reset-password', async (req, res) => {
  try {
    const { token, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token et mot de passe requis',
      });
    }

    // Validate password strength
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le mot de passe doit contenir au moins 8 caracteres',
      });
    }

    // Find valid token
    const tokens = await query(
      `SELECT ut.user_id, u.email, u.first_name, u.last_name
       FROM user_tokens ut
       JOIN users u ON ut.user_id = u.id
       WHERE ut.token = ? AND ut.token_type = 'password_reset' AND ut.expires_at > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expire',
      });
    }

    const { user_id, email, first_name, last_name } = tokens[0];

    // Hash new password
    const passwordHash = await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Update password
    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [passwordHash, user_id]
    );

    // Delete used token
    await query(
      `DELETE FROM user_tokens WHERE user_id = ? AND token_type = 'password_reset'`,
      [user_id]
    );

    // Log the event
    await logSecurityEvent(user_id, 'password_reset', ip, userAgent, null);

    // Send confirmation email
    sendPasswordChangedEmail({ email, first_name, last_name }).catch(err => {
      console.error('Failed to send password changed email:', err);
    });

    res.json({
      success: true,
      message: 'Mot de passe reinitialise avec succes',
    });
  } catch (err) {
    console.error('Password reset error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// POST /auth/verify-email - Verify email with token
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Token requis',
      });
    }

    // Find valid token
    const tokens = await query(
      `SELECT ut.user_id, u.email, u.first_name, u.last_name, u.email_verified
       FROM user_tokens ut
       JOIN users u ON ut.user_id = u.id
       WHERE ut.token = ? AND ut.token_type = 'email_verification' AND ut.expires_at > NOW()`,
      [token]
    );

    if (tokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Token invalide ou expire',
      });
    }

    const { user_id, email, first_name, last_name, email_verified } = tokens[0];

    if (email_verified) {
      return res.json({
        success: true,
        message: 'Email deja verifie',
      });
    }

    // Mark email as verified
    await query(
      'UPDATE users SET email_verified = 1 WHERE id = ?',
      [user_id]
    );

    // Delete used token
    await query(
      `DELETE FROM user_tokens WHERE user_id = ? AND token_type = 'email_verification'`,
      [user_id]
    );

    // Log the event
    await logSecurityEvent(user_id, 'email_verified', ip, userAgent, null);

    // Send welcome email
    sendWelcomeEmail({ email, first_name, last_name }).catch(err => {
      console.error('Failed to send welcome email:', err);
    });

    res.json({
      success: true,
      message: 'Email verifie avec succes !',
    });
  } catch (err) {
    console.error('Email verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// POST /auth/resend-verification - Resend verification email
router.post('/resend-verification', authenticate, async (req, res) => {
  try {
    const user = req.user;

    if (user.email_verified) {
      return res.json({
        success: true,
        message: 'Email deja verifie',
      });
    }

    // Delete any existing verification tokens
    try {
      await query(
        `DELETE FROM user_tokens WHERE user_id = ? AND token_type = 'email_verification'`,
        [user.id]
      );
    } catch (delErr) {
      console.log('Note: Could not delete old verification tokens:', delErr.message);
    }

    // Generate new verification token
    const verificationToken = generateSecureToken();
    try {
      await query(
        `INSERT INTO user_tokens (user_id, token_type, token, expires_at)
         VALUES (?, 'email_verification', ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
        [user.id, verificationToken]
      );
    } catch (tokenErr) {
      console.error('Error creating verification token:', tokenErr.message);
      return res.status(500).json({
        success: false,
        message: 'Erreur lors de la creation du token',
      });
    }

    // Send verification email
    await sendVerificationEmail(user, verificationToken);

    res.json({
      success: true,
      message: 'Email de verification envoye',
    });
  } catch (err) {
    console.error('Resend verification error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

export default router;

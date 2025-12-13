import express from 'express';
import argon2 from 'argon2';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticate);

// Helper to convert BigInt to Number
function toNumber(val) {
  return typeof val === 'bigint' ? Number(val) : val;
}

// Helper to format user for response
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

// PUT /user/profile - Update user profile
router.put('/profile', async (req, res) => {
  try {
    const { first_name, last_name, phone, company_name, address_line1, address_line2, city, postal_code, country_code } = req.body;
    const userId = req.user.id;

    // Build update query dynamically
    const updates = [];
    const values = [];

    if (first_name !== undefined) {
      updates.push('first_name = ?');
      values.push(first_name.trim());
    }
    if (last_name !== undefined) {
      updates.push('last_name = ?');
      values.push(last_name.trim());
    }
    if (phone !== undefined) {
      updates.push('phone = ?');
      values.push(phone || null);
    }
    if (company_name !== undefined) {
      updates.push('company_name = ?');
      values.push(company_name || null);
    }
    if (address_line1 !== undefined) {
      updates.push('address_line1 = ?');
      values.push(address_line1 || null);
    }
    if (address_line2 !== undefined) {
      updates.push('address_line2 = ?');
      values.push(address_line2 || null);
    }
    if (city !== undefined) {
      updates.push('city = ?');
      values.push(city || null);
    }
    if (postal_code !== undefined) {
      updates.push('postal_code = ?');
      values.push(postal_code || null);
    }
    if (country_code !== undefined) {
      updates.push('country_code = ?');
      values.push(country_code || 'FR');
    }

    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Aucune donnée à mettre à jour',
      });
    }

    values.push(userId);

    await query(
      `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Fetch updated user
    const users = await query(
      `SELECT id, uuid, email, email_verified, first_name, last_name,
              phone, company_name, address_line1, address_line2, city,
              postal_code, country_code, role, status, totp_enabled,
              created_at, last_login_at
       FROM users WHERE id = ?`,
      [userId]
    );

    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;
    await logSecurityEvent(userId, 'profile_update', ip, userAgent, { updated_fields: Object.keys(req.body) });

    res.json({
      success: true,
      user: formatUser(users[0]),
    });
  } catch (err) {
    console.error('Profile update error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la mise à jour du profil',
    });
  }
});

// PUT /user/password - Change password
router.put('/password', async (req, res) => {
  try {
    const { current_password, new_password } = req.body;
    const userId = req.user.id;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    // Validate input
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: 'Mot de passe actuel et nouveau mot de passe requis',
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 8 caractères',
      });
    }

    // Get current password hash
    const users = await query(
      'SELECT password_hash FROM users WHERE id = ?',
      [userId]
    );

    // Verify current password
    const passwordValid = await argon2.verify(users[0].password_hash, current_password);

    if (!passwordValid) {
      await logSecurityEvent(userId, 'password_change_failed', ip, userAgent, { reason: 'invalid_current_password' });
      return res.status(401).json({
        success: false,
        message: 'Mot de passe actuel incorrect',
      });
    }

    // Hash new password
    const newPasswordHash = await argon2.hash(new_password, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Update password
    await query(
      'UPDATE users SET password_hash = ? WHERE id = ?',
      [newPasswordHash, userId]
    );

    await logSecurityEvent(userId, 'password_change', ip, userAgent, null);

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    });
  } catch (err) {
    console.error('Password change error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors du changement de mot de passe',
    });
  }
});

// GET /user/security-logs - Get user's security logs
router.get('/security-logs', async (req, res) => {
  try {
    const userId = req.user.id;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const offset = parseInt(req.query.offset) || 0;

    const logs = await query(
      `SELECT event_type, ip_address, user_agent, created_at
       FROM security_logs
       WHERE user_id = ?
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
      [userId, limit, offset]
    );

    res.json({
      success: true,
      logs: logs.map(log => ({
        event_type: log.event_type,
        ip_address: log.ip_address,
        user_agent: log.user_agent,
        created_at: log.created_at,
      })),
    });
  } catch (err) {
    console.error('Get security logs error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// GET /user/credits - Get user credit balance
router.get('/credits', async (req, res) => {
  try {
    const userId = req.user.id;

    const credits = await query(
      'SELECT balance FROM user_credits WHERE user_id = ?',
      [userId]
    );

    const balance = credits.length > 0 ? parseFloat(credits[0].balance) : 0;

    res.json({
      success: true,
      balance,
    });
  } catch (err) {
    console.error('Get credits error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

export default router;

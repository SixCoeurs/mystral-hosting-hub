import express from 'express';
import crypto from 'crypto';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import argon2 from 'argon2';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to convert BigInt to Number
function toNumber(val) {
  return typeof val === 'bigint' ? Number(val) : val;
}

// Generate secure random recovery codes
function generateRecoveryCodes(count = 8) {
  const codes = [];
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = crypto.randomBytes(4).toString('hex').toUpperCase();
    codes.push(`${code.slice(0, 4)}-${code.slice(4, 8)}`);
  }
  return codes;
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

// POST /totp/setup - Generate TOTP secret and QR code for setup
router.post('/setup', authenticate, async (req, res) => {
  try {
    const user = req.user;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    // Check if 2FA is already enabled
    if (user.totp_enabled) {
      return res.status(400).json({
        success: false,
        message: 'L\'authentification à deux facteurs est déjà activée',
      });
    }

    // Generate a new secret
    const secret = authenticator.generateSecret();

    // Create OTP auth URL
    const otpauth = authenticator.keyuri(user.email, 'Mystral', secret);

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauth);

    // Store secret temporarily in the database (not enabled yet)
    await query(
      `UPDATE users SET totp_secret = ? WHERE id = ?`,
      [secret, user.id]
    );

    await logSecurityEvent(user.id, 'totp_setup_started', ip, userAgent, null);

    res.json({
      success: true,
      secret: secret, // User can manually enter this
      qr_code: qrCodeDataUrl,
      message: 'Scannez le QR code avec votre application d\'authentification',
    });
  } catch (err) {
    console.error('TOTP setup error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la configuration de la 2FA',
    });
  }
});

// POST /totp/enable - Verify code and enable 2FA
router.post('/enable', authenticate, async (req, res) => {
  try {
    const { code } = req.body;
    const user = req.user;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: 'Code requis',
      });
    }

    // Get the stored secret
    const users = await query(
      `SELECT totp_secret FROM users WHERE id = ?`,
      [user.id]
    );

    if (users.length === 0 || !users[0].totp_secret) {
      return res.status(400).json({
        success: false,
        message: 'Veuillez d\'abord configurer la 2FA',
      });
    }

    const secret = users[0].totp_secret;

    // Verify the code
    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      await logSecurityEvent(user.id, 'totp_enable_failed', ip, userAgent, { reason: 'invalid_code' });
      return res.status(400).json({
        success: false,
        message: 'Code invalide. Veuillez réessayer.',
      });
    }

    // Generate recovery codes
    const recoveryCodes = generateRecoveryCodes(8);

    // Hash and store recovery codes
    for (const code of recoveryCodes) {
      const codeHash = await argon2.hash(code.replace('-', ''), {
        type: argon2.argon2id,
        memoryCost: 16384,
        timeCost: 2,
        parallelism: 1,
      });
      await query(
        `INSERT INTO recovery_codes (user_id, code_hash) VALUES (?, ?)`,
        [user.id, codeHash]
      );
    }

    // Enable 2FA
    await query(
      `UPDATE users SET totp_enabled = 1 WHERE id = ?`,
      [user.id]
    );

    await logSecurityEvent(user.id, 'totp_enabled', ip, userAgent, null);

    res.json({
      success: true,
      message: 'Authentification à deux facteurs activée',
      recovery_codes: recoveryCodes,
    });
  } catch (err) {
    console.error('TOTP enable error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de l\'activation de la 2FA',
    });
  }
});

// POST /totp/verify - Verify a TOTP code (for login)
router.post('/verify', async (req, res) => {
  try {
    const { email, code, password } = req.body;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email et code requis',
      });
    }

    // Get user with TOTP secret
    const users = await query(
      `SELECT id, uuid, email, email_verified, password_hash, first_name, last_name,
              phone, company_name, address_line1, address_line2, city,
              postal_code, country_code, role, status, totp_enabled, totp_secret,
              created_at, last_login_at
       FROM users
       WHERE email = ?`,
      [email.toLowerCase().trim()]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Code invalide',
      });
    }

    const user = users[0];

    // If password is provided, verify it first
    if (password) {
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
          message: 'Code invalide',
        });
      }
    }

    if (!user.totp_enabled || !user.totp_secret) {
      return res.status(400).json({
        success: false,
        message: '2FA non activée pour ce compte',
      });
    }

    // Verify TOTP code
    const isValid = authenticator.verify({ token: code, secret: user.totp_secret });

    if (!isValid) {
      // Try recovery codes
      const recoveryCodes = await query(
        `SELECT id, code_hash FROM recovery_codes WHERE user_id = ? AND used_at IS NULL`,
        [user.id]
      );

      let recoveryCodeUsed = false;
      const cleanCode = code.replace('-', '').toUpperCase();

      for (const rc of recoveryCodes) {
        try {
          if (await argon2.verify(rc.code_hash, cleanCode)) {
            // Mark recovery code as used
            await query(
              `UPDATE recovery_codes SET used_at = NOW() WHERE id = ?`,
              [rc.id]
            );
            recoveryCodeUsed = true;
            break;
          }
        } catch {
          // Continue checking other codes
        }
      }

      if (!recoveryCodeUsed) {
        await logSecurityEvent(user.id, 'totp_verify_failed', ip, userAgent, { reason: 'invalid_code' });
        return res.status(401).json({
          success: false,
          message: 'Code invalide',
        });
      }

      await logSecurityEvent(user.id, 'recovery_code_used', ip, userAgent, null);
    }

    await logSecurityEvent(user.id, 'totp_verify_success', ip, userAgent, null);

    // Return success (the calling code should generate the JWT)
    res.json({
      success: true,
      verified: true,
      user_id: toNumber(user.id),
    });
  } catch (err) {
    console.error('TOTP verify error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du code',
    });
  }
});

// POST /totp/disable - Disable 2FA
router.post('/disable', authenticate, async (req, res) => {
  try {
    const { code, password } = req.body;
    const user = req.user;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    if (!code || !password) {
      return res.status(400).json({
        success: false,
        message: 'Code et mot de passe requis',
      });
    }

    // Verify password first
    const users = await query(
      `SELECT password_hash, totp_secret FROM users WHERE id = ?`,
      [user.id]
    );

    if (users.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Utilisateur non trouvé',
      });
    }

    let passwordValid = false;
    try {
      passwordValid = await argon2.verify(users[0].password_hash, password);
    } catch (err) {
      console.error('Password verification error:', err);
    }

    if (!passwordValid) {
      await logSecurityEvent(user.id, 'totp_disable_failed', ip, userAgent, { reason: 'invalid_password' });
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect',
      });
    }

    // Verify TOTP code
    const secret = users[0].totp_secret;
    const isValid = authenticator.verify({ token: code, secret });

    if (!isValid) {
      await logSecurityEvent(user.id, 'totp_disable_failed', ip, userAgent, { reason: 'invalid_code' });
      return res.status(401).json({
        success: false,
        message: 'Code 2FA invalide',
      });
    }

    // Disable 2FA
    await query(
      `UPDATE users SET totp_enabled = 0, totp_secret = NULL WHERE id = ?`,
      [user.id]
    );

    // Delete all recovery codes
    await query(
      `DELETE FROM recovery_codes WHERE user_id = ?`,
      [user.id]
    );

    await logSecurityEvent(user.id, 'totp_disabled', ip, userAgent, null);

    res.json({
      success: true,
      message: 'Authentification à deux facteurs désactivée',
    });
  } catch (err) {
    console.error('TOTP disable error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la désactivation de la 2FA',
    });
  }
});

// POST /totp/regenerate-codes - Generate new recovery codes
router.post('/regenerate-codes', authenticate, async (req, res) => {
  try {
    const { code, password } = req.body;
    const user = req.user;
    const ip = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || null;

    if (!code || !password) {
      return res.status(400).json({
        success: false,
        message: 'Code et mot de passe requis',
      });
    }

    if (!user.totp_enabled) {
      return res.status(400).json({
        success: false,
        message: '2FA non activée',
      });
    }

    // Verify password
    const users = await query(
      `SELECT password_hash, totp_secret FROM users WHERE id = ?`,
      [user.id]
    );

    let passwordValid = false;
    try {
      passwordValid = await argon2.verify(users[0].password_hash, password);
    } catch (err) {
      console.error('Password verification error:', err);
    }

    if (!passwordValid) {
      return res.status(401).json({
        success: false,
        message: 'Mot de passe incorrect',
      });
    }

    // Verify TOTP code
    const isValid = authenticator.verify({ token: code, secret: users[0].totp_secret });
    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: 'Code 2FA invalide',
      });
    }

    // Delete old recovery codes
    await query(
      `DELETE FROM recovery_codes WHERE user_id = ?`,
      [user.id]
    );

    // Generate new recovery codes
    const recoveryCodes = generateRecoveryCodes(8);

    for (const code of recoveryCodes) {
      const codeHash = await argon2.hash(code.replace('-', ''), {
        type: argon2.argon2id,
        memoryCost: 16384,
        timeCost: 2,
        parallelism: 1,
      });
      await query(
        `INSERT INTO recovery_codes (user_id, code_hash) VALUES (?, ?)`,
        [user.id, codeHash]
      );
    }

    await logSecurityEvent(user.id, 'recovery_codes_regenerated', ip, userAgent, null);

    res.json({
      success: true,
      recovery_codes: recoveryCodes,
      message: 'Nouveaux codes de récupération générés',
    });
  } catch (err) {
    console.error('Regenerate codes error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la régénération des codes',
    });
  }
});

// GET /totp/status - Check 2FA status
router.get('/status', authenticate, async (req, res) => {
  try {
    const user = req.user;

    // Count remaining recovery codes
    const result = await query(
      `SELECT COUNT(*) as count FROM recovery_codes WHERE user_id = ? AND used_at IS NULL`,
      [user.id]
    );

    const remainingCodes = Number(result[0]?.count || 0);

    res.json({
      success: true,
      enabled: Boolean(user.totp_enabled),
      recovery_codes_remaining: remainingCodes,
    });
  } catch (err) {
    console.error('TOTP status error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur lors de la vérification du statut',
    });
  }
});

export default router;

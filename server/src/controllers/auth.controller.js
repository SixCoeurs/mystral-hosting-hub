import argon2 from 'argon2';
import { z } from 'zod';
import { query, queryOne, insert, transaction } from '../config/database.js';
import {
  generateUUID,
  generateToken,
  hashToken,
  generateJWT,
  sanitizeUser,
  formatDateForDB,
  getExpirationDate
} from '../utils/helpers.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';

// Schémas de validation
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  first_name: z.string().min(1, 'Prénom requis').max(100),
  last_name: z.string().min(1, 'Nom requis').max(100),
  phone: z.string().optional(),
  company_name: z.string().optional()
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Mot de passe requis'),
  totp_code: z.string().optional()
});

const passwordChangeSchema = z.object({
  current_password: z.string().min(1, 'Mot de passe actuel requis'),
  new_password: z.string().min(8, 'Le nouveau mot de passe doit contenir au moins 8 caractères')
});

// Inscription
export const register = asyncHandler(async (req, res) => {
  const data = registerSchema.parse(req.body);

  // Vérifier si l'email existe déjà
  const existingUser = await queryOne(
    'SELECT id FROM users WHERE email = ?',
    [data.email.toLowerCase()]
  );

  if (existingUser) {
    throw new AppError('Cet email est déjà utilisé', 409);
  }

  // Hasher le mot de passe avec Argon2id
  const passwordHash = await argon2.hash(data.password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });

  // Générer un UUID pour l'utilisateur
  const uuid = generateUUID();

  // Créer l'utilisateur
  await transaction(async (conn) => {
    // Insérer l'utilisateur
    const [result] = await conn.execute(
      `INSERT INTO users (uuid, email, password_hash, first_name, last_name, phone, company_name, status, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active', 'client')`,
      [
        uuid,
        data.email.toLowerCase(),
        passwordHash,
        data.first_name,
        data.last_name,
        data.phone || null,
        data.company_name || null
      ]
    );

    const userId = result.insertId;

    // Créer le compte de crédit
    await conn.execute(
      'INSERT INTO user_credits (user_id, balance) VALUES (?, 0)',
      [userId]
    );

    // Logger l'événement de sécurité
    await conn.execute(
      `INSERT INTO security_logs (user_id, event_type, ip_address, user_agent)
       VALUES (?, 'register', ?, ?)`,
      [userId, req.ip, req.get('User-Agent')]
    );

    // Générer un token de vérification email
    const verifyToken = generateToken();
    await conn.execute(
      `INSERT INTO user_tokens (user_id, token_hash, type, expires_at)
       VALUES (?, ?, 'email_verify', DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
      [userId, hashToken(verifyToken)]
    );

    // TODO: Envoyer l'email de vérification avec le token
  });

  // Récupérer l'utilisateur créé
  const user = await queryOne(
    `SELECT id, uuid, email, email_verified, first_name, last_name,
            phone, company_name, role, status, totp_enabled, created_at
     FROM users WHERE uuid = ?`,
    [uuid]
  );

  // Générer le JWT
  const token = generateJWT({ uuid: user.uuid, role: user.role });

  res.status(201).json({
    success: true,
    data: {
      user: sanitizeUser(user),
      token
    }
  });
});

// Connexion
export const login = asyncHandler(async (req, res) => {
  const data = loginSchema.parse(req.body);

  // Récupérer l'utilisateur
  const user = await queryOne(
    `SELECT id, uuid, email, email_verified, password_hash, first_name, last_name,
            phone, company_name, address_line1, address_line2, city, postal_code,
            country_code, role, status, totp_enabled, totp_secret, created_at, last_login_at
     FROM users WHERE email = ?`,
    [data.email.toLowerCase()]
  );

  // Vérifier les identifiants
  if (!user) {
    // Logger la tentative échouée
    await query(
      `INSERT INTO security_logs (event_type, ip_address, user_agent, details)
       VALUES ('login_failed', ?, ?, ?)`,
      [req.ip, req.get('User-Agent'), JSON.stringify({ email: data.email, reason: 'user_not_found' })]
    );

    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  // Vérifier le statut du compte
  if (user.status === 'banned') {
    throw new AppError('Votre compte a été suspendu. Contactez le support.', 403);
  }

  if (user.status === 'suspended') {
    throw new AppError('Votre compte est temporairement suspendu.', 403);
  }

  // Vérifier le mot de passe
  const validPassword = await argon2.verify(user.password_hash, data.password);

  if (!validPassword) {
    await query(
      `INSERT INTO security_logs (user_id, event_type, ip_address, user_agent, details)
       VALUES (?, 'login_failed', ?, ?, ?)`,
      [user.id, req.ip, req.get('User-Agent'), JSON.stringify({ reason: 'invalid_password' })]
    );

    throw new AppError('Email ou mot de passe incorrect', 401);
  }

  // TODO: Vérifier le code 2FA si activé
  if (user.totp_enabled) {
    if (!data.totp_code) {
      return res.status(200).json({
        success: true,
        requires_2fa: true,
        message: 'Code 2FA requis'
      });
    }
    // Ici, on vérifierait le code TOTP avec une lib comme speakeasy
    // Pour l'instant, on skip cette vérification
  }

  // Mettre à jour le dernier login
  await query(
    `UPDATE users SET last_login_at = NOW(), last_login_ip = ? WHERE id = ?`,
    [req.ip, user.id]
  );

  // Logger le succès
  await query(
    `INSERT INTO security_logs (user_id, event_type, ip_address, user_agent)
     VALUES (?, 'login_success', ?, ?)`,
    [user.id, req.ip, req.get('User-Agent')]
  );

  // Générer le JWT
  const token = generateJWT({ uuid: user.uuid, role: user.role });

  // Créer une session en DB (optionnel, pour tracking)
  const sessionToken = generateToken();
  await query(
    `INSERT INTO user_sessions (user_id, token_hash, ip_address, user_agent, expires_at)
     VALUES (?, ?, ?, ?, DATE_ADD(NOW(), INTERVAL 24 HOUR))`,
    [user.id, hashToken(sessionToken), req.ip, req.get('User-Agent')]
  );

  res.json({
    success: true,
    data: {
      user: sanitizeUser(user),
      token
    }
  });
});

// Déconnexion
export const logout = asyncHandler(async (req, res) => {
  if (req.user) {
    // Révoquer toutes les sessions actives de l'utilisateur
    await query(
      `UPDATE user_sessions SET revoked = 1 WHERE user_id = ? AND revoked = 0`,
      [req.user.id]
    );

    // Logger
    await query(
      `INSERT INTO security_logs (user_id, event_type, ip_address, user_agent)
       VALUES (?, 'logout', ?, ?)`,
      [req.user.id, req.ip, req.get('User-Agent')]
    );
  }

  res.json({
    success: true,
    message: 'Déconnexion réussie'
  });
});

// Obtenir l'utilisateur courant
export const me = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    data: {
      user: sanitizeUser(req.user)
    }
  });
});

// Changer le mot de passe
export const changePassword = asyncHandler(async (req, res) => {
  const data = passwordChangeSchema.parse(req.body);

  // Récupérer le hash actuel
  const user = await queryOne(
    'SELECT password_hash FROM users WHERE id = ?',
    [req.user.id]
  );

  // Vérifier le mot de passe actuel
  const validPassword = await argon2.verify(user.password_hash, data.current_password);

  if (!validPassword) {
    throw new AppError('Mot de passe actuel incorrect', 401);
  }

  // Hasher le nouveau mot de passe
  const newPasswordHash = await argon2.hash(data.new_password, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4
  });

  // Mettre à jour
  await query(
    'UPDATE users SET password_hash = ? WHERE id = ?',
    [newPasswordHash, req.user.id]
  );

  // Logger
  await query(
    `INSERT INTO security_logs (user_id, event_type, ip_address, user_agent)
     VALUES (?, 'password_change', ?, ?)`,
    [req.user.id, req.ip, req.get('User-Agent')]
  );

  // Révoquer les autres sessions
  await query(
    `UPDATE user_sessions SET revoked = 1 WHERE user_id = ?`,
    [req.user.id]
  );

  // Générer un nouveau token
  const token = generateJWT({ uuid: req.user.uuid, role: req.user.role });

  res.json({
    success: true,
    message: 'Mot de passe modifié avec succès',
    data: { token }
  });
});

// Demande de réinitialisation de mot de passe
export const requestPasswordReset = asyncHandler(async (req, res) => {
  const { email } = req.body;

  const user = await queryOne(
    'SELECT id, email FROM users WHERE email = ?',
    [email.toLowerCase()]
  );

  // Toujours renvoyer succès (sécurité)
  if (!user) {
    return res.json({
      success: true,
      message: 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé.'
    });
  }

  // Générer le token
  const resetToken = generateToken();

  await query(
    `INSERT INTO user_tokens (user_id, token_hash, type, expires_at)
     VALUES (?, ?, 'password_reset', DATE_ADD(NOW(), INTERVAL 1 HOUR))`,
    [user.id, hashToken(resetToken)]
  );

  // TODO: Envoyer l'email avec le lien de reset
  // En dev, on log le token
  console.log(`Password reset token for ${email}: ${resetToken}`);

  res.json({
    success: true,
    message: 'Si un compte existe avec cet email, un lien de réinitialisation sera envoyé.'
  });
});

// Obtenir les logs de sécurité
export const getSecurityLogs = asyncHandler(async (req, res) => {
  const logs = await query(
    `SELECT event_type, ip_address, user_agent, created_at, details
     FROM security_logs
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [req.user.id]
  );

  res.json({
    success: true,
    data: logs
  });
});

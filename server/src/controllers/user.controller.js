import { z } from 'zod';
import { query, queryOne } from '../config/database.js';
import { sanitizeUser } from '../utils/helpers.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';

// Schéma de mise à jour du profil
const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).optional(),
  last_name: z.string().min(1).max(100).optional(),
  phone: z.string().max(20).optional().nullable(),
  company_name: z.string().max(255).optional().nullable(),
  address_line1: z.string().max(255).optional().nullable(),
  address_line2: z.string().max(255).optional().nullable(),
  city: z.string().max(100).optional().nullable(),
  postal_code: z.string().max(20).optional().nullable(),
  country_code: z.string().length(2).optional()
});

// Obtenir le profil complet
export const getProfile = asyncHandler(async (req, res) => {
  const user = await queryOne(
    `SELECT id, uuid, email, email_verified, first_name, last_name,
            phone, company_name, address_line1, address_line2, city,
            postal_code, country_code, role, status, totp_enabled,
            created_at, last_login_at
     FROM users WHERE id = ?`,
    [req.user.id]
  );

  res.json({
    success: true,
    data: sanitizeUser(user)
  });
});

// Mettre à jour le profil
export const updateProfile = asyncHandler(async (req, res) => {
  const data = updateProfileSchema.parse(req.body);

  // Construire la requête de mise à jour dynamiquement
  const updates = [];
  const values = [];

  Object.entries(data).forEach(([key, value]) => {
    if (value !== undefined) {
      updates.push(`${key} = ?`);
      values.push(value);
    }
  });

  if (updates.length === 0) {
    throw new AppError('Aucune donnée à mettre à jour', 400);
  }

  values.push(req.user.id);

  await query(
    `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
    values
  );

  // Récupérer l'utilisateur mis à jour
  const updatedUser = await queryOne(
    `SELECT id, uuid, email, email_verified, first_name, last_name,
            phone, company_name, address_line1, address_line2, city,
            postal_code, country_code, role, status, totp_enabled,
            created_at, last_login_at
     FROM users WHERE id = ?`,
    [req.user.id]
  );

  res.json({
    success: true,
    data: sanitizeUser(updatedUser)
  });
});

// Obtenir le solde de crédit
export const getCredits = asyncHandler(async (req, res) => {
  const credits = await queryOne(
    'SELECT balance FROM user_credits WHERE user_id = ?',
    [req.user.id]
  );

  res.json({
    success: true,
    data: {
      balance: credits?.balance || 0
    }
  });
});

// Historique des transactions de crédit
export const getCreditHistory = asyncHandler(async (req, res) => {
  const transactions = await query(
    `SELECT amount, balance_after, type, description, reference_type, reference_id, created_at
     FROM credit_transactions
     WHERE user_id = ?
     ORDER BY created_at DESC
     LIMIT 50`,
    [req.user.id]
  );

  res.json({
    success: true,
    data: transactions
  });
});

// Obtenir les notifications
export const getNotifications = asyncHandler(async (req, res) => {
  const { unread_only } = req.query;

  let sql = `SELECT id, type, title, message, action_url, is_read, created_at
             FROM notifications
             WHERE user_id = ?`;

  if (unread_only === 'true') {
    sql += ' AND is_read = 0';
  }

  sql += ' ORDER BY created_at DESC LIMIT 50';

  const notifications = await query(sql, [req.user.id]);

  res.json({
    success: true,
    data: notifications
  });
});

// Marquer une notification comme lue
export const markNotificationRead = asyncHandler(async (req, res) => {
  const { id } = req.params;

  await query(
    `UPDATE notifications SET is_read = 1, read_at = NOW()
     WHERE id = ? AND user_id = ?`,
    [id, req.user.id]
  );

  res.json({
    success: true
  });
});

// Marquer toutes les notifications comme lues
export const markAllNotificationsRead = asyncHandler(async (req, res) => {
  await query(
    `UPDATE notifications SET is_read = 1, read_at = NOW()
     WHERE user_id = ? AND is_read = 0`,
    [req.user.id]
  );

  res.json({
    success: true
  });
});

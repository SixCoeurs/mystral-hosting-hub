import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

// Générer un UUID v4
export function generateUUID() {
  return uuidv4();
}

// Générer un token aléatoire (pour sessions, reset password, etc.)
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex');
}

// Hash SHA-256 d'un token (pour stockage en DB)
export function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

// Générer un JWT
export function generateJWT(payload, expiresIn = process.env.JWT_EXPIRES_IN || '24h') {
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
}

// Vérifier un JWT
export function verifyJWT(token) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// Chiffrement AES-256-GCM pour données sensibles (2FA secrets, etc.)
export function encrypt(text) {
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);

  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  // Format: iv:authTag:encrypted
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
}

// Déchiffrement AES-256-GCM
export function decrypt(encryptedText) {
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex');
  const parts = encryptedText.split(':');

  if (parts.length !== 3) {
    throw new Error('Format de données chiffrées invalide');
  }

  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];

  const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Formater une date pour MySQL
export function formatDateForDB(date = new Date()) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

// Calculer une date d'expiration
export function getExpirationDate(hours = 24) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date;
}

// Nettoyer un objet user pour l'envoyer au frontend (sans données sensibles)
export function sanitizeUser(user) {
  if (!user) return null;

  const {
    password_hash,
    totp_secret,
    backup_codes,
    ...safeUser
  } = user;

  return safeUser;
}

// Valider un email
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Générer un numéro de facture
export function generateInvoiceNumber(sequence) {
  const year = new Date().getFullYear();
  const paddedSeq = String(sequence).padStart(6, '0');
  return `INV-${year}-${paddedSeq}`;
}

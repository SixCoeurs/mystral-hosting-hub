/**
 * Migration: Add 2FA columns to users table
 * Run with: node src/migrations/add-2fa-columns.js
 */
import { query } from '../config/database.js';

async function migrate() {
  console.log('Starting 2FA migration...\n');

  try {
    // Check if totp_secret column exists
    const columns = await query(`SHOW COLUMNS FROM users LIKE 'totp_secret'`);

    if (columns.length === 0) {
      console.log('Adding totp_secret column...');
      await query(`ALTER TABLE users ADD COLUMN totp_secret VARCHAR(255) DEFAULT NULL AFTER totp_enabled`);
      console.log('✅ totp_secret column added');
    } else {
      console.log('✅ totp_secret column already exists');
    }

    // Check if totp_enabled column exists
    const totpEnabledCol = await query(`SHOW COLUMNS FROM users LIKE 'totp_enabled'`);
    if (totpEnabledCol.length === 0) {
      console.log('Adding totp_enabled column...');
      await query(`ALTER TABLE users ADD COLUMN totp_enabled TINYINT(1) NOT NULL DEFAULT 0 AFTER email_verified`);
      console.log('✅ totp_enabled column added');
    } else {
      console.log('✅ totp_enabled column already exists');
    }

    // Create recovery_codes table if not exists
    console.log('\nChecking recovery_codes table...');
    await query(`
      CREATE TABLE IF NOT EXISTS recovery_codes (
        id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
        user_id BIGINT UNSIGNED NOT NULL,
        code_hash VARCHAR(255) NOT NULL,
        used_at DATETIME DEFAULT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_codes (user_id, used_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('✅ recovery_codes table ready');

    console.log('\n✅ 2FA migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('\n❌ Migration failed:', err.message);
    process.exit(1);
  }
}

migrate();

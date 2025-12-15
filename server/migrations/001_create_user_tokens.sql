-- Migration: Create user_tokens table for email verification and password reset
-- Run this migration if the table doesn't exist

CREATE TABLE IF NOT EXISTS user_tokens (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNSIGNED NOT NULL,
    token_type ENUM('email_verification', 'password_reset', 'api_key') NOT NULL,
    token VARCHAR(255) NOT NULL,
    expires_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_user_tokens_user_id (user_id),
    INDEX idx_user_tokens_token (token),
    INDEX idx_user_tokens_type_expires (token_type, expires_at),

    CONSTRAINT fk_user_tokens_user FOREIGN KEY (user_id)
        REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Clean up expired tokens (can be run periodically via cron)
-- DELETE FROM user_tokens WHERE expires_at < NOW();

-- ============================================================
-- MYSTRAL HOSTING - Initialisation Base de Données
-- MariaDB 10.6+
-- ============================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- Créer la base de données si elle n'existe pas
CREATE DATABASE IF NOT EXISTS mystral
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE mystral;

-- ============================================================
-- GESTION DES UTILISATEURS
-- ============================================================

CREATE TABLE IF NOT EXISTS users (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36) NOT NULL UNIQUE,

    -- Authentification
    email           VARCHAR(255) NOT NULL UNIQUE,
    email_verified  TINYINT(1) NOT NULL DEFAULT 0,
    password_hash   VARCHAR(255) NOT NULL,

    -- Infos personnelles
    first_name      VARCHAR(100) NOT NULL,
    last_name       VARCHAR(100) NOT NULL,
    phone           VARCHAR(20) DEFAULT NULL,
    company_name    VARCHAR(255) DEFAULT NULL,

    -- Adresse de facturation
    address_line1   VARCHAR(255) DEFAULT NULL,
    address_line2   VARCHAR(255) DEFAULT NULL,
    city            VARCHAR(100) DEFAULT NULL,
    postal_code     VARCHAR(20) DEFAULT NULL,
    country_code    CHAR(2) DEFAULT 'FR',

    -- Statut & rôles
    role            ENUM('client', 'reseller', 'support', 'admin') NOT NULL DEFAULT 'client',
    status          ENUM('pending', 'active', 'suspended', 'banned') NOT NULL DEFAULT 'pending',

    -- 2FA
    totp_secret     VARCHAR(255) DEFAULT NULL,
    totp_enabled    TINYINT(1) NOT NULL DEFAULT 0,
    backup_codes    TEXT DEFAULT NULL,

    -- Métadonnées
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_login_at   DATETIME DEFAULT NULL,
    last_login_ip   VARCHAR(45) DEFAULT NULL,

    INDEX idx_email (email),
    INDEX idx_status (status),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- Sessions utilisateur
CREATE TABLE IF NOT EXISTS user_sessions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,

    token_hash      CHAR(64) NOT NULL UNIQUE,

    ip_address      VARCHAR(45) NOT NULL,
    user_agent      VARCHAR(512) DEFAULT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      DATETIME NOT NULL,
    last_active_at  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    revoked         TINYINT(1) NOT NULL DEFAULT 0,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token (token_hash),
    INDEX idx_user_sessions (user_id, revoked),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- Tokens de réinitialisation / vérification email
CREATE TABLE IF NOT EXISTS user_tokens (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,

    token_hash      CHAR(64) NOT NULL UNIQUE,
    type            ENUM('email_verify', 'password_reset', 'api_key') NOT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at      DATETIME NOT NULL,
    used_at         DATETIME DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_token_lookup (token_hash, type),
    INDEX idx_expires (expires_at)
) ENGINE=InnoDB;

-- Logs de sécurité
CREATE TABLE IF NOT EXISTS security_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED DEFAULT NULL,

    event_type      VARCHAR(50) NOT NULL,
    ip_address      VARCHAR(45) NOT NULL,
    user_agent      VARCHAR(512) DEFAULT NULL,
    details         JSON DEFAULT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_events (user_id, event_type),
    INDEX idx_ip (ip_address),
    INDEX idx_created (created_at)
) ENGINE=InnoDB;

-- ============================================================
-- CATALOGUE PRODUITS
-- ============================================================

CREATE TABLE IF NOT EXISTS product_categories (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    slug            VARCHAR(50) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT DEFAULT NULL,
    icon            VARCHAR(50) DEFAULT NULL,
    sort_order      INT NOT NULL DEFAULT 0,
    is_active       TINYINT(1) NOT NULL DEFAULT 1,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS locations (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    code            VARCHAR(10) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    country_code    CHAR(2) NOT NULL,
    provider        VARCHAR(50) DEFAULT NULL,
    is_active       TINYINT(1) NOT NULL DEFAULT 1,

    INDEX idx_country (country_code)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS products (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36) NOT NULL UNIQUE,
    category_id     INT UNSIGNED NOT NULL,

    slug            VARCHAR(100) NOT NULL UNIQUE,
    name            VARCHAR(100) NOT NULL,
    description     TEXT DEFAULT NULL,

    specs           JSON NOT NULL,

    price_monthly   DECIMAL(10,2) NOT NULL,
    price_quarterly DECIMAL(10,2) DEFAULT NULL,
    price_yearly    DECIMAL(10,2) DEFAULT NULL,
    setup_fee       DECIMAL(10,2) NOT NULL DEFAULT 0,

    stock           INT DEFAULT NULL,
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    is_featured     TINYINT(1) NOT NULL DEFAULT 0,
    sort_order      INT NOT NULL DEFAULT 0,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (category_id) REFERENCES product_categories(id),
    INDEX idx_category (category_id, is_active),
    INDEX idx_featured (is_featured, sort_order)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_locations (
    product_id      INT UNSIGNED NOT NULL,
    location_id     INT UNSIGNED NOT NULL,
    stock           INT DEFAULT NULL,
    price_modifier  DECIMAL(10,2) DEFAULT 0,

    PRIMARY KEY (product_id, location_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_addons (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    slug            VARCHAR(50) NOT NULL,
    name            VARCHAR(100) NOT NULL,
    description     VARCHAR(255) DEFAULT NULL,

    addon_type      ENUM('resource', 'feature', 'service') NOT NULL,
    unit            VARCHAR(20) DEFAULT NULL,

    price_monthly   DECIMAL(10,2) NOT NULL,
    price_yearly    DECIMAL(10,2) DEFAULT NULL,
    setup_fee       DECIMAL(10,2) NOT NULL DEFAULT 0,

    is_active       TINYINT(1) NOT NULL DEFAULT 1,

    UNIQUE KEY uk_slug (slug)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS product_addon_links (
    product_id      INT UNSIGNED NOT NULL,
    addon_id        INT UNSIGNED NOT NULL,
    max_quantity    INT DEFAULT NULL,

    PRIMARY KEY (product_id, addon_id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    FOREIGN KEY (addon_id) REFERENCES product_addons(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- STRIPE & PAIEMENTS
-- ============================================================

CREATE TABLE IF NOT EXISTS stripe_customers (
    user_id             BIGINT UNSIGNED PRIMARY KEY,
    stripe_customer_id  VARCHAR(50) NOT NULL UNIQUE,
    default_payment_method VARCHAR(50) DEFAULT NULL,

    created_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS payment_methods (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,

    stripe_pm_id    VARCHAR(50) NOT NULL UNIQUE,
    type            ENUM('card', 'sepa_debit', 'bancontact', 'ideal') NOT NULL DEFAULT 'card',

    card_brand      VARCHAR(20) DEFAULT NULL,
    card_last4      CHAR(4) DEFAULT NULL,
    card_exp_month  TINYINT UNSIGNED DEFAULT NULL,
    card_exp_year   SMALLINT UNSIGNED DEFAULT NULL,
    card_country    CHAR(2) DEFAULT NULL,

    sepa_last4      CHAR(4) DEFAULT NULL,
    sepa_bank_code  VARCHAR(20) DEFAULT NULL,

    display_name    VARCHAR(100) NOT NULL,

    is_default      TINYINT(1) NOT NULL DEFAULT 0,
    is_active       TINYINT(1) NOT NULL DEFAULT 1,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_default (user_id, is_default, is_active),
    INDEX idx_stripe_pm (stripe_pm_id)
) ENGINE=InnoDB;

-- ============================================================
-- COMMANDES & FACTURATION
-- ============================================================

CREATE TABLE IF NOT EXISTS orders (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36) NOT NULL UNIQUE,
    user_id         BIGINT UNSIGNED NOT NULL,

    subtotal        DECIMAL(10,2) NOT NULL,
    tax_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate        DECIMAL(5,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total           DECIMAL(10,2) NOT NULL,

    status          ENUM('pending', 'paid', 'processing', 'completed', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',

    payment_method_id   BIGINT UNSIGNED DEFAULT NULL,
    paid_at             DATETIME DEFAULT NULL,

    promo_code_id   BIGINT UNSIGNED DEFAULT NULL,
    ip_address      VARCHAR(45) DEFAULT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (payment_method_id) REFERENCES payment_methods(id) ON DELETE SET NULL,
    INDEX idx_user_orders (user_id, status),
    INDEX idx_status (status, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS order_items (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT UNSIGNED NOT NULL,

    product_id      INT UNSIGNED DEFAULT NULL,
    addon_id        INT UNSIGNED DEFAULT NULL,

    item_name       VARCHAR(255) NOT NULL,
    item_specs      JSON DEFAULT NULL,

    quantity        INT NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2) NOT NULL,
    total_price     DECIMAL(10,2) NOT NULL,

    billing_cycle   ENUM('monthly', 'quarterly', 'yearly', 'once') NOT NULL DEFAULT 'monthly',

    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (addon_id) REFERENCES product_addons(id) ON DELETE SET NULL,
    INDEX idx_order (order_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS invoices (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36) NOT NULL UNIQUE,
    user_id         BIGINT UNSIGNED NOT NULL,
    order_id        BIGINT UNSIGNED DEFAULT NULL,

    invoice_number  VARCHAR(50) NOT NULL UNIQUE,

    subtotal        DECIMAL(10,2) NOT NULL,
    tax_amount      DECIMAL(10,2) NOT NULL DEFAULT 0,
    tax_rate        DECIMAL(5,2) NOT NULL DEFAULT 0,
    discount_amount DECIMAL(10,2) NOT NULL DEFAULT 0,
    total           DECIMAL(10,2) NOT NULL,
    amount_paid     DECIMAL(10,2) NOT NULL DEFAULT 0,

    status          ENUM('draft', 'pending', 'paid', 'partial', 'overdue', 'cancelled', 'refunded') NOT NULL DEFAULT 'pending',

    issue_date      DATE NOT NULL,
    due_date        DATE NOT NULL,
    paid_at         DATETIME DEFAULT NULL,

    billing_address JSON NOT NULL,

    notes           TEXT DEFAULT NULL,
    admin_notes     TEXT DEFAULT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE SET NULL,
    INDEX idx_user_invoices (user_id, status),
    INDEX idx_due_date (due_date, status),
    INDEX idx_number (invoice_number)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS promo_codes (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,

    code            VARCHAR(50) NOT NULL UNIQUE,
    description     VARCHAR(255) DEFAULT NULL,

    discount_type   ENUM('percent', 'fixed') NOT NULL,
    discount_value  DECIMAL(10,2) NOT NULL,

    min_order       DECIMAL(10,2) DEFAULT NULL,
    max_discount    DECIMAL(10,2) DEFAULT NULL,

    valid_from      DATETIME NOT NULL,
    valid_until     DATETIME DEFAULT NULL,

    max_uses        INT DEFAULT NULL,
    max_per_user    INT DEFAULT 1,
    current_uses    INT NOT NULL DEFAULT 0,

    allowed_products JSON DEFAULT NULL,
    allowed_categories JSON DEFAULT NULL,

    is_active       TINYINT(1) NOT NULL DEFAULT 1,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_code (code, is_active)
) ENGINE=InnoDB;

-- ============================================================
-- CRÉDITS UTILISATEUR
-- ============================================================

CREATE TABLE IF NOT EXISTS user_credits (
    user_id         BIGINT UNSIGNED PRIMARY KEY,
    balance         DECIMAL(10,2) NOT NULL DEFAULT 0,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS credit_transactions (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,

    amount          DECIMAL(10,2) NOT NULL,
    balance_after   DECIMAL(10,2) NOT NULL,

    type            ENUM('deposit', 'payment', 'refund', 'adjustment', 'promo') NOT NULL,
    description     VARCHAR(255) DEFAULT NULL,
    reference_type  VARCHAR(50) DEFAULT NULL,
    reference_id    BIGINT UNSIGNED DEFAULT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_transactions (user_id, created_at)
) ENGINE=InnoDB;

-- ============================================================
-- SERVICES (Instances clients)
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36) NOT NULL UNIQUE,
    user_id         BIGINT UNSIGNED NOT NULL,
    product_id      INT UNSIGNED DEFAULT NULL,
    location_id     INT UNSIGNED DEFAULT NULL,
    order_item_id   BIGINT UNSIGNED DEFAULT NULL,

    hostname        VARCHAR(255) DEFAULT NULL,
    label           VARCHAR(100) DEFAULT NULL,

    status          ENUM('pending', 'provisioning', 'active', 'suspended', 'terminated', 'cancelled') NOT NULL DEFAULT 'pending',
    suspension_reason VARCHAR(255) DEFAULT NULL,

    current_specs   JSON NOT NULL,

    billing_cycle   ENUM('monthly', 'quarterly', 'yearly') NOT NULL DEFAULT 'monthly',
    billing_amount  DECIMAL(10,2) NOT NULL,
    next_due_date   DATE NOT NULL,

    primary_ip      VARCHAR(45) DEFAULT NULL,

    provisioned_at  DATETIME DEFAULT NULL,
    expires_at      DATETIME DEFAULT NULL,
    cancelled_at    DATETIME DEFAULT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE SET NULL,
    FOREIGN KEY (location_id) REFERENCES locations(id) ON DELETE SET NULL,
    FOREIGN KEY (order_item_id) REFERENCES order_items(id) ON DELETE SET NULL,
    INDEX idx_user_services (user_id, status),
    INDEX idx_status (status),
    INDEX idx_due_date (next_due_date, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS service_ips (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id      BIGINT UNSIGNED NOT NULL,

    ip_address      VARCHAR(45) NOT NULL,
    ip_version      TINYINT NOT NULL,
    is_primary      TINYINT(1) NOT NULL DEFAULT 0,

    rdns            VARCHAR(255) DEFAULT NULL,

    assigned_at     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    UNIQUE KEY uk_ip (ip_address),
    INDEX idx_service (service_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS service_addons (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id      BIGINT UNSIGNED NOT NULL,
    addon_id        INT UNSIGNED NOT NULL,

    quantity        INT NOT NULL DEFAULT 1,
    unit_price      DECIMAL(10,2) NOT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (addon_id) REFERENCES product_addons(id),
    INDEX idx_service (service_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS service_logs (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    service_id      BIGINT UNSIGNED NOT NULL,
    user_id         BIGINT UNSIGNED DEFAULT NULL,

    action          VARCHAR(50) NOT NULL,
    details         JSON DEFAULT NULL,

    ip_address      VARCHAR(45) DEFAULT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_service_logs (service_id, created_at)
) ENGINE=InnoDB;

-- ============================================================
-- SUPPORT
-- ============================================================

CREATE TABLE IF NOT EXISTS support_departments (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(255) DEFAULT NULL,
    is_active       TINYINT(1) NOT NULL DEFAULT 1,
    sort_order      INT NOT NULL DEFAULT 0
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS tickets (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    uuid            CHAR(36) NOT NULL UNIQUE,
    user_id         BIGINT UNSIGNED NOT NULL,
    department_id   INT UNSIGNED DEFAULT NULL,
    service_id      BIGINT UNSIGNED DEFAULT NULL,

    subject         VARCHAR(255) NOT NULL,

    priority        ENUM('low', 'medium', 'high', 'urgent') NOT NULL DEFAULT 'medium',
    status          ENUM('open', 'answered', 'customer_reply', 'on_hold', 'closed') NOT NULL DEFAULT 'open',

    assigned_to     BIGINT UNSIGNED DEFAULT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    closed_at       DATETIME DEFAULT NULL,

    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (department_id) REFERENCES support_departments(id) ON DELETE SET NULL,
    FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE SET NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user_tickets (user_id, status),
    INDEX idx_status (status, priority),
    INDEX idx_assigned (assigned_to, status)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket_messages (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    ticket_id       BIGINT UNSIGNED NOT NULL,
    user_id         BIGINT UNSIGNED NOT NULL,

    message         TEXT NOT NULL,
    is_staff        TINYINT(1) NOT NULL DEFAULT 0,
    is_internal     TINYINT(1) NOT NULL DEFAULT 0,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    INDEX idx_ticket (ticket_id, created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS ticket_attachments (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    message_id      BIGINT UNSIGNED NOT NULL,

    filename        VARCHAR(255) NOT NULL,
    original_name   VARCHAR(255) NOT NULL,
    mime_type       VARCHAR(100) NOT NULL,
    size_bytes      INT UNSIGNED NOT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (message_id) REFERENCES ticket_messages(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- ============================================================
-- NOTIFICATIONS
-- ============================================================

CREATE TABLE IF NOT EXISTS notifications (
    id              BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT UNSIGNED NOT NULL,

    type            VARCHAR(50) NOT NULL,
    title           VARCHAR(255) NOT NULL,
    message         TEXT NOT NULL,

    action_url      VARCHAR(500) DEFAULT NULL,

    is_read         TINYINT(1) NOT NULL DEFAULT 0,
    read_at         DATETIME DEFAULT NULL,

    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_unread (user_id, is_read, created_at)
) ENGINE=InnoDB;

-- ============================================================
-- CONFIGURATION SYSTÈME
-- ============================================================

CREATE TABLE IF NOT EXISTS settings (
    `key`           VARCHAR(100) PRIMARY KEY,
    `value`         TEXT NOT NULL,
    `type`          ENUM('string', 'int', 'float', 'bool', 'json') NOT NULL DEFAULT 'string',
    description     VARCHAR(255) DEFAULT NULL,
    updated_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- DONNÉES INITIALES
-- ============================================================

-- Catégories par défaut
INSERT IGNORE INTO product_categories (slug, name, description, sort_order) VALUES
('vps', 'VPS', 'Serveurs Privés Virtuels haute performance', 1),
('vds', 'VDS', 'Serveurs Dédiés Virtuels avec ressources garanties', 2),
('dedicated', 'Serveurs Dédiés', 'Serveurs physiques dédiés', 3),
('game', 'Serveurs de Jeux', 'Hébergement optimisé pour les jeux', 4),
('web', 'Hébergement Web', 'Hébergement mutualisé et WordPress', 5),
('domain', 'Noms de Domaine', 'Enregistrement et transfert de domaines', 6);

-- Localisations par défaut
INSERT IGNORE INTO locations (code, name, country_code, provider) VALUES
('FR-PAR', 'Paris', 'FR', 'Mystral'),
('FR-GRA', 'Gravelines', 'FR', 'OVH'),
('FR-RBX', 'Roubaix', 'FR', 'OVH'),
('FR-SBG', 'Strasbourg', 'FR', 'OVH'),
('DE-FRA', 'Frankfurt', 'DE', 'Hetzner'),
('DE-FSN', 'Falkenstein', 'DE', 'Hetzner');

-- Départements support
INSERT IGNORE INTO support_departments (name, sort_order) VALUES
('Support Technique', 1),
('Facturation', 2),
('Commercial', 3),
('Abus / Sécurité', 4);

-- Paramètres par défaut
INSERT IGNORE INTO settings (`key`, `value`, `type`, description) VALUES
('company_name', 'Mystral Hosting', 'string', 'Nom de la société'),
('company_email', 'contact@mystral.fr', 'string', 'Email de contact'),
('default_tax_rate', '20.00', 'float', 'Taux de TVA par défaut'),
('invoice_prefix', 'INV', 'string', 'Préfixe des factures'),
('session_lifetime', '86400', 'int', 'Durée de session en secondes'),
('max_login_attempts', '5', 'int', 'Tentatives de connexion max'),
('lockout_duration', '900', 'int', 'Durée de blocage en secondes');

-- Quelques produits VPS de base
INSERT IGNORE INTO products (uuid, category_id, slug, name, description, specs, price_monthly, price_quarterly, price_yearly, setup_fee, is_featured, sort_order) VALUES
(UUID(), 1, 'vps-starter', 'VPS Starter', 'Parfait pour débuter', '{"cpu_cores": 1, "cpu_type": "AMD EPYC", "ram_gb": 2, "storage_gb": 20, "storage_type": "NVMe SSD", "bandwidth_tb": 1, "port_speed_gbps": 1, "ipv4_included": 1, "ipv6_included": 1, "ddos_protection": true}', 4.99, 13.99, 49.99, 0, 0, 1),
(UUID(), 1, 'vps-essential', 'VPS Essential', 'Pour les projets en croissance', '{"cpu_cores": 2, "cpu_type": "AMD EPYC", "ram_gb": 4, "storage_gb": 40, "storage_type": "NVMe SSD", "bandwidth_tb": 2, "port_speed_gbps": 1, "ipv4_included": 1, "ipv6_included": 1, "ddos_protection": true}', 9.99, 27.99, 99.99, 0, 1, 2),
(UUID(), 1, 'vps-business', 'VPS Business', 'Pour les applications professionnelles', '{"cpu_cores": 4, "cpu_type": "AMD EPYC", "ram_gb": 8, "storage_gb": 80, "storage_type": "NVMe SSD", "bandwidth_tb": 5, "port_speed_gbps": 1, "ipv4_included": 1, "ipv6_included": 1, "ddos_protection": true}', 19.99, 54.99, 199.99, 0, 1, 3),
(UUID(), 1, 'vps-enterprise', 'VPS Enterprise', 'Performance maximale', '{"cpu_cores": 8, "cpu_type": "AMD EPYC", "ram_gb": 16, "storage_gb": 160, "storage_type": "NVMe SSD", "bandwidth_tb": 10, "port_speed_gbps": 1, "ipv4_included": 1, "ipv6_included": 1, "ddos_protection": true}', 39.99, 109.99, 399.99, 0, 0, 4);

-- Produits VDS
INSERT IGNORE INTO products (uuid, category_id, slug, name, description, specs, price_monthly, price_quarterly, price_yearly, setup_fee, is_featured, sort_order) VALUES
(UUID(), 2, 'vds-game-1', 'VDS GAME 1', 'Serveur dédié virtuel pour gaming', '{"cpu_cores": 4, "cpu_type": "AMD Ryzen 9", "ram_gb": 16, "storage_gb": 100, "storage_type": "NVMe SSD", "bandwidth_tb": 10, "port_speed_gbps": 1, "ipv4_included": 1, "ipv6_included": 1, "ddos_protection": true}', 29.99, 84.99, 299.99, 0, 1, 1),
(UUID(), 2, 'vds-game-2', 'VDS GAME 2', 'Pour les serveurs de jeux exigeants', '{"cpu_cores": 6, "cpu_type": "AMD Ryzen 9", "ram_gb": 32, "storage_gb": 200, "storage_type": "NVMe SSD", "bandwidth_tb": 20, "port_speed_gbps": 1, "ipv4_included": 1, "ipv6_included": 1, "ddos_protection": true}', 49.99, 139.99, 499.99, 0, 1, 2),
(UUID(), 2, 'vds-game-3', 'VDS GAME 3', 'Performance ultime pour gaming', '{"cpu_cores": 8, "cpu_type": "AMD Ryzen 9", "ram_gb": 64, "storage_gb": 400, "storage_type": "NVMe SSD", "bandwidth_tb": 30, "port_speed_gbps": 1, "ipv4_included": 1, "ipv6_included": 1, "ddos_protection": true}', 79.99, 219.99, 799.99, 0, 0, 3);

-- Produits Game Servers
INSERT IGNORE INTO products (uuid, category_id, slug, name, description, specs, price_monthly, price_quarterly, price_yearly, setup_fee, is_featured, sort_order) VALUES
(UUID(), 4, 'minecraft-starter', 'Minecraft Starter', 'Serveur Minecraft pour petite communauté', '{"game": "minecraft", "slots": 10, "ram_gb": 2, "storage_gb": 10, "ddos_protection": true, "auto_backup": true}', 2.99, 7.99, 29.99, 0, 0, 1),
(UUID(), 4, 'minecraft-essential', 'Minecraft Essential', 'Serveur Minecraft pour communauté moyenne', '{"game": "minecraft", "slots": 30, "ram_gb": 4, "storage_gb": 20, "ddos_protection": true, "auto_backup": true}', 5.99, 15.99, 59.99, 0, 1, 2),
(UUID(), 4, 'minecraft-premium', 'Minecraft Premium', 'Serveur Minecraft haute performance', '{"game": "minecraft", "slots": 100, "ram_gb": 8, "storage_gb": 40, "ddos_protection": true, "auto_backup": true}', 9.99, 27.99, 99.99, 0, 1, 3),
(UUID(), 4, 'fivem-starter', 'FiveM Starter', 'Serveur FiveM pour débutants', '{"game": "fivem", "slots": 32, "ram_gb": 8, "storage_gb": 50, "ddos_protection": true, "auto_backup": true}', 14.99, 39.99, 149.99, 0, 0, 4),
(UUID(), 4, 'fivem-essential', 'FiveM Essential', 'Serveur FiveM pour communauté établie', '{"game": "fivem", "slots": 64, "ram_gb": 16, "storage_gb": 100, "ddos_protection": true, "auto_backup": true}', 24.99, 69.99, 249.99, 0, 1, 5),
(UUID(), 4, 'rust-starter', 'Rust Starter', 'Serveur Rust pour petits groupes', '{"game": "rust", "slots": 50, "ram_gb": 8, "storage_gb": 50, "ddos_protection": true, "auto_backup": true}', 9.99, 27.99, 99.99, 0, 0, 6),
(UUID(), 4, 'rust-essential', 'Rust Essential', 'Serveur Rust communautaire', '{"game": "rust", "slots": 150, "ram_gb": 16, "storage_gb": 100, "ddos_protection": true, "auto_backup": true}', 19.99, 54.99, 199.99, 0, 1, 7);

-- Addons
INSERT IGNORE INTO product_addons (slug, name, description, addon_type, unit, price_monthly, price_yearly, setup_fee) VALUES
('extra-ip', 'IP supplémentaire', 'Adresse IPv4 additionnelle', 'resource', 'IP', 2.00, 20.00, 0),
('extra-storage-50', 'Stockage +50GB', '50GB de stockage NVMe supplémentaire', 'resource', 'GB', 5.00, 50.00, 0),
('extra-storage-100', 'Stockage +100GB', '100GB de stockage NVMe supplémentaire', 'resource', 'GB', 9.00, 90.00, 0),
('extra-ram-2', 'RAM +2GB', '2GB de RAM supplémentaire', 'resource', 'GB', 3.00, 30.00, 0),
('extra-ram-4', 'RAM +4GB', '4GB de RAM supplémentaire', 'resource', 'GB', 5.00, 50.00, 0),
('backup-daily', 'Backup Quotidien', 'Sauvegarde automatique quotidienne', 'service', NULL, 2.99, 29.99, 0),
('backup-hourly', 'Backup Horaire', 'Sauvegarde automatique toutes les heures', 'service', NULL, 9.99, 99.99, 0),
('managed-support', 'Support Géré', 'Support technique prioritaire 24/7', 'service', NULL, 19.99, 199.99, 0),
('ddos-premium', 'Anti-DDoS Premium', 'Protection DDoS avancée jusqu\'à 1Tbps', 'feature', NULL, 9.99, 99.99, 0);

-- ============================================================
-- FIN DE L'INITIALISATION
-- ============================================================

SELECT 'Base de données Mystral initialisée avec succès!' AS status;

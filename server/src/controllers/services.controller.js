import { z } from 'zod';
import { query, queryOne, transaction } from '../config/database.js';
import { generateUUID } from '../utils/helpers.js';
import { asyncHandler, AppError } from '../middleware/error.middleware.js';

// Obtenir tous les services de l'utilisateur
export const getServices = asyncHandler(async (req, res) => {
  const services = await query(
    `SELECT
      s.id, s.uuid, s.hostname, s.label, s.status, s.suspension_reason,
      s.current_specs, s.billing_cycle, s.billing_amount, s.next_due_date,
      s.primary_ip, s.provisioned_at, s.created_at,
      p.name AS product_name, p.specs AS product_specs,
      pc.name AS category_name, pc.slug AS category_slug,
      l.name AS location_name, l.code AS location_code
     FROM services s
     LEFT JOIN products p ON s.product_id = p.id
     LEFT JOIN product_categories pc ON p.category_id = pc.id
     LEFT JOIN locations l ON s.location_id = l.id
     WHERE s.user_id = ? AND s.status != 'terminated'
     ORDER BY s.created_at DESC`,
    [req.user.id]
  );

  // Parser les JSON specs
  const parsedServices = services.map(service => ({
    ...service,
    current_specs: service.current_specs ? JSON.parse(service.current_specs) : null,
    product_specs: service.product_specs ? JSON.parse(service.product_specs) : null
  }));

  res.json({
    success: true,
    data: parsedServices
  });
});

// Obtenir un service spécifique
export const getService = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const service = await queryOne(
    `SELECT
      s.id, s.uuid, s.hostname, s.label, s.status, s.suspension_reason,
      s.current_specs, s.billing_cycle, s.billing_amount, s.next_due_date,
      s.primary_ip, s.provisioned_at, s.expires_at, s.created_at,
      p.name AS product_name, p.specs AS product_specs, p.description AS product_description,
      pc.name AS category_name, pc.slug AS category_slug,
      l.name AS location_name, l.code AS location_code, l.country_code
     FROM services s
     LEFT JOIN products p ON s.product_id = p.id
     LEFT JOIN product_categories pc ON p.category_id = pc.id
     LEFT JOIN locations l ON s.location_id = l.id
     WHERE s.uuid = ? AND s.user_id = ?`,
    [uuid, req.user.id]
  );

  if (!service) {
    throw new AppError('Service non trouvé', 404);
  }

  // Récupérer les IPs du service
  const ips = await query(
    `SELECT ip_address, ip_version, is_primary, rdns
     FROM service_ips WHERE service_id = ?`,
    [service.id]
  );

  // Récupérer les addons actifs
  const addons = await query(
    `SELECT sa.quantity, sa.unit_price, pa.name, pa.slug, pa.addon_type
     FROM service_addons sa
     JOIN product_addons pa ON sa.addon_id = pa.id
     WHERE sa.service_id = ?`,
    [service.id]
  );

  res.json({
    success: true,
    data: {
      ...service,
      current_specs: service.current_specs ? JSON.parse(service.current_specs) : null,
      product_specs: service.product_specs ? JSON.parse(service.product_specs) : null,
      ips,
      addons
    }
  });
});

// Mettre à jour le label d'un service
export const updateServiceLabel = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const { label } = req.body;

  if (!label || label.length > 100) {
    throw new AppError('Label invalide (max 100 caractères)', 400);
  }

  const result = await query(
    `UPDATE services SET label = ? WHERE uuid = ? AND user_id = ?`,
    [label, uuid, req.user.id]
  );

  if (result.affectedRows === 0) {
    throw new AppError('Service non trouvé', 404);
  }

  // Logger l'action
  const service = await queryOne('SELECT id FROM services WHERE uuid = ?', [uuid]);
  await query(
    `INSERT INTO service_logs (service_id, user_id, action, details, ip_address)
     VALUES (?, ?, 'label_update', ?, ?)`,
    [service.id, req.user.id, JSON.stringify({ new_label: label }), req.ip]
  );

  res.json({
    success: true,
    message: 'Label mis à jour'
  });
});

// Actions sur un service (start, stop, reboot, reinstall)
export const serviceAction = asyncHandler(async (req, res) => {
  const { uuid } = req.params;
  const { action } = req.body;

  const validActions = ['start', 'stop', 'reboot', 'reinstall'];
  if (!validActions.includes(action)) {
    throw new AppError('Action invalide', 400);
  }

  const service = await queryOne(
    `SELECT id, status FROM services WHERE uuid = ? AND user_id = ?`,
    [uuid, req.user.id]
  );

  if (!service) {
    throw new AppError('Service non trouvé', 404);
  }

  if (service.status === 'suspended') {
    throw new AppError('Service suspendu. Contactez le support.', 403);
  }

  if (service.status !== 'active' && action !== 'start') {
    throw new AppError('Le service doit être actif pour cette action', 400);
  }

  // Logger l'action
  await query(
    `INSERT INTO service_logs (service_id, user_id, action, ip_address)
     VALUES (?, ?, ?, ?)`,
    [service.id, req.user.id, action, req.ip]
  );

  // TODO: Ici on appellerait l'API du provider (Proxmox, etc.) pour exécuter l'action

  res.json({
    success: true,
    message: `Action '${action}' en cours d'exécution`
  });
});

// Obtenir les logs d'un service
export const getServiceLogs = asyncHandler(async (req, res) => {
  const { uuid } = req.params;

  const service = await queryOne(
    'SELECT id FROM services WHERE uuid = ? AND user_id = ?',
    [uuid, req.user.id]
  );

  if (!service) {
    throw new AppError('Service non trouvé', 404);
  }

  const logs = await query(
    `SELECT sl.action, sl.details, sl.ip_address, sl.created_at,
            CONCAT(u.first_name, ' ', u.last_name) AS user_name
     FROM service_logs sl
     LEFT JOIN users u ON sl.user_id = u.id
     WHERE sl.service_id = ?
     ORDER BY sl.created_at DESC
     LIMIT 100`,
    [service.id]
  );

  res.json({
    success: true,
    data: logs
  });
});

// =====================
// PRODUITS & CATALOGUE
// =====================

// Obtenir les catégories de produits
export const getCategories = asyncHandler(async (req, res) => {
  const categories = await query(
    `SELECT id, slug, name, description, icon, sort_order
     FROM product_categories
     WHERE is_active = 1
     ORDER BY sort_order`
  );

  res.json({
    success: true,
    data: categories
  });
});

// Obtenir les produits d'une catégorie
export const getProducts = asyncHandler(async (req, res) => {
  const { category } = req.query;

  let sql = `
    SELECT p.id, p.uuid, p.slug, p.name, p.description, p.specs,
           p.price_monthly, p.price_quarterly, p.price_yearly, p.setup_fee,
           p.stock, p.is_featured, p.sort_order,
           pc.slug AS category_slug, pc.name AS category_name
    FROM products p
    JOIN product_categories pc ON p.category_id = pc.id
    WHERE p.is_active = 1`;

  const params = [];

  if (category) {
    sql += ' AND pc.slug = ?';
    params.push(category);
  }

  sql += ' ORDER BY p.sort_order, p.price_monthly';

  const products = await query(sql, params);

  // Parser les specs JSON
  const parsedProducts = products.map(p => ({
    ...p,
    specs: p.specs ? JSON.parse(p.specs) : null
  }));

  res.json({
    success: true,
    data: parsedProducts
  });
});

// Obtenir un produit spécifique
export const getProduct = asyncHandler(async (req, res) => {
  const { slug } = req.params;

  const product = await queryOne(
    `SELECT p.*, pc.slug AS category_slug, pc.name AS category_name
     FROM products p
     JOIN product_categories pc ON p.category_id = pc.id
     WHERE p.slug = ? AND p.is_active = 1`,
    [slug]
  );

  if (!product) {
    throw new AppError('Produit non trouvé', 404);
  }

  // Récupérer les localisations disponibles
  const locations = await query(
    `SELECT l.id, l.code, l.name, l.country_code, pl.stock, pl.price_modifier
     FROM product_locations pl
     JOIN locations l ON pl.location_id = l.id
     WHERE pl.product_id = ? AND l.is_active = 1`,
    [product.id]
  );

  // Récupérer les addons disponibles
  const addons = await query(
    `SELECT pa.id, pa.slug, pa.name, pa.description, pa.addon_type, pa.unit,
            pa.price_monthly, pa.price_yearly, pa.setup_fee, pal.max_quantity
     FROM product_addon_links pal
     JOIN product_addons pa ON pal.addon_id = pa.id
     WHERE pal.product_id = ? AND pa.is_active = 1`,
    [product.id]
  );

  res.json({
    success: true,
    data: {
      ...product,
      specs: product.specs ? JSON.parse(product.specs) : null,
      locations,
      addons
    }
  });
});

// Obtenir les localisations
export const getLocations = asyncHandler(async (req, res) => {
  const locations = await query(
    `SELECT id, code, name, country_code, provider
     FROM locations
     WHERE is_active = 1
     ORDER BY country_code, name`
  );

  res.json({
    success: true,
    data: locations
  });
});

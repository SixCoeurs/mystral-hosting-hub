import express from 'express';
import { query } from '../config/database.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Helper to convert BigInt to Number
function toNumber(val) {
  return typeof val === 'bigint' ? Number(val) : val;
}

// All routes require authentication
router.use(authenticate);

// GET /services - Get user's services
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const status = req.query.status; // Optional filter

    let sql = `
      SELECT
        s.id, s.uuid, s.hostname, s.label, s.status, s.current_specs,
        s.billing_cycle, s.billing_amount, s.next_due_date, s.primary_ip,
        s.provisioned_at, s.created_at,
        p.name AS product_name, p.slug AS product_slug,
        pc.name AS category_name, pc.slug AS category_slug,
        l.name AS location_name, l.code AS location_code
      FROM services s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE s.user_id = ?
    `;
    const params = [userId];

    if (status) {
      sql += ' AND s.status = ?';
      params.push(status);
    }

    sql += ' ORDER BY s.created_at DESC';

    const services = await query(sql, params);

    res.json({
      success: true,
      services: services.map(service => ({
        id: toNumber(service.id),
        uuid: service.uuid,
        hostname: service.hostname,
        label: service.label,
        status: service.status,
        specs: typeof service.current_specs === 'string'
          ? JSON.parse(service.current_specs)
          : service.current_specs,
        billing: {
          cycle: service.billing_cycle,
          amount: parseFloat(service.billing_amount),
          next_due_date: service.next_due_date,
        },
        primary_ip: service.primary_ip,
        product: service.product_name ? {
          name: service.product_name,
          slug: service.product_slug,
          category: service.category_name,
          category_slug: service.category_slug,
        } : null,
        location: service.location_name ? {
          name: service.location_name,
          code: service.location_code,
        } : null,
        provisioned_at: service.provisioned_at,
        created_at: service.created_at,
      })),
    });
  } catch (err) {
    console.error('Get services error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur lors de la récupération des services',
    });
  }
});

// GET /services/:uuid - Get specific service details
router.get('/:uuid', async (req, res) => {
  try {
    const userId = req.user.id;
    const { uuid } = req.params;

    const services = await query(
      `SELECT
        s.id, s.uuid, s.hostname, s.label, s.status, s.suspension_reason,
        s.current_specs, s.billing_cycle, s.billing_amount, s.next_due_date,
        s.primary_ip, s.provisioned_at, s.expires_at, s.created_at,
        p.name AS product_name, p.slug AS product_slug, p.description AS product_description,
        pc.name AS category_name, pc.slug AS category_slug,
        l.name AS location_name, l.code AS location_code, l.country_code
      FROM services s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN product_categories pc ON p.category_id = pc.id
      LEFT JOIN locations l ON s.location_id = l.id
      WHERE s.uuid = ? AND s.user_id = ?`,
      [uuid, userId]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
      });
    }

    const service = services[0];

    // Get service IPs
    const ips = await query(
      'SELECT ip_address, ip_version, is_primary, rdns FROM service_ips WHERE service_id = ?',
      [service.id]
    );

    // Get service addons
    const addons = await query(
      `SELECT sa.quantity, sa.unit_price, pa.name, pa.slug, pa.unit
       FROM service_addons sa
       JOIN product_addons pa ON sa.addon_id = pa.id
       WHERE sa.service_id = ?`,
      [service.id]
    );

    res.json({
      success: true,
      service: {
        id: toNumber(service.id),
        uuid: service.uuid,
        hostname: service.hostname,
        label: service.label,
        status: service.status,
        suspension_reason: service.suspension_reason,
        specs: typeof service.current_specs === 'string'
          ? JSON.parse(service.current_specs)
          : service.current_specs,
        billing: {
          cycle: service.billing_cycle,
          amount: parseFloat(service.billing_amount),
          next_due_date: service.next_due_date,
        },
        primary_ip: service.primary_ip,
        ips: ips.map(ip => ({
          address: ip.ip_address,
          version: ip.ip_version,
          is_primary: Boolean(ip.is_primary),
          rdns: ip.rdns,
        })),
        addons: addons.map(addon => ({
          name: addon.name,
          slug: addon.slug,
          quantity: addon.quantity,
          unit: addon.unit,
          unit_price: parseFloat(addon.unit_price),
        })),
        product: service.product_name ? {
          name: service.product_name,
          slug: service.product_slug,
          description: service.product_description,
          category: service.category_name,
          category_slug: service.category_slug,
        } : null,
        location: service.location_name ? {
          name: service.location_name,
          code: service.location_code,
          country_code: service.country_code,
        } : null,
        provisioned_at: service.provisioned_at,
        expires_at: service.expires_at,
        created_at: service.created_at,
      },
    });
  } catch (err) {
    console.error('Get service error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// GET /services/:uuid/logs - Get service activity logs
router.get('/:uuid/logs', async (req, res) => {
  try {
    const userId = req.user.id;
    const { uuid } = req.params;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);

    // Verify service belongs to user
    const services = await query(
      'SELECT id FROM services WHERE uuid = ? AND user_id = ?',
      [uuid, userId]
    );

    if (services.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Service non trouvé',
      });
    }

    const logs = await query(
      `SELECT sl.action, sl.details, sl.ip_address, sl.created_at,
              u.first_name, u.last_name
       FROM service_logs sl
       LEFT JOIN users u ON sl.user_id = u.id
       WHERE sl.service_id = ?
       ORDER BY sl.created_at DESC
       LIMIT ?`,
      [services[0].id, limit]
    );

    res.json({
      success: true,
      logs: logs.map(log => ({
        action: log.action,
        details: log.details ? (typeof log.details === 'string' ? JSON.parse(log.details) : log.details) : null,
        ip_address: log.ip_address,
        user: log.first_name ? `${log.first_name} ${log.last_name}` : 'Système',
        created_at: log.created_at,
      })),
    });
  } catch (err) {
    console.error('Get service logs error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

export default router;

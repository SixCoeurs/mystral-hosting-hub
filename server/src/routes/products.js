import express from 'express';
import { query } from '../config/database.js';

const router = express.Router();

// GET /products - Get all active products
router.get('/', async (req, res) => {
  try {
    const category = req.query.category;
    const featured = req.query.featured === 'true';

    let sql = `
      SELECT
        p.id, p.uuid, p.slug, p.name, p.description, p.specs,
        p.price_monthly, p.price_quarterly, p.price_yearly, p.setup_fee,
        p.stock, p.is_featured, p.sort_order,
        pc.name AS category_name, pc.slug AS category_slug, pc.icon AS category_icon
      FROM products p
      JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.is_active = 1 AND pc.is_active = 1
    `;
    const params = [];

    if (category) {
      sql += ' AND pc.slug = ?';
      params.push(category);
    }

    if (featured) {
      sql += ' AND p.is_featured = 1';
    }

    sql += ' ORDER BY p.sort_order ASC, p.price_monthly ASC';

    const products = await query(sql, params);

    res.json({
      success: true,
      products: products.map(product => ({
        id: product.id,
        uuid: product.uuid,
        slug: product.slug,
        name: product.name,
        description: product.description,
        specs: typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs,
        pricing: {
          monthly: parseFloat(product.price_monthly),
          quarterly: product.price_quarterly ? parseFloat(product.price_quarterly) : null,
          yearly: product.price_yearly ? parseFloat(product.price_yearly) : null,
          setup_fee: parseFloat(product.setup_fee),
        },
        stock: product.stock,
        in_stock: product.stock === null || product.stock > 0,
        is_featured: Boolean(product.is_featured),
        category: {
          name: product.category_name,
          slug: product.category_slug,
          icon: product.category_icon,
        },
      })),
    });
  } catch (err) {
    console.error('Get products error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// GET /products/categories - Get all categories
router.get('/categories', async (req, res) => {
  try {
    const categories = await query(
      `SELECT id, slug, name, description, icon, sort_order
       FROM product_categories
       WHERE is_active = 1
       ORDER BY sort_order ASC`
    );

    res.json({
      success: true,
      categories: categories.map(cat => ({
        id: cat.id,
        slug: cat.slug,
        name: cat.name,
        description: cat.description,
        icon: cat.icon,
      })),
    });
  } catch (err) {
    console.error('Get categories error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// GET /products/locations - Get all locations
router.get('/locations', async (req, res) => {
  try {
    const locations = await query(
      `SELECT id, code, name, country_code, provider
       FROM locations
       WHERE is_active = 1
       ORDER BY country_code, name`
    );

    res.json({
      success: true,
      locations: locations.map(loc => ({
        id: loc.id,
        code: loc.code,
        name: loc.name,
        country_code: loc.country_code,
        provider: loc.provider,
      })),
    });
  } catch (err) {
    console.error('Get locations error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

// GET /products/:slug - Get specific product
router.get('/:slug', async (req, res) => {
  try {
    const { slug } = req.params;

    const products = await query(
      `SELECT
        p.id, p.uuid, p.slug, p.name, p.description, p.specs,
        p.price_monthly, p.price_quarterly, p.price_yearly, p.setup_fee,
        p.stock, p.is_featured,
        pc.name AS category_name, pc.slug AS category_slug, pc.icon AS category_icon
      FROM products p
      JOIN product_categories pc ON p.category_id = pc.id
      WHERE p.slug = ? AND p.is_active = 1`,
      [slug]
    );

    if (products.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Produit non trouvé',
      });
    }

    const product = products[0];

    // Get available locations for this product
    const locations = await query(
      `SELECT l.id, l.code, l.name, l.country_code, pl.stock, pl.price_modifier
       FROM product_locations pl
       JOIN locations l ON pl.location_id = l.id
       WHERE pl.product_id = ? AND l.is_active = 1`,
      [product.id]
    );

    // Get available addons for this product
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
      product: {
        id: product.id,
        uuid: product.uuid,
        slug: product.slug,
        name: product.name,
        description: product.description,
        specs: typeof product.specs === 'string' ? JSON.parse(product.specs) : product.specs,
        pricing: {
          monthly: parseFloat(product.price_monthly),
          quarterly: product.price_quarterly ? parseFloat(product.price_quarterly) : null,
          yearly: product.price_yearly ? parseFloat(product.price_yearly) : null,
          setup_fee: parseFloat(product.setup_fee),
        },
        stock: product.stock,
        in_stock: product.stock === null || product.stock > 0,
        is_featured: Boolean(product.is_featured),
        category: {
          name: product.category_name,
          slug: product.category_slug,
          icon: product.category_icon,
        },
        locations: locations.map(loc => ({
          id: loc.id,
          code: loc.code,
          name: loc.name,
          country_code: loc.country_code,
          stock: loc.stock,
          price_modifier: loc.price_modifier ? parseFloat(loc.price_modifier) : 0,
        })),
        addons: addons.map(addon => ({
          id: addon.id,
          slug: addon.slug,
          name: addon.name,
          description: addon.description,
          type: addon.addon_type,
          unit: addon.unit,
          pricing: {
            monthly: parseFloat(addon.price_monthly),
            yearly: addon.price_yearly ? parseFloat(addon.price_yearly) : null,
            setup_fee: parseFloat(addon.setup_fee),
          },
          max_quantity: addon.max_quantity,
        })),
      },
    });
  } catch (err) {
    console.error('Get product error:', err);
    res.status(500).json({
      success: false,
      message: 'Erreur serveur',
    });
  }
});

export default router;

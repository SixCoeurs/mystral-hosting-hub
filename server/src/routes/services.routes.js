import { Router } from 'express';
import {
  getServices,
  getService,
  updateServiceLabel,
  serviceAction,
  getServiceLogs,
  getCategories,
  getProducts,
  getProduct,
  getLocations
} from '../controllers/services.controller.js';
import { authenticate, optionalAuth } from '../middleware/auth.middleware.js';

const router = Router();

// Routes publiques (catalogue)
router.get('/categories', getCategories);
router.get('/products', getProducts);
router.get('/products/:slug', getProduct);
router.get('/locations', getLocations);

// Routes protégées (services utilisateur)
router.get('/', authenticate, getServices);
router.get('/:uuid', authenticate, getService);
router.put('/:uuid/label', authenticate, updateServiceLabel);
router.post('/:uuid/action', authenticate, serviceAction);
router.get('/:uuid/logs', authenticate, getServiceLogs);

export default router;

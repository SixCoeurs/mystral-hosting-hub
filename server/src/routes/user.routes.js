import { Router } from 'express';
import {
  getProfile,
  updateProfile,
  getCredits,
  getCreditHistory,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/user.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Toutes les routes sont protégées
router.use(authenticate);

// Profil
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

// Crédits
router.get('/credits', getCredits);
router.get('/credits/history', getCreditHistory);

// Notifications
router.get('/notifications', getNotifications);
router.put('/notifications/:id/read', markNotificationRead);
router.put('/notifications/read-all', markAllNotificationsRead);

export default router;

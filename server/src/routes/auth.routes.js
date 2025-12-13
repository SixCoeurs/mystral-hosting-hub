import { Router } from 'express';
import {
  register,
  login,
  logout,
  me,
  changePassword,
  requestPasswordReset,
  getSecurityLogs
} from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Routes publiques
router.post('/register', register);
router.post('/login', login);
router.post('/password-reset', requestPasswordReset);

// Routes protégées
router.post('/logout', authenticate, logout);
router.get('/me', authenticate, me);
router.put('/password', authenticate, changePassword);
router.get('/security-logs', authenticate, getSecurityLogs);

export default router;

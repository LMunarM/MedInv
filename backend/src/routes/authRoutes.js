import express from 'express';
import {
  registerUser,
  loginUser,
  getUserProfile,
  changePassword,
  getUsers,
  updateUser,
  toggleUserStatus,
} from '../controllers/authController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Rutas públicas
router.post('/login', loginUser);

// Rutas privadas (cualquier usuario autenticado)
router.get('/profile', protect, getUserProfile);
router.put('/change-password', protect, changePassword);

// Rutas exclusivas para el Administrador
router.post('/register', protect, authorize('administrador'), registerUser);
router.get('/users', protect, authorize('administrador'), getUsers);
router.put('/users/:id', protect, authorize('administrador'), updateUser);
router.patch('/users/:id/status', protect, authorize('administrador'), toggleUserStatus);

export default router;
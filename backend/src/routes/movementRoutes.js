import express from 'express';
import {
  registerEntry,
  registerExit,
  getBatchesByProduct,
  getMovements,
} from '../controllers/movementController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Consultar lotes y movimientos
router.get('/batches/:productId', protect, getBatchesByProduct);
router.get('/', protect, getMovements);

// Registrar entradas (Almacén, Administrador y Farmacia)
router.post(
  '/entry',
  protect,
  authorize('administrador', 'almacen', 'farmacia'),
  registerEntry
);

// Registrar salidas (Almacén, Farmacia, Enfermería y Administrador)
router.post(
  '/exit',
  protect,
  authorize('administrador', 'almacen', 'farmacia', 'enfermeria'),
  registerExit
);

export default router;
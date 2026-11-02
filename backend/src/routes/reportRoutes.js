import express from 'express';
import {
  getDashboardKPIs,
  getMovementHistory,
  getConsumptionByCategory,
  getLossesReport,
  exportInventoryToExcel,
} from '../controllers/reportController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);

router.get(
  '/dashboard',
  authorize('administrador', 'farmacia', 'almacen', 'compras'),
  getDashboardKPIs
);

router.get(
  '/history',
  authorize('administrador', 'farmacia', 'almacen', 'enfermeria'),
  getMovementHistory
);

router.get(
  '/consumption-by-category',
  authorize('administrador', 'farmacia', 'almacen'),
  getConsumptionByCategory
);

router.get(
  '/losses',
  authorize('administrador', 'farmacia'),
  getLossesReport
);

router.get(
  '/export/excel',
  authorize('administrador', 'farmacia', 'almacen', 'compras'),
  exportInventoryToExcel
);

export default router;
import express from 'express';
import {
  getSuppliers,
  createSupplier,
  updateSupplier,
  getPurchaseOrders,
  createPurchaseOrder,
  updateOrderStatus,
  receivePurchaseOrder,
} from '../controllers/purchaseController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Rutas de Proveedores
router.get('/suppliers', protect, getSuppliers);
router.post(
  '/suppliers',
  protect,
  authorize('administrador', 'compras'),
  createSupplier
);
router.put(
  '/suppliers/:id',
  protect,
  authorize('administrador', 'compras'),
  updateSupplier
);

// Rutas de Órdenes de Compra
router.get('/orders', protect, getPurchaseOrders);
router.post(
  '/orders',
  protect,
  authorize('administrador', 'compras', 'farmacia'),
  createPurchaseOrder
);
router.patch(
  '/orders/:id/status',
  protect,
  authorize('administrador', 'compras'),
  updateOrderStatus
);
router.post(
  '/orders/:id/receive',
  protect,
  authorize('administrador', 'almacen', 'compras'),
  receivePurchaseOrder
);

export default router;
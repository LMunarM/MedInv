import express from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/productController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

// Rutas accesibles por todos los roles autenticados (incluye Enfermería y Compras)
router.get('/', protect, getProducts);
router.get('/:id', protect, getProductById);

// Rutas de administración de catálogo
router.post(
  '/',
  protect,
  authorize('administrador', 'almacen', 'farmacia'),
  createProduct
);

router.put(
  '/:id',
  protect,
  authorize('administrador', 'almacen', 'farmacia'),
  updateProduct
);

router.delete(
  '/:id',
  protect,
  authorize('administrador', 'farmacia'),
  deleteProduct
);

export default router;
import express from 'express';
import { getABCAnalysis, getReorderPoints } from '../controllers/inventoryPolicyController.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();

router.use(protect);
router.get('/abc-analysis', authorize('administrador', 'compras', 'farmacia'), getABCAnalysis);
router.get('/reorder-points', authorize('administrador', 'compras', 'farmacia', 'almacen'), getReorderPoints);

export default router;
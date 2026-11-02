import express from 'express';
import { getAlertsSummary } from '../controllers/alertController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

router.get('/', protect, getAlertsSummary);

export default router;
import { Router } from 'express';
import menuRoutes from './menu';
import giftsRoutes from './gifts';
import guestsRoutes from './guests';
import paymentsRoutes from './payments';
import webhookRoutes from './webhook';
import menu from './menu';
import suppliers from './suppliers';
import { authMiddleware } from '../middlewares/auth';

const router = Router();

router.use(menuRoutes);
router.use('/webhook', webhookRoutes);
router.use('/payment', authMiddleware, paymentsRoutes);
router.use('/gifts', authMiddleware, giftsRoutes);
router.use('/guests', authMiddleware, guestsRoutes);
router.use('/menu', authMiddleware, menu);
router.use('/suppliers', authMiddleware, suppliers);

export default router; 
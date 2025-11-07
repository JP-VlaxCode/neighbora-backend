import { Router } from 'express';
import { verifyToken, requireAdmin } from '../../../middleware/auth';
import condominiumRoutes from './condominiumRoutes';
import propertyRoutes from './propertyRoutes';
import commonExpenseRoutes from './commonExpenseRoutes';
import publicationRoutes from './publicationRoutes';
import residentRoutes from './residentRoutes';
import adminRoutes from './adminRoutes';

const router = Router();

// All admin routes require authentication
router.use(verifyToken);

// Mount sub-routes
router.use('/condominiums', condominiumRoutes);
router.use('/properties', propertyRoutes);
router.use('/common-expenses', commonExpenseRoutes);
router.use('/publications', publicationRoutes);
router.use('/residents', residentRoutes);
router.use('/admins', adminRoutes);

export default router;

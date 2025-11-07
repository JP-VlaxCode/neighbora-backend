import { Router } from 'express';
import { verifyToken, requireAdmin } from '@middleware/auth';
import {
  getCondominiumResidents,
  getPropertyResidents,
  addResident,
  updateResident,
  removeResident,
  getResidentStats
} from '../controllers/residentController';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/admin/residents/condominium/:condominiumId - Get all residents for a condominium
router.get('/condominium/:condominiumId', getCondominiumResidents);

// GET /api/admin/residents/condominium/:condominiumId/stats - Get resident statistics
router.get('/condominium/:condominiumId/stats', getResidentStats);

// GET /api/admin/residents/property/:propertyId - Get residents for a property
router.get('/property/:propertyId', getPropertyResidents);

// Admin only routes
router.use(requireAdmin);

// POST /api/admin/residents/property/:propertyId - Add resident to property
router.post('/property/:propertyId', addResident);

// PUT /api/admin/residents/property/:propertyId/:residentEmail - Update resident
router.put('/property/:propertyId/:residentEmail', updateResident);

// DELETE /api/admin/residents/property/:propertyId/:residentEmail - Remove resident
router.delete('/property/:propertyId/:residentEmail', removeResident);

export default router;

import { Router } from 'express';
import { verifyToken } from '@middleware/auth';
import {
  getUserProperties,
  getProperties,
  getPropertyById,
  createProperty,
  updateProperty,
  deleteProperty,
  addResident
} from '../controllers/propertyController';

const router = Router();

// GET /api/admin/properties/user/current - Get properties for authenticated user
router.get('/user/current', verifyToken, getUserProperties);

// GET /api/admin/properties/:condominiumId - List properties for a condominium
router.get('/condominium/:condominiumId', getProperties);

// GET /api/admin/properties/:id - Get property by ID
router.get('/:id', getPropertyById);

// POST /api/admin/properties/:condominiumId - Create new property
router.post('/condominium/:condominiumId', createProperty);

// PUT /api/admin/properties/:id - Update property
router.put('/:id', updateProperty);

// DELETE /api/admin/properties/:id - Delete property (soft delete)
router.delete('/:id', deleteProperty);

// POST /api/admin/properties/:id/residents - Add resident to property
router.post('/:id/residents', addResident);

export default router;

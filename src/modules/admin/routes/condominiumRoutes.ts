import { Router } from 'express';
import {
  getCondominiums,
  getCondominiumById,
  createCondominium,
  updateCondominium,
  deleteCondominium,
  getUserCondominiumAndProperty,
  verifyAdmin
} from '../controllers/condominiumController';

const router = Router();

// Test endpoint
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Test endpoint works' });
});

// GET /api/admin/verify-admin - Verify if user is admin
router.get('/verify-admin', verifyAdmin);

// GET /api/admin/condominiums/user/current - Get current user's condominium and property
router.get('/user/current', getUserCondominiumAndProperty);

// GET /api/admin/condominiums - List all condominiums
router.get('/', getCondominiums);

// GET /api/admin/condominiums/:id - Get condominium by ID
router.get('/:id', getCondominiumById);

// POST /api/admin/condominiums - Create new condominium
router.post('/', createCondominium);

// PUT /api/admin/condominiums/:id - Update condominium
router.put('/:id', updateCondominium);

// DELETE /api/admin/condominiums/:id - Delete condominium (soft delete)
router.delete('/:id', deleteCondominium);

export default router;

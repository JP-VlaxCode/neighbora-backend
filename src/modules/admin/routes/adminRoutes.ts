import { Router } from 'express';
import { requireAdmin } from '@middleware/auth';
import {
  verifyAdminInDB,
  getAllAdmins,
  createAdmin,
  updateAdmin,
  deleteAdmin,
  getAdminById
} from '../controllers/adminController';

const router = Router();

// GET /api/admin/verify-admin-db - Verify if user is admin in MongoDB
router.get('/verify-admin-db', verifyAdminInDB);

// GET /api/admin/admins - List all admins (requires admin)
router.get('/', requireAdmin, getAllAdmins);

// GET /api/admin/admins/:id - Get admin by ID (requires admin)
router.get('/:id', requireAdmin, getAdminById);

// POST /api/admin/admins - Create new admin (requires admin)
router.post('/', requireAdmin, createAdmin);

// PUT /api/admin/admins/:id - Update admin (requires admin)
router.put('/:id', requireAdmin, updateAdmin);

// DELETE /api/admin/admins/:id - Delete admin (requires admin)
router.delete('/:id', requireAdmin, deleteAdmin);

export default router;

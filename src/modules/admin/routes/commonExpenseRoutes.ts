import { Router } from 'express';
import { verifyToken, requireAdmin } from '../../../middleware/auth';
import {
  getUserCommonExpenses,
  getPropertyCommonExpenses,
  getCondominiumCommonExpenses,
  getCommonExpenseById,
  createCommonExpense,
  updateCommonExpense,
  deleteCommonExpense,
  recordPayment,
  getCommonExpenseStats
} from '../controllers/commonExpenseController';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/admin/common-expenses/user/current - Get common expenses for authenticated user
router.get('/user/current', getUserCommonExpenses);

// GET /api/admin/common-expenses/property/:propertyId - Get common expenses for a specific property
router.get('/property/:propertyId', getPropertyCommonExpenses);

// GET /api/admin/common-expenses/:id - Get common expense by ID
router.get('/:id', getCommonExpenseById);

// Admin only routes
router.use(requireAdmin);

// GET /api/admin/common-expenses/condominium/:condominiumId - Get all common expenses for a condominium
router.get('/condominium/:condominiumId', getCondominiumCommonExpenses);

// GET /api/admin/common-expenses/condominium/:condominiumId/stats - Get statistics
router.get('/condominium/:condominiumId/stats', getCommonExpenseStats);

// POST /api/admin/common-expenses - Create common expense
router.post('/', createCommonExpense);

// PUT /api/admin/common-expenses/:id - Update common expense
router.put('/:id', updateCommonExpense);

// DELETE /api/admin/common-expenses/:id - Delete common expense
router.delete('/:id', deleteCommonExpense);

// POST /api/admin/common-expenses/:id/payment - Record payment
router.post('/:id/payment', recordPayment);

export default router;

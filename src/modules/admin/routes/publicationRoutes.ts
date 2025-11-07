import { Router } from 'express';
import { verifyToken, requireAdmin } from '@middleware/auth';
import {
  getCondominiumPublications,
  getPublicationById,
  createPublication,
  updatePublication,
  deletePublication,
  addReaction,
  addComment,
  getPublicationStats
} from '../controllers/publicationController';

const router = Router();

// All routes require authentication
router.use(verifyToken);

// GET /api/admin/publications - Get publications (with optional condominiumId query param)
router.get('/', getCondominiumPublications);

// GET /api/admin/publications/condominium/:condominiumId - Get all publications for a condominium
router.get('/condominium/:condominiumId', getCondominiumPublications);

// GET /api/admin/publications/:id - Get publication by ID
router.get('/:id', getPublicationById);

// Admin only routes
router.use(requireAdmin);

// GET /api/admin/publications/condominium/:condominiumId/stats - Get statistics
router.get('/condominium/:condominiumId/stats', getPublicationStats);

// POST /api/admin/publications - Create publication
router.post('/', createPublication);

// PUT /api/admin/publications/:id - Update publication
router.put('/:id', updatePublication);

// DELETE /api/admin/publications/:id - Delete publication
router.delete('/:id', deletePublication);

// POST /api/admin/publications/:id/reaction - Add reaction
router.post('/:id/reaction', addReaction);

// POST /api/admin/publications/:id/comment - Add comment
router.post('/:id/comment', addComment);

export default router;

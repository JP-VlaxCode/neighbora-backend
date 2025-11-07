import { Router } from 'express'
import verifyToken from '@/middleware/auth'

const router = Router()

// GET /users - list (placeholder)
router.get('/', async (_req, res) => {
  res.json({ message: 'List users - placeholder' })
})

// GET /users/me - return authenticated user's UID
router.get('/me', verifyToken, async (req, res) => {
  res.json({ uid: req.userId })
})

// GET /users/:id - get user (placeholder)
router.get('/:id', async (req, res) => {
  res.json({ message: `Get user ${req.params.id} - placeholder` })
})

// POST /users - create user (placeholder)
router.post('/', async (req, res) => {
  // TODO: validate and persist to DB
  res.status(201).json({ message: 'Create user - placeholder', body: req.body })
})

export default router

import { Request, Response, NextFunction } from 'express'
import admin from '@/config/firebaseAdmin'

declare global {
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

export async function verifyToken(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid Authorization header' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = await admin.auth().verifyIdToken(token)
    req.userId = decoded.uid
    return next()
  } catch (err: any) {
    return res.status(401).json({ error: 'Invalid or expired token', details: err?.message })
  }
}

export default verifyToken

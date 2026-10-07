import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ error: 'Non authentifié' })
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret_placeholder')
    req.user = decoded
    next()
  } catch {
    return res.status(401).json({ error: 'Token invalide' })
  }
}

export function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' })
    next()
  }
}

// Optional auth — doesn't fail if no token, but sets req.user if present
export function optionalAuth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev_jwt_secret_placeholder')
    } catch { /* ignore invalid token */ }
  }
  next()
}

// Audit log helper — call after a successful mutation
export async function logAction({ userId, userName, userRole, action, entity, entityId, entityTitle, details, statusBefore, statusAfter, articleId, prisma: p }) {
  const client = p || prisma
  try {
    await client.auditLog.create({
      data: { userId, userName, userRole, action, entity, entityId, entityTitle, details, statusBefore, statusAfter, articleId }
    })
  } catch (e) {
    console.error('Audit log error:', e.message)
  }
}

export { jwt, bcrypt, prisma }

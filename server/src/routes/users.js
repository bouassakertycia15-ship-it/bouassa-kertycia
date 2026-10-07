import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, roleMiddleware, logAction, jwt, bcrypt } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// ===== PUBLIC USER ROUTES =====

// Register
router.post('/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body
    if (!name || !email || !password) return res.status(400).json({ error: 'Tous les champs sont requis' })

    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing) return res.status(409).json({ error: 'Cet email est déjà utilisé' })

    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, role: 'READER', status: 'ACTIVE' },
    })

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'dev_jwt_secret_placeholder',
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Get current user profile
router.get('/auth/me', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, bio: user.bio, status: user.status, createdAt: user.createdAt })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Update profile
router.put('/auth/me', authMiddleware, async (req, res) => {
  try {
    const { name, avatar, bio } = req.body
    const user = await prisma.user.update({
      where: { id: req.user.id },
      data: { name, avatar, bio, lastActivity: new Date() },
    })
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar, bio: user.bio })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Get user's personal space data
router.get('/auth/my-space', authMiddleware, async (req, res) => {
  try {
    const [comments, testimonials, contributions, discussions, notifications] = await Promise.all([
      prisma.comment.findMany({ where: { userId: req.user.id }, include: { article: true }, orderBy: { createdAt: 'desc' } }),
      prisma.testimonial.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }),
      prisma.contribution.findMany({ where: { userId: req.user.id }, orderBy: { createdAt: 'desc' } }),
      prisma.forumDiscussion.findMany({ where: { userId: req.user.id }, include: { forumCategory: true }, orderBy: { createdAt: 'desc' } }),
      prisma.notification.findMany({ orderBy: { createdAt: 'desc' }, take: 10 }),
    ])
    res.json({ comments, testimonials, contributions, discussions, notifications })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== ADMIN USER MANAGEMENT =====

// List all users
router.get('/admin/users', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, name: true, role: true, status: true, avatar: true, createdAt: true, lastActivity: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(users)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Update user role/status
router.put('/admin/users/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { role, status } = req.body
    const data = {}
    if (role) data.role = role
    if (status) data.status = status
    const user = await prisma.user.update({ where: { id: req.params.id }, data })
    await logAction({ ...req.user, action: 'UPDATE_USER', entity: 'User', entityId: user.id, entityTitle: user.name, details: `Role: ${role || 'unchanged'}, Status: ${status || 'unchanged'}`, prisma })
    res.json({ id: user.id, email: user.email, name: user.name, role: user.role, status: user.status })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Delete user
router.delete('/admin/users/:id', authMiddleware, roleMiddleware('SUPER_ADMIN'), async (req, res) => {
  try {
    await prisma.user.delete({ where: { id: req.params.id } })
    await logAction({ ...req.user, action: 'DELETE_USER', entity: 'User', entityId: req.params.id, prisma })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router

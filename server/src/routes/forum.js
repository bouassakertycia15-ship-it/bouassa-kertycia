import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, optionalAuth, roleMiddleware, logAction } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

function slugify(text) {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-6)
}

// ===== PUBLIC FORUM ROUTES =====

// List categories with discussion counts
router.get('/forum/categories', async (req, res) => {
  try {
    const categories = await prisma.forumCategory.findMany({
      include: {
        _count: { select: { discussions: { where: { hidden: false } } } },
      },
      orderBy: { order: 'asc' },
    })
    res.json(categories)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// List discussions (with filters)
router.get('/forum/discussions', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 20 } = req.query
    const where = { hidden: false }
    if (category) where.forumCategory = { slug: category }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const [discussions, total] = await Promise.all([
      prisma.forumDiscussion.findMany({
        where,
        include: {
          forumCategory: true,
          _count: { select: { posts: { where: { hidden: false } } } },
        },
        orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.forumDiscussion.count({ where }),
    ])
    res.json({ data: discussions, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Get single discussion with posts
router.get('/forum/discussions/:slug', async (req, res) => {
  try {
    const discussion = await prisma.forumDiscussion.findUnique({
      where: { slug: req.params.slug },
      include: {
        forumCategory: true,
        posts: {
          where: { hidden: false },
          orderBy: { createdAt: 'asc' },
        },
      },
    })
    if (!discussion || discussion.hidden) return res.status(404).json({ error: 'Discussion non trouvée' })
    // Increment views
    await prisma.forumDiscussion.update({
      where: { id: discussion.id },
      data: { views: { increment: 1 } },
    })
    res.json(discussion)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Create discussion (auth required)
router.post('/forum/discussions', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user || user.status !== 'ACTIVE') return res.status(403).json({ error: 'Compte suspendu' })

    const { title, content, forumCategoryId } = req.body
    if (!title || !content || !forumCategoryId) return res.status(400).json({ error: 'Titre, contenu et catégorie requis' })

    const discussion = await prisma.forumDiscussion.create({
      data: {
        title,
        content,
        slug: slugify(title),
        forumCategoryId,
        userId: user.id,
        authorName: user.name,
      },
    })
    res.json(discussion)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Reply to discussion (auth required)
router.post('/forum/discussions/:slug/posts', authMiddleware, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id } })
    if (!user || user.status !== 'ACTIVE') return res.status(403).json({ error: 'Compte suspendu' })

    const discussion = await prisma.forumDiscussion.findUnique({ where: { slug: req.params.slug } })
    if (!discussion || discussion.locked) return res.status(403).json({ error: 'Discussion fermée ou inexistante' })

    const { content } = req.body
    if (!content) return res.status(400).json({ error: 'Contenu requis' })

    const post = await prisma.forumPost.create({
      data: {
        content,
        discussionId: discussion.id,
        userId: user.id,
        authorName: user.name,
      },
    })
    res.json(post)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Report a discussion or post
router.post('/forum/report', optionalAuth, async (req, res) => {
  try {
    const { reason, reporterName, discussionId, postId } = req.body
    if (!reason || !reporterName) return res.status(400).json({ error: 'Raison et nom requis' })

    const report = await prisma.report.create({
      data: { reason, reporterName, discussionId, postId, status: 'PENDING' },
    })
    res.json({ success: true, message: 'Signalement envoyé. Il sera traité par la modération.' })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== ADMIN FORUM ROUTES =====

// Admin: list all discussions (including hidden)
router.get('/admin/forum/discussions', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const discussions = await prisma.forumDiscussion.findMany({
      include: {
        forumCategory: true,
        _count: { select: { posts: true, reports: true } },
      },
      orderBy: { createdAt: 'desc' },
    })
    res.json(discussions)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Admin: toggle pinned/locked/hidden
router.put('/admin/forum/discussions/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const { pinned, locked, hidden } = req.body
    const discussion = await prisma.forumDiscussion.update({
      where: { id: req.params.id },
      data: { pinned, locked, hidden },
    })
    await logAction({ ...req.user, action: 'MODERATE_DISCUSSION', entity: 'ForumDiscussion', entityId: discussion.id, entityTitle: discussion.title, prisma })
    res.json(discussion)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Admin: delete discussion
router.delete('/admin/forum/discussions/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    await prisma.forumDiscussion.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Admin: hide/show post
router.put('/admin/forum/posts/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const post = await prisma.forumPost.update({
      where: { id: req.params.id },
      data: { hidden: req.body.hidden },
    })
    res.json(post)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Admin: delete post
router.delete('/admin/forum/posts/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    await prisma.forumPost.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Admin: CRUD categories
router.post('/admin/forum/categories', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const { name, description, icon, color, order, categoryId } = req.body
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const cat = await prisma.forumCategory.create({ data: { name, slug, description, icon, color, order: order || 0, categoryId } })
    res.json(cat)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/admin/forum/categories/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const data = { ...req.body }
    if (data.name) data.slug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const cat = await prisma.forumCategory.update({ where: { id: req.params.id }, data })
    res.json(cat)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/admin/forum/categories/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    await prisma.forumCategory.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Admin: list reports
router.get('/admin/forum/reports', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const reports = await prisma.report.findMany({
      include: { discussion: true, post: true },
      orderBy: { createdAt: 'desc' },
    })
    res.json(reports)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Admin: resolve report
router.put('/admin/forum/reports/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'MODERATOR'), async (req, res) => {
  try {
    const report = await prisma.report.update({
      where: { id: req.params.id },
      data: { status: req.body.status || 'APPROVED' },
    })
    res.json(report)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router

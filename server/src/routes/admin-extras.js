import express from 'express'
import { PrismaClient } from '@prisma/client'
import { authMiddleware, roleMiddleware, logAction } from '../middleware/auth.js'

const router = express.Router()
const prisma = new PrismaClient()

// ===== AUDIT LOG =====
router.get('/admin/audit-logs', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const { page = 1, limit = 50, entity, action } = req.query
    const where = {}
    if (entity) where.entity = entity
    if (action) where.action = action
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({ where, orderBy: { createdAt: 'desc' }, skip: (pageNum - 1) * limitNum, take: limitNum }),
      prisma.auditLog.count({ where }),
    ])
    res.json({ data: logs, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== ARTICLE VERSIONS =====
router.get('/admin/articles/:id/versions', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const versions = await prisma.articleVersion.findMany({
      where: { articleId: req.params.id },
      orderBy: { version: 'desc' },
    })
    res.json(versions)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/admin/articles/:id/versions/restore/:versionId', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const version = await prisma.articleVersion.findUnique({ where: { id: req.params.versionId } })
    if (!version || version.articleId !== req.params.id) return res.status(404).json({ error: 'Version non trouvée' })

    const article = await prisma.article.update({
      where: { id: req.params.id },
      data: { title: version.title, content: version.content, excerpt: version.excerpt, coverImage: version.coverImage },
    })
    await logAction({ ...req.user, action: 'RESTORE_VERSION', entity: 'Article', entityId: article.id, entityTitle: article.title, details: `Restored version ${version.version}`, prisma })
    res.json(article)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== TASKS =====
router.get('/admin/tasks', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MANAGER', 'MODERATOR', 'AUDIO_MANAGER', 'VIDEO_MANAGER', 'EVENT_MANAGER', 'COMM_MANAGER'), async (req, res) => {
  try {
    const { status } = req.query
    const where = {}
    if (status) where.status = status
    const tasks = await prisma.task.findMany({
      where,
      include: { assignee: { select: { id: true, name: true, role: true } }, article: { select: { id: true, title: true } } },
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    })
    res.json(tasks)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/admin/tasks', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MANAGER'), async (req, res) => {
  try {
    const { title, description, type, priority, dueDate, assigneeId, articleId, internalComment } = req.body
    const task = await prisma.task.create({
      data: { title, description, type, priority: priority || 'MEDIUM', dueDate: dueDate ? new Date(dueDate) : null, assigneeId, articleId, internalComment },
    })
    await logAction({ ...req.user, action: 'CREATE_TASK', entity: 'Task', entityId: task.id, entityTitle: title, prisma })
    res.json(task)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.put('/admin/tasks/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'MANAGER'), async (req, res) => {
  try {
    const task = await prisma.task.update({ where: { id: req.params.id }, data: req.body })
    res.json(task)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/admin/tasks/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== MEDIA LIBRARY =====
router.get('/admin/media', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'WRITER', 'AUDIO_MANAGER', 'VIDEO_MANAGER'), async (req, res) => {
  try {
    const { type } = req.query
    const where = {}
    if (type) where.type = type
    const media = await prisma.media.findMany({ where, orderBy: { createdAt: 'desc' } })
    res.json(media)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.post('/admin/media', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'EDITOR', 'WRITER', 'AUDIO_MANAGER', 'VIDEO_MANAGER'), async (req, res) => {
  try {
    const { name, type, url, size, associatedContent } = req.body
    const media = await prisma.media.create({ data: { name, type, url, size, uploadedBy: req.user.name, associatedContent } })
    res.json(media)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

router.delete('/admin/media/:id', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    await prisma.media.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== STATISTICS =====
router.get('/admin/stats', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const [
      articlesCount, publishedArticles, draftArticles, reviewArticles,
      podcastsCount, videosCount, eventsCount, membersCount, usersCount,
      pendingTestimonials, pendingComments, pendingContributions,
      forumDiscussionsCount, reportedContent, tasksCount, pendingTasks,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.article.count({ where: { status: 'IN_REVIEW' } }),
      prisma.podcast.count(),
      prisma.video.count(),
      prisma.event.count(),
      prisma.member.count(),
      prisma.user.count(),
      prisma.testimonial.count({ where: { status: 'PENDING' } }),
      prisma.comment.count({ where: { status: 'PENDING' } }),
      prisma.contribution.count({ where: { status: 'PENDING' } }),
      prisma.forumDiscussion.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.task.count(),
      prisma.task.count({ where: { status: { in: ['TODO', 'IN_PROGRESS'] } } }),
    ])

    // Top viewed content
    const [topArticles, topPodcasts, topVideos, topEvents] = await Promise.all([
      prisma.article.findMany({ orderBy: { viewCount: 'desc' }, take: 5, select: { id: true, title: true, viewCount: true } }),
      prisma.podcast.findMany({ orderBy: { viewCount: 'desc' }, take: 5, select: { id: true, title: true, viewCount: true } }),
      prisma.video.findMany({ orderBy: { viewCount: 'desc' }, take: 5, select: { id: true, title: true, viewCount: true } }),
      prisma.event.findMany({ orderBy: { viewCount: 'desc' }, take: 5, select: { id: true, title: true, viewCount: true } }),
    ])

    // Recent activity
    const recentLogs = await prisma.auditLog.findMany({ take: 10, orderBy: { createdAt: 'desc' } })

    // Recent discussions
    const recentDiscussions = await prisma.forumDiscussion.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { forumCategory: true, _count: { select: { posts: true } } },
    })

    res.json({
      counts: {
        articles: articlesCount, publishedArticles, draftArticles, reviewArticles,
        podcasts: podcastsCount, videos: videosCount, events: eventsCount,
        members: membersCount, users: usersCount,
        pendingTestimonials, pendingComments, pendingContributions,
        forumDiscussions: forumDiscussionsCount, reportedContent, tasks: tasksCount, pendingTasks,
      },
      topContent: { articles: topArticles, podcasts: topPodcasts, videos: topVideos, events: topEvents },
      recentActivity: recentLogs,
      recentDiscussions,
    })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// ===== TRANSPARENCY / PLATFORM STATUS =====
router.get('/admin/status', authMiddleware, roleMiddleware('SUPER_ADMIN', 'ADMIN'), async (req, res) => {
  try {
    const [published, drafts, archived, reported, syncInfo] = await Promise.all([
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: { in: ['DRAFT', 'IN_REVIEW', 'SCHEDULED'] } } }),
      prisma.article.count({ where: { status: 'ARCHIVED' } }),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.blogSource.findFirst(),
    ])
    res.json({ published, drafts, archived, reported, lastSync: syncInfo?.lastSync || null })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

export default router

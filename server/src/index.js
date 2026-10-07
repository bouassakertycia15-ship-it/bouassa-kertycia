import express from 'express'
import cors from 'cors'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const app = express()

app.use(cors())
app.use(express.json({ limit: '10mb' }))

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'echo-jociste-api' })
})

// ============ PUBLIC ROUTES ============

// Articles
app.get('/api/articles', async (req, res) => {
  try {
    const { page = 1, limit = 12, category, tag, source, search, featured, archive, year, month } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const where = { status: 'PUBLISHED' }

    if (category) where.category = { slug: category }
    if (tag) where.tags = { some: { slug: tag } }
    if (source) where.source = source
    if (featured === 'true') where.featured = true
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ]
    }
    if (year) {
      const y = parseInt(year)
      const start = new Date(y, 0, 1)
      const end = new Date(y + 1, 0, 1)
      where.publishedAt = { gte: start, lt: end }
      if (month) {
        const m = parseInt(month) - 1
        where.publishedAt = { gte: new Date(y, m, 1), lt: new Date(y, m + 1, 1) }
      }
    }
    if (archive === 'true') {
      where.status = 'ARCHIVED'
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where,
        include: { author: true, category: true, tags: true },
        orderBy: { publishedAt: 'desc' },
        skip: (pageNum - 1) * limitNum,
        take: limitNum,
      }),
      prisma.article.count({ where }),
    ])

    res.json({ data: articles, total, page: pageNum, totalPages: Math.ceil(total / limitNum) })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/articles/:slug', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({
      where: { slug: req.params.slug },
      include: {
        author: true,
        category: true,
        tags: true,
        comments: { where: { status: 'APPROVED' }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!article) return res.status(404).json({ error: 'Article non trouvé' })

    // Similar articles
    const similar = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { not: article.id },
        OR: [
          { categoryId: article.categoryId },
          { tags: { some: { id: { in: article.tags.map(t => t.id) } } },
          },
        ],
      },
      include: { author: true, category: true },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    })

    res.json({ ...article, similar })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Categories
app.get('/api/categories', async (req, res) => {
  try {
    const categories = await prisma.category.findMany({ orderBy: { name: 'asc' } })
    res.json(categories)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Tags
app.get('/api/tags', async (req, res) => {
  try {
    const tags = await prisma.tag.findMany({ orderBy: { name: 'asc' } })
    res.json(tags)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Podcasts
app.get('/api/podcasts', async (req, res) => {
  try {
    const { category, search } = req.query
    const where = {}
    if (category) where.category = { slug: category }
    if (search) where.title = { contains: search, mode: 'insensitive' }
    const podcasts = await prisma.podcast.findMany({
      where,
      include: { author: true, category: true },
      orderBy: { publishedAt: 'desc' },
    })
    res.json(podcasts)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/podcasts/:slug', async (req, res) => {
  try {
    const podcast = await prisma.podcast.findUnique({
      where: { slug: req.params.slug },
      include: { author: true, category: true },
    })
    if (!podcast) return res.status(404).json({ error: 'Podcast non trouvé' })
    res.json(podcast)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Videos
app.get('/api/videos', async (req, res) => {
  try {
    const { category, search } = req.query
    const where = {}
    if (category) where.category = { slug: category }
    if (search) where.title = { contains: search, mode: 'insensitive' }
    const videos = await prisma.video.findMany({
      where,
      include: { author: true, category: true },
      orderBy: { publishedAt: 'desc' },
    })
    res.json(videos)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Events
app.get('/api/events', async (req, res) => {
  try {
    const { status } = req.query
    const where = {}
    if (status) where.status = status
    const events = await prisma.event.findMany({
      where,
      orderBy: { eventDate: 'asc' },
    })
    res.json(events)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/events/:slug', async (req, res) => {
  try {
    const event = await prisma.event.findUnique({ where: { slug: req.params.slug } })
    if (!event) return res.status(404).json({ error: 'Événement non trouvé' })
    res.json(event)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Activities
app.get('/api/activities', async (req, res) => {
  try {
    const { type } = req.query
    const where = {}
    if (type) where.type = type
    const activities = await prisma.activity.findMany({
      where,
      orderBy: { activityDate: 'desc' },
    })
    res.json(activities)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/activities/:slug', async (req, res) => {
  try {
    const activity = await prisma.activity.findUnique({ where: { slug: req.params.slug } })
    if (!activity) return res.status(404).json({ error: 'Activité non trouvée' })
    res.json(activity)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Members
app.get('/api/members', async (req, res) => {
  try {
    const members = await prisma.member.findMany({ orderBy: { name: 'asc' } })
    res.json(members)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// JOC Family
app.get('/api/joc-family', async (req, res) => {
  try {
    const family = await prisma.jocFamily.findMany({ orderBy: { name: 'asc' } })
    res.json(family)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Testimonials (approved only for public)
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({
      where: { status: 'APPROVED' },
      orderBy: { createdAt: 'desc' },
    })
    res.json(testimonials)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Notifications
app.get('/api/notifications', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
    })
    res.json(notifications)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Social Links
app.get('/api/social-links', async (req, res) => {
  try {
    const links = await prisma.socialLink.findMany()
    res.json(links)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Pages
app.get('/api/pages/:slug', async (req, res) => {
  try {
    const page = await prisma.page.findUnique({ where: { slug: req.params.slug } })
    if (!page) return res.status(404).json({ error: 'Page non trouvée' })
    res.json(page)
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Global Search
app.get('/api/search', async (req, res) => {
  try {
    const { q } = req.query
    if (!q) return res.json({ articles: [], podcasts: [], videos: [], events: [], members: [], activities: [] })

    const [articles, podcasts, videos, events, members, activities] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'PUBLISHED', OR: [
          { title: { contains: q, mode: 'insensitive' } },
          { excerpt: { contains: q, mode: 'insensitive' } },
          { content: { contains: q, mode: 'insensitive' } },
        ] },
        include: { category: true, author: true },
        take: 10,
      }),
      prisma.podcast.findMany({
        where: { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }),
      prisma.video.findMany({
        where: { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }),
      prisma.event.findMany({
        where: { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }),
      prisma.member.findMany({
        where: { OR: [{ name: { contains: q, mode: 'insensitive' } }, { role: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }),
      prisma.activity.findMany({
        where: { OR: [{ title: { contains: q, mode: 'insensitive' } }, { description: { contains: q, mode: 'insensitive' } }] },
        take: 5,
      }),
    ])

    res.json({ articles, podcasts, videos, events, members, activities, total: articles.length + podcasts.length + videos.length + events.length + members.length + activities.length })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body
    if (!name || !message) return res.status(400).json({ error: 'Nom et message requis' })
    const contribution = await prisma.contribution.create({
      data: {
        type: 'CONTACT',
        title: subject || 'Message de contact',
        content: message,
        authorName: name,
        authorEmail: email,
        status: 'PENDING',
      },
    })
    res.json({ success: true, message: 'Message envoyé avec succès' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Public contributions (espace d'échange)
app.post('/api/contributions', async (req, res) => {
  try {
    const { type, title, content, authorName, authorEmail } = req.body
    if (!type || !title || !content || !authorName) return res.status(400).json({ error: 'Champs requis manquants' })
    const contribution = await prisma.contribution.create({
      data: { type, title, content, authorName, authorEmail, status: 'PENDING' },
    })
    res.json({ success: true, message: 'Contribution envoyée. Elle sera publiée après modération.' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Public comments (pending moderation)
app.post('/api/articles/:slug/comments', async (req, res) => {
  try {
    const article = await prisma.article.findUnique({ where: { slug: req.params.slug } })
    if (!article) return res.status(404).json({ error: 'Article non trouvé' })
    const { userName, content } = req.body
    if (!userName || !content) return res.status(400).json({ error: 'Nom et contenu requis' })
    const comment = await prisma.comment.create({
      data: { userName, content, articleId: article.id, status: 'PENDING' },
    })
    res.json({ success: true, message: 'Commentaire envoyé. Il sera visible après modération.' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Public testimonial submission
app.post('/api/testimonials', async (req, res) => {
  try {
    const { title, content, author } = req.body
    if (!title || !content || !author) return res.status(400).json({ error: 'Champs requis manquants' })
    const testimonial = await prisma.testimonial.create({
      data: { title, content, author, status: 'PENDING' },
    })
    res.json({ success: true, message: 'Témoignage envoyé. Il sera publié après modération.' })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// ============ AUTH ============

import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'

function authMiddleware(req, res, next) {
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

function roleMiddleware(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) return res.status(403).json({ error: 'Accès refusé' })
    next()
  }
}

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ error: 'Identifiants incorrects' })
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Identifiants incorrects' })
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, name: user.name },
      process.env.JWT_SECRET || 'dev_jwt_secret_placeholder',
      { expiresIn: '7d' }
    )
    res.json({ token, user: { id: user.id, email: user.email, name: user.name, role: user.role } })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.id } })
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' })
  res.json({ id: user.id, email: user.email, name: user.name, role: user.role, avatar: user.avatar })
})

// ============ ADMIN ROUTES ============

// Blog import (from RSS feed)
app.post('/api/admin/blog/sync', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const Parser = (await import('rss-parser')).default
    const parser = new Parser()
    const feedUrl = process.env.BLOG_FEED_URL || 'https://magazinechretienne1echojociste.blogspot.com/feeds/posts/default'
    const feed = await parser.parseURL(feedUrl)

    let imported = 0
    let updated = 0
    let skipped = 0

    for (const item of feed.items) {
      const blogPostId = item.id || item.guid || item.link
      const existing = await prisma.article.findFirst({
        where: { OR: [{ blogPostId }, { originalUrl: item.link }] },
      })

      // Extract first image from content
      const imgMatch = item.content?.match(/<img[^>]+src="([^">]+)"/)
      const coverImage = imgMatch ? imgMatch[1] : null

      // Clean HTML to text-ish (keep basic structure)
      const content = item.content || item.contentSnippet || ''
      const excerpt = item.contentSnippet?.substring(0, 200) || ''

      const slug = item.title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '') + '-' + (blogPostId || '').slice(-8)

      if (existing) {
        // Update if modified
        const pubDate = new Date(item.isoDate || item.pubDate)
        if (existing.dateModification && pubDate <= existing.dateModification) {
          skipped++
          continue
        }
        await prisma.article.update({
          where: { id: existing.id },
          data: {
            title: item.title,
            content,
            excerpt,
            coverImage,
            dateModification: pubDate,
            synchronized: true,
          },
        })
        updated++
      } else {
        await prisma.article.create({
          data: {
            title: item.title,
            slug,
            excerpt,
            content,
            coverImage,
            source: 'BLOG',
            originalUrl: item.link,
            blogPostId,
            dateImport: new Date(),
            dateModification: new Date(item.isoDate || item.pubDate),
            synchronized: true,
            publishedAt: new Date(item.isoDate || item.pubDate),
            status: 'PUBLISHED',
          },
        })
        imported++
      }
    }

    res.json({ success: true, imported, updated, skipped, total: feed.items.length })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Import single article from URL
app.post('/api/admin/blog/import-url', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { url } = req.body
    if (!url) return res.status(400).json({ error: 'URL requise' })

    const response = await fetch(url)
    const html = await response.text()

    // Extract title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/)
    const title = titleMatch ? titleMatch[1].trim() : 'Article importé'

    // Extract meta description
    const descMatch = html.match(/<meta[^>]+name="description"[^>]+content="([^"]+)"/)
    const excerpt = descMatch ? descMatch[1] : ''

    // Extract og:image
    const ogImageMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/)
    const coverImage = ogImageMatch ? ogImageMatch[1] : null

    // Extract article content (Blogger post body)
    const bodyMatch = html.match(/<div[^>]+class="post-body[^"]*"[^>]*>([\s\S]*?)<\/div>/)
    const content = bodyMatch ? bodyMatch[1] : html

    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-6)

    const existing = await prisma.article.findFirst({ where: { originalUrl: url } })
    if (existing) {
      return res.json({ success: true, message: 'Article déjà importé', article: existing })
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        excerpt,
        content,
        coverImage,
        source: 'BLOG',
        originalUrl: url,
        dateImport: new Date(),
        synchronized: false,
        status: 'PUBLISHED',
      },
    })
    res.json({ success: true, article })
  } catch (e) {
    res.status(500).json({ error: e.message })
  }
})

// Articles CRUD
app.post('/api/admin/articles', authMiddleware, roleMiddleware('ADMIN', 'EDITOR', 'WRITER'), async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, categoryId, tags, status, featured, authorId } = req.body
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-6)
    const tagRecords = tags?.length ? await Promise.all(tags.map(t => prisma.tag.upsert({ where: { slug: t.toLowerCase().replace(/\s+/g, '-') }, update: { name: t }, create: { name: t, slug: t.toLowerCase().replace(/\s+/g, '-') } }))) : []
    const article = await prisma.article.create({
      data: { title, slug, excerpt, content, coverImage, categoryId, status: status || 'DRAFT', featured: featured || false, authorId, tags: { connect: tagRecords.map(t => ({ id: t.id })) }, source: 'APPLICATION' },
    })
    res.json(article)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/articles/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR', 'WRITER'), async (req, res) => {
  try {
    const { title, excerpt, content, coverImage, categoryId, tags, status, featured, authorId } = req.body
    const data = { title, excerpt, content, coverImage, categoryId, status, featured, authorId }
    if (tags) {
      const tagRecords = await Promise.all(tags.map(t => prisma.tag.upsert({ where: { slug: t.toLowerCase().replace(/\s+/g, '-') }, update: { name: t }, create: { name: t, slug: t.toLowerCase().replace(/\s+/g, '-') } })))
      data.tags = { set: tagRecords.map(t => ({ id: t.id })) }
    }
    const article = await prisma.article.update({ where: { id: req.params.id }, data })
    res.json(article)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/articles/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    await prisma.article.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Podcasts CRUD
app.post('/api/admin/podcasts', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { title, description, coverImage, audioUrl, duration, speaker, categoryId, authorId } = req.body
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-6)
    const podcast = await prisma.podcast.create({ data: { title, slug, description, coverImage, audioUrl, duration, speaker, categoryId, authorId } })
    res.json(podcast)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/podcasts/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const podcast = await prisma.podcast.update({ where: { id: req.params.id }, data: req.body })
    res.json(podcast)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/podcasts/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    await prisma.podcast.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Videos CRUD
app.post('/api/admin/videos', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { title, description, thumbnail, videoUrl, speaker, categoryId, authorId } = req.body
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-6)
    const video = await prisma.video.create({ data: { title, slug, description, thumbnail, videoUrl, speaker, categoryId, authorId } })
    res.json(video)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/videos/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const video = await prisma.video.update({ where: { id: req.params.id }, data: req.body })
    res.json(video)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/videos/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    await prisma.video.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Events CRUD
app.post('/api/admin/events', authMiddleware, roleMiddleware('ADMIN', 'EDITOR', 'MANAGER'), async (req, res) => {
  try {
    const { title, description, poster, eventDate, eventTime, location, organizer, contact, status, gallery, report } = req.body
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-6)
    const event = await prisma.event.create({ data: { title, slug, description, poster, eventDate: new Date(eventDate), eventTime, location, organizer, contact, status: status || 'UPCOMING', gallery: gallery || [], report } })
    res.json(event)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/events/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR', 'MANAGER'), async (req, res) => {
  try {
    const data = { ...req.body }
    if (data.eventDate) data.eventDate = new Date(data.eventDate)
    const event = await prisma.event.update({ where: { id: req.params.id }, data })
    res.json(event)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/events/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    await prisma.event.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Activities CRUD
app.post('/api/admin/activities', authMiddleware, roleMiddleware('ADMIN', 'EDITOR', 'MANAGER'), async (req, res) => {
  try {
    const { title, description, activityDate, location, photos, videos, participants, responsible, report, type } = req.body
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString().slice(-6)
    const activity = await prisma.activity.create({ data: { title, slug, description, activityDate: new Date(activityDate), location, photos: photos || [], videos: videos || [], participants, responsible, report, type } })
    res.json(activity)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/activities/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR', 'MANAGER'), async (req, res) => {
  try {
    const data = { ...req.body }
    if (data.activityDate) data.activityDate = new Date(data.activityDate)
    const activity = await prisma.activity.update({ where: { id: req.params.id }, data })
    res.json(activity)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/activities/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    await prisma.activity.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Members CRUD
app.post('/api/admin/members', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const member = await prisma.member.create({ data: req.body })
    res.json(member)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/members/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const member = await prisma.member.update({ where: { id: req.params.id }, data: req.body })
    res.json(member)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/members/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.member.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// JOC Family CRUD
app.post('/api/admin/joc-family', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const member = await prisma.jocFamily.create({ data: req.body })
    res.json(member)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/joc-family/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const member = await prisma.jocFamily.update({ where: { id: req.params.id }, data: req.body })
    res.json(member)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/joc-family/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.jocFamily.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Categories CRUD
app.post('/api/admin/categories', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const { name, color } = req.body
    const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const category = await prisma.category.create({ data: { name, slug, color } })
    res.json(category)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/categories/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const data = { ...req.body }
    if (data.name) data.slug = data.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const category = await prisma.category.update({ where: { id: req.params.id }, data })
    res.json(category)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/categories/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.category.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Social Links CRUD
app.post('/api/admin/social-links', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const link = await prisma.socialLink.create({ data: req.body })
    res.json(link)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/social-links/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const link = await prisma.socialLink.update({ where: { id: req.params.id }, data: req.body })
    res.json(link)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/social-links/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.socialLink.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Notifications CRUD
app.post('/api/admin/notifications', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const notif = await prisma.notification.create({ data: req.body })
    res.json(notif)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Moderation: testimonials
app.put('/api/admin/testimonials/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const testimonial = await prisma.testimonial.update({ where: { id: req.params.id }, data: { status: req.body.status } })
    res.json(testimonial)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Moderation: comments
app.put('/api/admin/comments/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const comment = await prisma.comment.update({ where: { id: req.params.id }, data: { status: req.body.status } })
    res.json(comment)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Moderation: contributions
app.get('/api/admin/contributions', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const contributions = await prisma.contribution.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(contributions)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/contributions/:id', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const data = { status: req.body.status }
    if (req.body.adminReply) data.adminReply = req.body.adminReply
    const contribution = await prisma.contribution.update({ where: { id: req.params.id }, data })
    res.json(contribution)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Pending comments list
app.get('/api/admin/comments', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({ include: { article: true }, orderBy: { createdAt: 'desc' } })
    res.json(comments)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Pending testimonials list
app.get('/api/admin/testimonials', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const testimonials = await prisma.testimonial.findMany({ orderBy: { createdAt: 'desc' } })
    res.json(testimonials)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Pages CRUD
app.post('/api/admin/pages', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const { title, content } = req.body
    const slug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const page = await prisma.page.create({ data: { title, slug, content } })
    res.json(page)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.put('/api/admin/pages/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    const data = { ...req.body }
    if (data.title) data.slug = data.title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    const page = await prisma.page.update({ where: { id: req.params.id }, data })
    res.json(page)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

app.delete('/api/admin/pages/:id', authMiddleware, roleMiddleware('ADMIN'), async (req, res) => {
  try {
    await prisma.page.delete({ where: { id: req.params.id } })
    res.json({ success: true })
  } catch (e) { res.status(500).json({ error: e.message }) }
})

// Blog sources
app.get('/api/admin/blog-sources', authMiddleware, roleMiddleware('ADMIN', 'EDITOR'), async (req, res) => {
  try {
    const sources = await prisma.blogSource.findMany()
    res.json(sources)
  } catch (e) { res.status(500).json({ error: e.message }) }
})

const PORT = process.env.PORT || 8000
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Écho Jociste API running on port ${PORT}`)
})

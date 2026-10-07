import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding Écho Jociste...')

  // Admin user
  const adminPass = await bcrypt.hash('echojociste2024', 10)
  const admin = await prisma.user.upsert({
    where: { email: 'admin@echojociste.cg' },
    update: {},
    create: {
      email: 'admin@echojociste.cg',
      password: adminPass,
      name: 'Administrateur Écho Jociste',
      role: 'ADMIN',
    },
  })
  console.log('Admin user created:', admin.email)

  // Categories
  const categories = [
    { name: 'Foi', color: '#dc2626' },
    { name: 'Jeunesse', color: '#f59e0b' },
    { name: 'JOC', color: '#dc2626' },
    { name: 'Engagement', color: '#0891b2' },
    { name: 'Société', color: '#6366f1' },
    { name: 'Action sociale', color: '#16a34a' },
    { name: 'Environnement', color: '#15803d' },
    { name: 'Leadership', color: '#7c3aed' },
    { name: 'Vie chrétienne', color: '#dc2626' },
    { name: 'Témoignages', color: '#ea580c' },
    { name: 'Réflexions', color: '#0d9488' },
    { name: 'Actualités', color: '#3b82f6' },
  ]

  for (const cat of categories) {
    const slug = cat.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
    await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name: cat.name, slug, color: cat.color },
    })
  }
  console.log('Categories created')

  // Author
  let author = await prisma.author.findFirst({ where: { name: 'Rédaction Écho Jociste' } })
  if (!author) {
    author = await prisma.author.create({ data: { name: 'Rédaction Écho Jociste', bio: 'L\'équipe rédactionnelle du magazine Écho Jociste.' } })
  }

  // Articles
  const foiCat = await prisma.category.findUnique({ where: { slug: 'foi' } })
  const jocCat = await prisma.category.findUnique({ where: { slug: 'joc' } })
  const jeunesseCat = await prisma.category.findUnique({ where: { slug: 'jeunesse' } })
  const engagementCat = await prisma.category.findUnique({ where: { slug: 'engagement' } })
  const vieCat = await prisma.category.findUnique({ where: { slug: 'vie-chretienne' } })
  const actuCat = await prisma.category.findUnique({ where: { slug: 'actualites' } })
  const temoignageCat = await prisma.category.findUnique({ where: { slug: 'temoignages' } })

  const articles = [
    {
      title: 'Joseph Cardijn et la méthode Voir – Juger – Agir',
      slug: 'joseph-cardijn-methode-voir-juger-agir',
      excerpt: 'Découvrez l\'héritage de Joseph Cardijn, fondateur de la JOC, et la méthode qui guide l\'action des jeunes chrétiens : Voir, Juger, Agir.',
      content: `<p>Joseph Cardijn, né en 1882 en Belgique, est le fondateur de la Jeunesse Ouvrière Chrétienne (JOC). Prêtre puis cardinal, il a consacré sa vie à l'éducation et à l'accompagnement des jeunes travailleurs.</p>
<h2>La méthode Voir – Juger – Agir</h2>
<p>La méthode pédagogique de la JOC repose sur trois étapes fondamentales :</p>
<ul>
<li><strong>VOIR</strong> : Regarder la réalité de sa vie, de son milieu, de sa société avec attention et lucidité.</li>
<li><strong>JUGER</strong> : Éclairer cette réalité à la lumière de l'Évangile et de la foi chrétienne.</li>
<li><strong>AGIR</strong> : Poser des actes concrets pour transformer cette réalité.</li>
</ul>
<p>Cette méthode, simple mais profonde, permet à chaque jeune de devenir acteur de sa propre vie et de la société. Elle n'est pas une théorie abstraite mais une démarche concrète qui part de l'expérience vécue.</p>
<h2>Un héritage vivant</h2>
<p>Aujourd'hui encore, la méthode Voir – Juger – Agir guide l'action des Jocistes à travers le monde. Elle reste un outil puissant pour la formation des jeunes à la responsabilité et à l'engagement.</p>
<p>« Jeune chrétien, sois créatif ! »</p>`,
      coverImage: 'https://images.unsplash.com/photo-1528180040064-0cdd9c1c0b6f?w=800',
      categoryId: foiCat.id,
      authorId: author.id,
      featured: true,
      publishedAt: new Date('2024-12-15'),
    },
    {
      title: 'Pourquoi devenir Jociste ?',
      slug: 'pourquoi-devenir-jociste',
      excerpt: 'La JOC n\'est pas un simple mouvement. C\'est une école de vie, de foi et d\'engagement pour les jeunes. Voici pourquoi y adhérer.',
      content: `<p>Devenir Jociste, c'est faire le choix de vivre sa foi en actes. La JOC (Jeunesse Ouvrière Chrétienne) est un mouvement qui accompagne les jeunes dans leur quotidien, les aide à grandir humainement et spirituellement, et les invite à transformer leur milieu de vie.</p>
<h2>Un espace pour les jeunes</h2>
<p>La JOC est un espace où les jeunes peuvent :</p>
<ul>
<li>Partager leurs expériences de vie</li>
<li>Réfléchir ensemble à la lumière de l'Évangile</li>
<li>Agir concrètement pour améliorer leur situation et celle des autres</li>
<li>Grandir dans la foi et la responsabilité</li>
<li>Vivre la fraternité et la solidarité</li>
</ul>
<h2>La foi en action</h2>
<p>La JOC place Jésus-Christ au centre de tout. Elle aide les jeunes à découvrir que la foi n'est pas seulement une croyance intérieure, mais une force qui transforme le monde. Être Jociste, c'est croire que chaque jeune a une dignité et une mission.</p>
<p>Rejoindre la JOC, c'est répondre à l'appel : « Jeune chrétien, sois créatif ! »</p>`,
      coverImage: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
      categoryId: jocCat.id,
      authorId: author.id,
      featured: true,
      publishedAt: new Date('2024-12-20'),
    },
    {
      title: 'La JOC Congo-Brazzaville : notre histoire',
      slug: 'joc-congo-brazzaville-histoire',
      excerpt: 'De ses débuts à aujourd\'hui, découvrez le parcours de la JOC au Congo-Brazzaville et son engagement auprès des jeunes.',
      content: `<p>La JOC Congo-Brazzaville est une branche dynamique du mouvement international de la Jeunesse Ouvrière Chrétienne. Présente dans le pays depuis plusieurs décennies, elle accompagne les jeunes Congolais dans leur cheminement de foi et d'engagement.</p>
<h2>Une mission claire</h2>
<p>La JOC Congo-Brazzaville a pour mission de :</p>
<ul>
<li>Éduquer les jeunes à la responsabilité</li>
<li>Former des leaders chrétiens engagés</li>
<li>Promouvoir la dignité du travail et du travailleur</li>
<li>Encourager la solidarité et la fraternité</li>
<li>Donner la parole aux jeunes</li>
</ul>
<h2>Présente dans la vie</h2>
<p>À travers les paroisses, les écoles, les quartiers et les lieux de travail, la JOC est présente là où vivent les jeunes. Elle organise des rencontres, des camps, des formations, des marches et des actions sociales.</p>
<p>Saint Joseph, patron des travailleurs, guide les Jocistes dans leur engagement quotidien.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1531219432768-7f640b1a2c4d?w=800',
      categoryId: jocCat.id,
      authorId: author.id,
      publishedAt: new Date('2024-11-10'),
    },
    {
      title: 'Camp JOC 2024 : vivre la fraternité',
      slug: 'camp-joc-2024-vivre-fraternite',
      excerpt: 'Retour sur le camp JOC 2024 qui a rassemblé des dizaines de jeunes autour de la foi, de la fraternité et de l\'engagement.',
      content: `<p>Le camp JOC 2024 a été un moment fort de rencontre, de partage et de formation pour les jeunes Jocistes du Congo-Brazzaville. Pendant plusieurs jours, les participants ont vécu ensemble, prié ensemble, et réfléchi à leur rôle dans la société.</p>
<h2>Des moments de vie</h2>
<p>Le camp a été marqué par :</p>
<ul>
<li>Des temps de prière et de célébration</li>
<li>Des ateliers de formation sur la méthode Voir – Juger – Agir</li>
<li>Des activités sportives et culturelles</li>
<li>Des témoignages de jeunes</li>
<li>Des moments de fraternité et de convivialité</li>
</ul>
<h2>Un impact durable</h2>
<p>Les jeunes repartis du camp sont devenus des ambassadeurs de la JOC dans leurs milieux respectifs. Ils portent désormais le message de la fraternité et de l'engagement chrétien dans leur quotidien.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800',
      categoryId: jeunesseCat.id,
      authorId: author.id,
      publishedAt: new Date('2024-10-01'),
    },
    {
      title: 'Témoignage : ma vie de Jociste',
      slug: 'temoignage-ma-vie-de-jociste',
      excerpt: 'Un jeune Jociste partage son expérience : comment la JOC a transformé sa vision de la vie et de la foi.',
      content: `<p>« Avant la JOC, je ne savais pas que ma vie avait un sens. Je vivais au jour le jour sans vraiment réfléchir. C'est en rejoignant un groupe JOC que j'ai découvert que je pouvais être acteur de ma propre vie. »</p>
<h2>Une découverte</h2>
<p>Ce témoignage est celui de nombreux jeunes qui, à travers la JOC, ont découvert la méthode Voir – Juger – Agir et l'ont appliquée à leur quotidien.</p>
<p>« La JOC m'a appris à regarder ma réalité avec les yeux de la foi. J'ai compris que chaque situation, même difficile, est un lieu où Dieu est présent et où je peux agir. »</p>
<h2>Un engagement</h2>
<p>« Aujourd'hui, je m'engage dans mon quartier, je partage avec d'autres jeunes, et je porte la parole de la JOC. Je suis fier d'être Jociste. »</p>
<p>#soisjociste #soisresponsable #échojociste</p>`,
      coverImage: 'https://images.unsplash.com/photo-1488161628813-04466f872be2?w=800',
      categoryId: temoignageCat?.id,
      authorId: author.id,
      publishedAt: new Date('2024-09-15'),
    },
    {
      title: 'L\'engagement social des jeunes Jocistes',
      slug: 'engagement-social-jeunes-jocistes',
      excerpt: 'Nettoyage de quartiers, aide aux démunis, sensibilisation environnementale : les Jocistes agissent concrètement.',
      content: `<p>L'action sociale est au cœur de l'engagement Jociste. À travers le Congo-Brazzaville, les jeunes Jocistes mènent des actions concrètes pour transformer leur milieu de vie.</p>
<h2>Des actions variées</h2>
<ul>
<li>Nettoyage et assainissement de quartiers</li>
<li>Visite et soutien aux personnes âgées</li>
<li>Sensibilisation à la protection de l'environnement</li>
<li>Aide aux enfants en difficulté</li>
<li>Campagnes de santé publique</li>
</ul>
<h2>La méthode en action</h2>
<p>Chaque action sociale commence par l'étape du VOIR : les jeunes observent une situation qui appelle une réponse. Puis ils JUGENT cette situation à la lumière de l'Évangile. Enfin, ils AGissent concrètement.</p>
<p>C'est ainsi que la JOC forme des jeunes responsables, créatifs et engagés.</p>`,
      coverImage: 'https://images.unsplash.com/photo-1469571486292-0ba58a3f063b?w=800',
      categoryId: engagementCat.id,
      authorId: author.id,
      publishedAt: new Date('2024-08-20'),
    },
  ]

  for (const art of articles) {
    await prisma.article.upsert({
      where: { slug: art.slug },
      update: {},
      create: { ...art, status: 'PUBLISHED', source: 'APPLICATION' },
    })
  }
  console.log('Articles created')

  // Podcasts
  const podcasts = [
    {
      title: 'Découvrir la méthode Voir – Juger – Agir',
      slug: 'podcast-decouvrir-voir-juger-agir',
      description: 'Un épisode pour comprendre la pédagogie de la JOC et comment l\'appliquer dans sa vie quotidienne.',
      coverImage: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=800',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
      duration: '24 min',
      speaker: 'Abbé Daniel Makaya',
      categoryId: foiCat.id,
      authorId: author.id,
    },
    {
      title: 'Témoignage : ma rencontre avec la JOC',
      slug: 'podcast-temoignage-rencontre-joc',
      description: 'Un jeune partage son parcours et comment la JOC a changé sa vie.',
      coverImage: 'https://images.unsplash.com/photo-1487180144351-b8472da7d8d1?w=800',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
      duration: '18 min',
      speaker: 'Christian Mboundza',
      categoryId: temoignageCat?.id,
      authorId: author.id,
    },
    {
      title: 'La responsabilité du jeune chrétien',
      slug: 'podcast-responsabilite-jeune-chretien',
      description: 'Réflexion sur l\'engagement et la responsabilité du jeune chrétien dans la société d\'aujourd\'hui.',
      coverImage: 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=800',
      audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
      duration: '32 min',
      speaker: 'Sœur Marie-Thérèse Nguesso',
      categoryId: vieCat?.id,
      authorId: author.id,
    },
  ]

  for (const pod of podcasts) {
    await prisma.podcast.upsert({
      where: { slug: pod.slug },
      update: {},
      create: { ...pod, publishedAt: new Date() },
    })
  }
  console.log('Podcasts created')

  // Videos
  const videos = [
    {
      title: 'Marche JOC 2024 – Brazzaville',
      slug: 'video-marche-joc-2024-brazzaville',
      description: 'La grande marche de la JOC à Brazzaville : des centaines de jeunes ont parcouru les rues de la capitale en témoignage de leur foi.',
      thumbnail: 'https://images.unsplash.com/photo-1532619675605-2ede45ad09d9?w=800',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      speaker: 'JOC Congo-Brazzaville',
      categoryId: jocCat.id,
      authorId: author.id,
    },
    {
      title: 'Conférence : Joseph Cardijn et la jeunesse',
      slug: 'video-conference-joseph-cardijn-jeunesse',
      description: 'Une conférence sur l\'héritage de Joseph Cardijn et son impact sur la jeunesse chrétienne d\'aujourd\'hui.',
      thumbnail: 'https://images.unsplash.com/photo-1551817958-c5b51e7b4a33?w=800',
      videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      speaker: 'Prof. Joseph Mboussi',
      categoryId: foiCat.id,
      authorId: author.id,
    },
  ]

  for (const vid of videos) {
    await prisma.video.upsert({
      where: { slug: vid.slug },
      update: {},
      create: { ...vid, publishedAt: new Date() },
    })
  }
  console.log('Videos created')

  // Events
  const events = [
    {
      title: 'Retraite spirituelle JOC 2025',
      slug: 'retraite-spirituelle-joc-2025',
      description: 'Un week-end de prière, de formation et de fraternité pour tous les jeunes Jocistes.',
      poster: 'https://images.unsplash.com/photo-1438032005730-c779502df39b?w=800',
      eventDate: new Date('2025-02-15'),
      eventTime: '08:00',
      location: 'Centre pastoral Saint Joseph, Brazzaville',
      organizer: 'JOC Congo-Brazzaville',
      contact: 'contact@joc-congo.cg',
      status: 'UPCOMING',
    },
    {
      title: 'Conférence : Le leadership chrétien',
      slug: 'conference-leadership-chretien',
      description: 'Une conférence sur le leadership inspiré de la foi, animée par d\'anciens Jocistes devenus leaders dans leurs domaines.',
      poster: 'https://images.unsplash.com/photo-1559223607-a43c990c529b?w=800',
      eventDate: new Date('2025-03-10'),
      eventTime: '14:00',
      location: 'Salle des fêtes, Paroisse Saint Pierre, Brazzaville',
      organizer: 'Écho Jociste',
      contact: 'contact@echojociste.cg',
      status: 'UPCOMING',
    },
    {
      title: 'Camp JOC 2024',
      slug: 'camp-joc-2024',
      description: 'Le camp annuel de la JOC : formation, prière, activités et fraternité.',
      poster: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=800',
      eventDate: new Date('2024-08-01'),
      eventTime: '07:00',
      location: 'Camp de Kintélé, Brazzaville',
      organizer: 'JOC Congo-Brazzaville',
      contact: 'contact@joc-congo.cg',
      status: 'COMPLETED',
    },
  ]

  for (const evt of events) {
    await prisma.event.upsert({
      where: { slug: evt.slug },
      update: {},
      create: { ...evt, gallery: [] },
    })
  }
  console.log('Events created')

  // Activities
  const activities = [
    {
      title: 'Réunion d\'équipe – Brazzaville Nord',
      slug: 'reunion-equipe-brazzaville-nord',
      description: 'Réunion mensuelle de l\'équipe JOC du secteur Nord de Brazzaville. Au programme : partage de vie, formation et préparation des prochaines actions.',
      activityDate: new Date('2025-01-10'),
      location: 'Paroisse Saint Joseph, Brazzaville',
      responsible: 'Christian Mboundza',
      type: 'Réunions',
    },
    {
      title: 'Action sociale : nettoyage du marché Total',
      slug: 'action-sociale-nettoyage-marche-total',
      description: 'Les jeunes Jocistes se sont mobilisés pour nettoyer le marché Total de Brazzaville, dans le cadre de leur engagement pour un environnement sain.',
      activityDate: new Date('2024-11-20'),
      location: 'Marché Total, Brazzaville',
      responsible: 'Marie Mpassi',
      type: 'Actions communautaires',
    },
    {
      title: 'Marche de la fraternité 2024',
      slug: 'marche-fraternite-2024',
      description: 'Une marche silencieuse à travers Brazzaville pour promouvoir la paix et la fraternité entre les jeunes.',
      activityDate: new Date('2024-09-21'),
      location: 'Centre-ville, Brazzaville',
      responsible: 'Équipe nationale JOC',
      type: 'Marches',
    },
  ]

  for (const act of activities) {
    await prisma.activity.upsert({
      where: { slug: act.slug },
      update: {},
      create: { ...act, photos: [], videos: [] },
    })
  }
  console.log('Activities created')

  // Members
  const members = [
    { name: 'Abbé Daniel Makaya', role: 'Aumônier national', bio: 'Prêtre et aumônier national de la JOC Congo-Brazzaville. Accompagne les jeunes dans leur cheminement de foi depuis plus de 10 ans.', domain: 'Accompagnement spirituel', team: 'Direction nationale', contact: 'd.makaya@joc-congo.cg' },
    { name: 'Christian Mboundza', role: 'Président national', bio: 'Ancien Jociste devenu président national de la JOC Congo-Brazzaville. Engagé pour la jeunesse et la justice sociale.', domain: 'Coordination', team: 'Direction nationale', socialLink: 'facebook.com/christian.mboundza' },
    { name: 'Marie Mpassi', role: 'Responsable action sociale', bio: 'Coordonne les actions sociales de la JOC à Brazzaville. Passionnée par l\'engagement communautaire.', domain: 'Action sociale', team: 'Commission action sociale' },
    { name: 'Joseph Nkounkou', role: 'Rédacteur en chef – Écho Jociste', bio: 'Journaliste et rédacteur en chef du magazine Écho Jociste. Veille à la qualité éditoriale des contenus.', domain: 'Communication', team: 'Rédaction', contact: 'j.nkounkou@echojociste.cg' },
  ]

  for (const m of members) {
    const existing = await prisma.member.findFirst({ where: { name: m.name } })
    if (!existing) await prisma.member.create({ data: m })
  }
  console.log('Members created')

  // JOC Family
  const family = [
    { name: 'Abbé Daniel Makaya', role: 'Aumônier national', bio: 'Accompagne la JOC Congo-Brazzaville depuis 2014.', parcours: 'Prêtre ordonné en 2008, formé au grand séminaire de Brazzaville.', team: 'Direction nationale' },
    { name: 'Christian Mboundza', role: 'Président national', bio: 'Président de la JOC Congo-Brazzaville depuis 2022.', parcours: 'Jociste depuis 2015, formé à la méthode Voir – Juger – Agir.', team: 'Direction nationale' },
  ]

  for (const f of family) {
    const existing = await prisma.jocFamily.findFirst({ where: { name: f.name } })
    if (!existing) await prisma.jocFamily.create({ data: f })
  }
  console.log('JOC Family created')

  // Social Links
  const socials = [
    { platform: 'WhatsApp', url: 'https://wa.me/242000000000', icon: 'whatsapp' },
    { platform: 'Facebook', url: 'https://facebook.com/echojociste', icon: 'facebook' },
    { platform: 'YouTube', url: 'https://youtube.com/@echojociste', icon: 'youtube' },
    { platform: 'TikTok', url: 'https://tiktok.com/@echojociste', icon: 'tiktok' },
  ]

  for (const s of socials) {
    const existing = await prisma.socialLink.findFirst({ where: { platform: s.platform } })
    if (!existing) await prisma.socialLink.create({ data: s })
  }
  console.log('Social links created')

  // Pages
  const pages = [
    {
      title: 'Pourquoi être Jociste ?',
      slug: 'pourquoi-etre-jociste',
      content: `<h1>Pourquoi être Jociste ?</h1>
<h2>Qu'est-ce qu'un Jociste ?</h2>
<p>Un Jociste est un jeune qui fait partie de la Jeunesse Ouvrière Chrétienne. C'est un jeune qui choisit de vivre sa foi en actes, qui regarde sa réalité, la juge à la lumière de l'Évangile, et agit pour la transformer.</p>
<h2>Pourquoi devenir Jociste ?</h2>
<p>Devenir Jociste, c'est :</p>
<ul>
<li>Grandir dans la foi et la responsabilité</li>
<li>Vivre la fraternité avec d'autres jeunes</li>
<li>S'engager concrètement dans la société</li>
<li>Découvrir sa vocation et sa mission</li>
<li>Être formé au leadership chrétien</li>
</ul>
<h2>La méthode Voir – Juger – Agir</h2>
<p>La JOC propose une méthode simple et puissante :</p>
<ul>
<li><strong>VOIR</strong> : Observer sa réalité avec lucidité</li>
<li><strong>JUGER</strong> : Éclairer cette réalité par l'Évangile</li>
<li><strong>AGIR</strong> : Transformer concrètement la situation</li>
</ul>
<h2>L'héritage de Joseph Cardijn</h2>
<p>Joseph Cardijn (1882-1967), fondateur de la JOC, a dédié sa vie à l'éducation des jeunes travailleurs. Sa vision : chaque jeune a une dignité et une mission. Sa méthode : Voir, Juger, Agir.</p>
<h2>Saint Joseph, patron des travailleurs</h2>
<p>La JOC place son action sous le patronage de Saint Joseph, charpentier et père nourricier de Jésus. Il incique le travail, la dignité et la fidélité.</p>
<p>« Jeune chrétien, sois créatif ! »</p>
<p>#soisjociste #soisresponsable #échojociste</p>`,
    },
    {
      title: 'La vie dans la JOC',
      slug: 'la-vie-dans-la-joc',
      content: `<h1>La vie dans la JOC</h1>
<p>La JOC n'est pas seulement une organisation. C'est une vie partagée, une fraternité vécue au quotidien. Voici ce que vivent les jeunes Jocistes.</p>
<h2>Rencontres et réunions</h2>
<p>Les équipes JOC se réunissent régulièrement pour partager leurs expériences, réfléchir ensemble et préparer des actions. Ces moments de rencontre sont au cœur de la vie jociste.</p>
<h2>Camps et marches</h2>
<p>Chaque année, la JOC organise des camps et des marches qui rassemblent les jeunes autour de la foi, de la formation et de la fraternité.</p>
<h2>Formations</h2>
<p>La JOC forme ses membres au leadership, à la responsabilité, à l'analyse sociale et à la méthode Voir – Juger – Agir.</p>
<h2>Actions sociales</h2>
<p>Les Jocistes agissent concrètement : nettoyage de quartiers, aide aux démunis, sensibilisation, soutien aux personnes vulnérables.</p>
<h2>Témoignages</h2>
<p>Les jeunes partagent leurs expériences de vie et de foi, s'encouragent mutuellement et grandissent ensemble.</p>`,
    },
  ]

  for (const p of pages) {
    await prisma.page.upsert({
      where: { slug: p.slug },
      update: {},
      create: p,
    })
  }
  console.log('Pages created')

  // Blog source
  const existingBlog = await prisma.blogSource.findFirst({ where: { url: 'https://magazinechretienne1echojociste.blogspot.com' } })
  if (!existingBlog) {
    await prisma.blogSource.create({
      data: {
        name: 'Écho Jociste – Blog',
        url: 'https://magazinechretienne1echojociste.blogspot.com',
        feedUrl: 'https://magazinechretienne1echojociste.blogspot.com/feeds/posts/default',
      },
    })
  }
  console.log('Blog source created')

  // Notifications
  const notifs = [
    { title: 'Nouvel article publié', message: '« Joseph Cardijn et la méthode Voir – Juger – Agir » est maintenant disponible.', type: 'article', link: '/magazine/joseph-cardijn-methode-voir-juger-agir' },
    { title: 'Retraite spirituelle à venir', message: 'La retraite spirituelle JOC 2025 aura lieu le 15 février.', type: 'event', link: '/evenements/retraite-spirituelle-joc-2025' },
  ]

  for (const n of notifs) {
    const existing = await prisma.notification.findFirst({ where: { title: n.title } })
    if (!existing) await prisma.notification.create({ data: n })
  }
  console.log('Notifications created')

  // Forum Categories
  const forumCats = [
    { name: 'Foi et spiritualité', slug: 'foi-et-spiritualite', description: 'Échanges sur la foi, la prière et la vie spirituelle', icon: 'Church', color: '#dc2626', order: 1 },
    { name: 'Vie JOC', slug: 'vie-joc', description: 'La vie du mouvement, les équipes, les activités', icon: 'Users', color: '#0891b2', order: 2 },
    { name: 'Jeunesse', slug: 'jeunesse', description: 'Paroles de jeunes, questions, défis', icon: 'Sparkles', color: '#f59e0b', order: 3 },
    { name: 'Engagement citoyen', slug: 'engagement-citoyen', description: 'Engagement dans la société, citoyenneté, justice', icon: 'HeartHandshake', color: '#16a34a', order: 4 },
    { name: 'Travail', slug: 'travail', description: 'Le monde du travail, la dignité du travailleur', icon: 'Briefcase', color: '#6366f1', order: 5 },
    { name: 'Questions', slug: 'questions', description: 'Posez vos questions, échangez des réponses', icon: 'HelpCircle', color: '#7c3aed', order: 6 },
    { name: 'Témoignages', slug: 'temoignages-forum', description: 'Partagez vos témoignages et expériences de vie', icon: 'MessageCircle', color: '#ea580c', order: 7 },
  ]

  for (const fc of forumCats) {
    const existing = await prisma.forumCategory.findFirst({ where: { slug: fc.slug } })
    if (!existing) await prisma.forumCategory.create({ data: fc })
  }
  console.log('Forum categories created')

  console.log('Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

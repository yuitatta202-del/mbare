// src/routes/sitemap.routes.ts
import { Router } from 'express';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/sitemap.xml', async (req, res) => {
  try {
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
    
    // 1. Pagine statiche (quelle fisse)
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/news', priority: '0.9', changefreq: 'daily' },
      { url: '/spiffera', priority: '0.9', changefreq: 'hourly' },
      { url: '/arcade', priority: '0.8', changefreq: 'weekly' },
      { url: '/community', priority: '0.8', changefreq: 'weekly' },
      { url: '/bacheca', priority: '0.9', changefreq: 'hourly' },
      { url: '/shop', priority: '0.7', changefreq: 'monthly' },
      { url: '/faq', priority: '0.5', changefreq: 'monthly' },
      { url: '/terms', priority: '0.3', changefreq: 'yearly' },
      { url: '/privacy', priority: '0.3', changefreq: 'yearly' },
    ];

    // 2. Pagine dinamiche (News)
    const posts = await prisma.post.findMany({
      where: { status: 'published' },
      select: { slug: true, updatedAt: true },
      orderBy: { createdAt: 'desc' }
    });

    // 3. Costruiamo l'XML
    let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
    xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;

    // Aggiungi pagine statiche
    staticPages.forEach(page => {
      xml += `  <url>\n`;
      xml += `    <loc>${frontendUrl}${page.url}</loc>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    });

    // Aggiungi news dinamiche
    posts.forEach(post => {
      xml += `  <url>\n`;
      xml += `    <loc>${frontendUrl}/news/${post.slug}</loc>\n`;
      xml += `    <lastmod>${post.updatedAt.toISOString()}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.8</priority>\n`;
      xml += `  </url>\n`;
    });

    xml += `</urlset>`;

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Errore generazione sitemap:', error);
    res.status(500).send('Errore interno del server');
  }
});

export default router;
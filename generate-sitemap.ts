import fs from 'fs';
import path from 'path';
import Database from 'better-sqlite3';
import { MOCK_TEAMS, MOCK_NEWS, MOCK_EVENTS, MOCK_JOBS } from './constants';

const BASE_URL = 'https://geekayesports.com';

// Custom duplicate of getEventSlug to avoid importing React components in node
const getEventSlug = (title: string | null | undefined): string => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const sitemapUrls: SitemapUrl[] = [];
const addedLocs = new Set<string>();

const currentDate = new Date().toISOString().split('T')[0];

function addUrl(urlPath: string, priority: string = '0.5', changefreq: string = 'weekly') {
  const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
  const fullUrl = `${BASE_URL}${cleanPath}`;
  
  if (!addedLocs.has(fullUrl)) {
    addedLocs.add(fullUrl);
    sitemapUrls.push({
      loc: fullUrl,
      lastmod: currentDate,
      changefreq,
      priority
    });
  }
}

async function generate() {
  console.log('Starting sitemap generation...');

  // 1. Add Static Routes
  const staticRoutes = [
    { path: '/', priority: '1.0', changefreq: 'daily' },
    { path: '/news', priority: '0.8', changefreq: 'daily' },
    { path: '/events', priority: '0.8', changefreq: 'daily' },
    { path: '/teams', priority: '0.8', changefreq: 'weekly' },
    { path: '/about', priority: '0.7', changefreq: 'monthly' },
    { path: '/careers', priority: '0.7', changefreq: 'weekly' },
    { path: '/info', priority: '0.5', changefreq: 'monthly' },
    { path: '/socials', priority: '0.6', changefreq: 'weekly' }
  ];

  staticRoutes.forEach(r => addUrl(r.path, r.priority, r.changefreq));

  // 2. Open Database safely if it exists
  const dbPath = 'geekay.db';
  let db: any = null;
  if (fs.existsSync(dbPath)) {
    try {
      db = new Database(dbPath);
      console.log('Database connected successfully.');
    } catch (err) {
      console.error('Could not connect to SQLite database:', err);
    }
  } else {
    console.log('SQLite database file not found. Using Mock lists only.');
  }

  // 3. Process Teams & Players (from MOCK_TEAMS)
  MOCK_TEAMS.forEach(team => {
    addUrl(`/teams/${team.id}`, '0.8', 'weekly');
    if (team.players) {
      team.players.forEach(player => {
        addUrl(`/players/${player.nickname.toLowerCase()}`, '0.7', 'weekly');
      });
    }
  });

  // Query DB Teams and Players
  if (db) {
    try {
      const dbTeams = db.prepare('SELECT id FROM teams WHERE published = 1').all() as { id: string | number }[];
      dbTeams.forEach(t => {
        addUrl(`/teams/${t.id}`, '0.8', 'weekly');
      });
    } catch (err) {
      console.error('Error fetching teams from database:', err);
    }

    try {
      const dbPlayers = db.prepare("SELECT ign FROM players WHERE status = 'active'").all() as { ign: string }[];
      dbPlayers.forEach(p => {
        if (p.ign) {
          addUrl(`/players/${p.ign.toLowerCase()}`, '0.7', 'weekly');
        }
      });
    } catch (err) {
      console.error('Error fetching players from database:', err);
    }
  }

  // 4. Process News
  const newsSlugs = new Set<string>();
  MOCK_NEWS.forEach(n => {
    if (n.slug) newsSlugs.add(n.slug);
  });

  if (db) {
    try {
      const dbNews = db.prepare('SELECT slug FROM news WHERE published = 1').all() as { slug: string }[];
      dbNews.forEach(n => {
        if (n.slug) newsSlugs.add(n.slug);
      });
    } catch (err) {
      console.error('Error fetching news from database:', err);
    }
  }

  newsSlugs.forEach(slug => {
    addUrl(`/news/${slug}`, '0.7', 'weekly');
  });

  // 5. Process Events
  const eventSlugs = new Set<string>();
  MOCK_EVENTS.forEach(ev => {
    if (ev.title) {
      eventSlugs.add(getEventSlug(ev.title));
    }
  });

  if (db) {
    try {
      const dbEvents = db.prepare('SELECT title FROM events WHERE published = 1').all() as { title: string }[];
      dbEvents.forEach(ev => {
        if (ev.title) {
          eventSlugs.add(getEventSlug(ev.title));
        }
      });
    } catch (err) {
      console.error('Error fetching events from database:', err);
    }
  }

  eventSlugs.forEach(slug => {
    addUrl(`/events/${slug}`, '0.6', 'weekly');
  });

  // 6. Process Careers/Jobs
  const jobSlugs = new Set<string>();
  MOCK_JOBS.forEach(j => {
    if (j.slug) jobSlugs.add(j.slug);
  });

  if (db) {
    try {
      const dbJobs = db.prepare('SELECT slug FROM jobs WHERE published = 1').all() as { slug: string }[];
      dbJobs.forEach(j => {
        if (j.slug) jobSlugs.add(j.slug);
      });
    } catch (err) {
      console.error('Error fetching jobs from database:', err);
    }
  }

  jobSlugs.forEach(slug => {
    addUrl(`/careers/${slug}`, '0.6', 'weekly');
  });

  // Close db safely
  if (db) {
    db.close();
  }

  // 7. Write sitemap.xml file
  const xmlContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemapUrls.map(u => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${u.lastmod}</lastmod>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

  // Write to /public/sitemap.xml and /sitemap.xml to be safe and available across setups
  try {
    if (!fs.existsSync('public')) {
      fs.mkdirSync('public');
    }
    fs.writeFileSync(path.join('public', 'sitemap.xml'), xmlContent, 'utf8');
    console.log('Successfully wrote sitemap to public/sitemap.xml');
  } catch (err) {
    console.error('Error writing sitemap to public directory:', err);
  }

  try {
    fs.writeFileSync('sitemap.xml', xmlContent, 'utf8');
    console.log('Successfully wrote sitemap to sitemap.xml');
  } catch (err) {
    console.error('Error writing sitemap to sitemap.xml:', err);
  }

  console.log(`Sitemap generation complete! Total URLs listed: ${sitemapUrls.length}`);
}

generate().catch(err => {
  console.error('Sitemap generator encountered an error:', err);
  process.exit(1);
});


import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import multer from 'multer';
import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isVercel = process.env.VERCEL === '1';
const dbPath = isVercel ? '/tmp/geekay.db' : 'geekay.db';

// Supabase Client Initialization
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
const supabaseStorageBucket = process.env.SUPABASE_STORAGE_BUCKET || 'media';

export const supabase = (supabaseUrl && supabaseKey)
  ? createClient(supabaseUrl, supabaseKey)
  : null;

if (supabase) {
  console.log('✅ [Supabase] Client initialized successfully.');
} else {
  console.log('ℹ️ [Supabase] Environment variables missing. Operating with local database fallback.');
}

console.log('Current directory:', process.cwd());
console.log('Root files:', fs.readdirSync('.'));

// If on Vercel, copy the initial DB to /tmp if it doesn't exist
if (isVercel && !fs.existsSync(dbPath) && fs.existsSync('geekay.db')) {
  console.log('Copying database to /tmp...');
  fs.copyFileSync('geekay.db', dbPath);
}

let db: any;

function connectDb() {
  try {
    const instance = new Database(dbPath);
    instance.pragma('busy_timeout = 10000');
    instance.exec('PRAGMA journal_mode = DELETE');
    // Check integrity
    const integrity = instance.prepare('PRAGMA integrity_check').get() as any;
    if (integrity && integrity.integrity_check !== 'ok') {
      throw new Error(`DB Integrity check failed: ${JSON.stringify(integrity)}`);
    }
    console.log(`Database connected successfully at ${dbPath}`);
    return instance;
  } catch (err: any) {
    console.error(`SQLite database connection or integrity failed at ${dbPath}:`, err?.message || err);
    if (fs.existsSync(dbPath)) {
      try {
        console.warn(`Unlinking corrupted database file at ${dbPath}...`);
        fs.unlinkSync(dbPath);
        if (fs.existsSync(`${dbPath}-journal`)) fs.unlinkSync(`${dbPath}-journal`);
        if (fs.existsSync(`${dbPath}-wal`)) fs.unlinkSync(`${dbPath}-wal`);
        if (fs.existsSync(`${dbPath}-shm`)) fs.unlinkSync(`${dbPath}-shm`);
      } catch (unlinkErr) {
        console.error('Failed to unlink corrupt DB file:', unlinkErr);
      }
    }
    // Retry fresh connection
    try {
      const freshInstance = new Database(dbPath);
      freshInstance.pragma('busy_timeout = 10000');
      freshInstance.exec('PRAGMA journal_mode = DELETE');
      console.log(`Fresh database created and connected at ${dbPath}`);
      return freshInstance;
    } catch (fallbackErr) {
      console.error('Failed to create fresh SQLite database, falling back to in-memory db:', fallbackErr);
      const inMemory = new Database(':memory:');
      inMemory.pragma('busy_timeout = 10000');
      return inMemory;
    }
  }
}

db = connectDb(); 

try {
  // Test write permission
  const testPath = isVercel ? '/tmp/test-write' : 'test-write';
  fs.writeFileSync(testPath, 'test');
  fs.unlinkSync(testPath);
  console.log('File system is writable');
} catch (err) {
  console.error('File system is NOT writable:', err);
}

const JWT_SECRET = process.env.JWT_SECRET || 'geekay-esports-secret';

export const app = express();

// --- Database Initialization ---
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    email TEXT,
    password TEXT,
    role TEXT CHECK(role IN ('admin', 'editor')),
    status TEXT DEFAULT 'active',
    created_at TEXT,
    last_login TEXT
  );

  CREATE TABLE IF NOT EXISTS security_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT,
    username TEXT,
    ip_address TEXT,
    details TEXT,
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS leadership (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    role TEXT,
    description TEXT,
    linkedin TEXT,
    image TEXT,
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS partners (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    category TEXT,
    description TEXT,
    image TEXT,
    url TEXT,
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS teams (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    game TEXT,
    region TEXT,
    league TEXT,
    banner TEXT,
    logo TEXT,
    bio TEXT,
    tagline TEXT,
    win_rate TEXT DEFAULT '75%',
    global_rank TEXT DEFAULT '#1 GLOBAL',
    championships INTEGER DEFAULT 3,
    season_record TEXT DEFAULT '18-4',
    achievements TEXT, -- JSON string
    media TEXT, -- JSON string
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS players (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    team_id INTEGER,
    ign TEXT,
    nickname TEXT,
    role TEXT,
    name TEXT,
    age TEXT,
    nationality TEXT,
    photo TEXT,
    bio TEXT,
    kd REAL DEFAULT 1.0,
    mvps INTEGER DEFAULT 0,
    tournaments INTEGER DEFAULT 0,
    win_rate TEXT DEFAULT '70%',
    socials TEXT, -- JSON string
    achievements TEXT, -- JSON string
    joined_date TEXT,
    match_history TEXT,
    media TEXT,
    rating_overall REAL DEFAULT 4.5,
    rating_performance REAL DEFAULT 4.5,
    rating_consistency REAL DEFAULT 4.5,
    rating_community REAL DEFAULT 4.5,
    championship_wins TEXT,
    major_titles TEXT,
    int_placements TEXT,
    trophy_count TEXT,
    display_order INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    published INTEGER DEFAULT 1,
    FOREIGN KEY(team_id) REFERENCES teams(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS creators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    alias TEXT,
    username TEXT,
    photo TEXT,
    cover_image TEXT,
    short_bio TEXT,
    bio TEXT,
    country TEXT,
    nationality TEXT,
    languages TEXT, -- JSON array
    primary_platform TEXT,
    category TEXT,
    team_id INTEGER,
    associated_games TEXT, -- JSON array
    role TEXT,
    joined_date TEXT,
    featured INTEGER DEFAULT 0,
    verified INTEGER DEFAULT 0,
    status TEXT DEFAULT 'active',
    published INTEGER DEFAULT 1,
    socials TEXT, -- JSON object
    platforms TEXT, -- JSON array
    metrics TEXT, -- JSON object
    total_reach TEXT,
    focus TEXT,
    gallery_images TEXT, -- JSON array
    intro_video TEXT,
    seo_title TEXT,
    meta_description TEXT,
    seo_slug TEXT,
    og_image TEXT,
    canonical_url TEXT,
    display_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS news (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT UNIQUE,
    category TEXT,
    category_id INTEGER,
    excerpt TEXT,
    image TEXT,
    gallery_images TEXT, -- JSON array
    content TEXT,
    author TEXT,
    author_id INTEGER,
    date TEXT,
    updated_at TEXT,
    tags TEXT, -- JSON array of strings
    featured INTEGER DEFAULT 0,
    breaking_news INTEGER DEFAULT 0,
    status TEXT DEFAULT 'published', -- draft, published, scheduled, archived
    published INTEGER DEFAULT 1,
    readTime TEXT,
    read_time TEXT,
    related_team TEXT,
    related_game TEXT,
    display_order INTEGER DEFAULT 0,
    seo_title TEXT,
    meta_description TEXT,
    meta_keywords TEXT,
    canonical_url TEXT,
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    twitter_image TEXT,
    index_robot INTEGER DEFAULT 1,
    follow_robot INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS news_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    slug TEXT UNIQUE,
    description TEXT,
    image TEXT,
    active INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS news_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    slug TEXT UNIQUE,
    description TEXT
  );

  CREATE TABLE IF NOT EXISTS news_authors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    photo TEXT,
    title TEXT,
    bio TEXT,
    socials TEXT -- JSON string
  );

  CREATE TABLE IF NOT EXISTS events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    game TEXT,
    type TEXT,
    start_date TEXT,
    end_date TEXT,
    time TEXT,
    region TEXT,
    status TEXT,
    link TEXT,
    featured INTEGER DEFAULT 0,
    description TEXT,
    banner TEXT,
    organizer TEXT,
    teams TEXT,
    matches TEXT,
    results TEXT,
    media TEXT,
    social TEXT,
    published INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS gallery (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    category TEXT,
    type TEXT,
    url TEXT,
    thumbnail TEXT,
    caption TEXT,
    tags TEXT,
    featured INTEGER DEFAULT 0,
    display_order INTEGER DEFAULT 0,
    published INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT,
    slug TEXT,
    department TEXT,
    location TEXT,
    type TEXT,
    work_type TEXT,
    experience TEXT,
    summary TEXT,
    description TEXT,
    requirements TEXT,
    responsibilities TEXT,
    nice_to_have TEXT,
    benefits TEXT,
    email TEXT,
    application_email TEXT,
    status TEXT DEFAULT 'open',
    published INTEGER DEFAULT 1,
    display_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    created_at TEXT,
    status TEXT DEFAULT 'active'
  );

  CREATE TABLE IF NOT EXISTS game_titles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE,
    display_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS activity_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT,
    entity_type TEXT,
    entity_id TEXT,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
  );
`);
console.log('Database schema initialized successfully');

// Seed default global settings if empty
try {
  const countSettings = (db.prepare('SELECT count(*) as count FROM settings').get() as any)?.count || 0;
  if (countSettings === 0) {
    const defaultSettingsMap: Record<string, string> = {
      general_email: 'general@geekay.com',
      partnerships_email: 'partnerships@geekay.com',
      business_email: 'business@geekay.com',
      careers_email: 'careers@geekay.com',
      twitter_url: 'https://twitter.com/geekayesports',
      twitch_url: 'https://twitch.tv/geekayesports',
      instagram_url: 'https://instagram.com/geekayesports',
      youtube_url: 'https://youtube.com/geekayesports',
      snapchat_url: 'https://snapchat.com/add/geekayesports',
      tiktok_url: 'https://tiktok.com/@geekayesports',
      facebook_url: 'https://facebook.com/geekayesports',
      discord_url: 'https://discord.gg/geekayesports',
      site_announcement: 'GEEKAY PRO SHOP NOW OPEN IN UAE & KSA - EXPLORE OFFICIAL APPAREL',
      announcement_active: 'true',
      announcement_badge: 'OFFICIAL BRIEFING',
      announcement_link: 'https://www.geekay.com/en/',
      twitter_count: '399K',
      twitch_count: '645K',
      instagram_count: '240K',
      youtube_count: '523K',
      tiktok_count: '481K',
      facebook_count: '8.7K',
      riyadh_address: 'Al Nemer Center, 2nd Tower, 3rd Floor, Office 312, P.O. Box 12214, Riyadh',
      riyadh_phone: '+966 54 097 4261',
      riyadh_email: 'esports@geekaygroupmea.com',
      riyadh_po_box: '12214',
      dubai_address: '1 19D Street, Al Aweer, Industrial Area First, Ras Al Khor, P.O. Box 2589, Dubai',
      dubai_phone: '+971 52 505 9709',
      dubai_email: 'esports@geekaygroupmea.com',
      dubai_po_box: '2589'
    };
    const insertSetting = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    for (const [k, v] of Object.entries(defaultSettingsMap)) {
      insertSetting.run(k, v);
    }
    console.log('Seeded default global settings.');
  }
} catch (setErr) {
  console.error('Error seeding settings:', setErr);
}

// Seed default game titles if empty
try {
  const gameTitlesCount = (db.prepare('SELECT COUNT(*) as count FROM game_titles').get() as any)?.count || 0;
  if (gameTitlesCount === 0) {
    const defaultTitles = ['RL', 'HOK', 'PUBG', 'VALORANT', 'LOL', 'CS2', 'OVERWATCH 2', 'EA FC 26', 'TEKKEN 8'];
    const stmt = db.prepare('INSERT OR IGNORE INTO game_titles (name, display_order) VALUES (?, ?)');
    defaultTitles.forEach((name, idx) => stmt.run(name, idx + 1));
    console.log('Seeded default game titles.');
  }
} catch (gtErr) {
  console.error('Error seeding game titles:', gtErr);
}

// Additional migrations helper
const addColumnSafely = (table: string, column: string, type: string) => {
  try {
    db.prepare(`SELECT ${column} FROM ${table} LIMIT 1`).get();
  } catch (e) {
    console.log(`Adding ${column} column to ${table} table...`);
    try {
      db.exec(`ALTER TABLE ${table} ADD COLUMN ${column} ${type}`);
    } catch (alterErr) {
      console.error(`Failed to alter table ${table} column ${column}:`, alterErr);
    }
  }
};

// Migrate all tables for safe schema expansion
addColumnSafely('users', 'email', 'TEXT');
addColumnSafely('users', 'status', 'TEXT DEFAULT "active"');
addColumnSafely('users', 'created_at', 'TEXT');
addColumnSafely('leadership', 'display_order', 'INTEGER DEFAULT 0');
addColumnSafely('leadership', 'twitter', 'TEXT');
addColumnSafely('leadership', 'x', 'TEXT');
addColumnSafely('leadership', 'instagram', 'TEXT');
addColumnSafely('partners', 'display_order', 'INTEGER DEFAULT 0');
addColumnSafely('partners', 'published', 'INTEGER DEFAULT 1');
addColumnSafely('partners', 'url', 'TEXT');
addColumnSafely('partners', 'image', 'TEXT');
addColumnSafely('teams', 'display_order', 'INTEGER DEFAULT 0');
addColumnSafely('teams', 'logo', 'TEXT');
addColumnSafely('teams', 'bio', 'TEXT');
addColumnSafely('players', 'joined_date', 'TEXT');
addColumnSafely('players', 'match_history', 'TEXT');
addColumnSafely('players', 'media', 'TEXT');
addColumnSafely('players', 'total_matches', 'INTEGER DEFAULT 0');
addColumnSafely('teams', 'win_rate', 'TEXT DEFAULT "75%"');
addColumnSafely('teams', 'global_rank', 'TEXT DEFAULT "#1 GLOBAL"');
addColumnSafely('teams', 'championships', 'INTEGER DEFAULT 3');

addColumnSafely('players', 'display_order', 'INTEGER DEFAULT 0');
addColumnSafely('players', 'photo', 'TEXT');
addColumnSafely('players', 'bio', 'TEXT');
addColumnSafely('players', 'kd', 'REAL DEFAULT 1.0');
addColumnSafely('players', 'mvps', 'INTEGER DEFAULT 0');
addColumnSafely('players', 'tournaments', 'INTEGER DEFAULT 0');
addColumnSafely('players', 'win_rate', 'TEXT DEFAULT "70%"');
addColumnSafely('players', 'nickname', 'TEXT');
addColumnSafely('players', 'published', 'INTEGER DEFAULT 1');
addColumnSafely('players', 'oper_age', 'TEXT');
addColumnSafely('players', 'joined_date', 'TEXT');
addColumnSafely('players', 'division', 'TEXT');
addColumnSafely('players', 'region', 'TEXT');
addColumnSafely('players', 'league', 'TEXT');
addColumnSafely('players', 'rating_overall', 'REAL DEFAULT 4.5');
addColumnSafely('players', 'rating_performance', 'REAL DEFAULT 4.5');
addColumnSafely('players', 'rating_consistency', 'REAL DEFAULT 4.5');
addColumnSafely('players', 'rating_community', 'REAL DEFAULT 4.5');
addColumnSafely('players', 'matches', 'INTEGER DEFAULT 0');
addColumnSafely('players', 'tournament_results', 'TEXT');
addColumnSafely('players', 'championship_wins', 'TEXT');
addColumnSafely('players', 'major_titles', 'TEXT');
addColumnSafely('players', 'int_placements', 'TEXT');
addColumnSafely('players', 'trophy_count', 'TEXT');
addColumnSafely('players', 'media', 'TEXT');

addColumnSafely('teams', 'overview_title', 'TEXT');
addColumnSafely('teams', 'established', 'TEXT');
addColumnSafely('teams', 'active_status', 'TEXT');
addColumnSafely('teams', 'live_feed', 'TEXT');
addColumnSafely('teams', 'season_record', 'TEXT');
addColumnSafely('teams', 'media', 'TEXT');
addColumnSafely('teams', 'staff', 'TEXT');
addColumnSafely('teams', 'socials', 'TEXT');

addColumnSafely('events', 'overview_title', 'TEXT');
addColumnSafely('events', 'prize_pool', 'TEXT');
addColumnSafely('events', 'total_teams', 'TEXT');
addColumnSafely('events', 'broadcast', 'TEXT');
addColumnSafely('events', 'purpose', 'TEXT');
addColumnSafely('events', 'format', 'TEXT');
addColumnSafely('events', 'timeline', 'TEXT');
addColumnSafely('events', 'venue', 'TEXT');
addColumnSafely('events', 'broadcast_platforms', 'TEXT');

addColumnSafely('jobs', 'email', 'TEXT');
addColumnSafely('jobs', 'application_email', 'TEXT');

addColumnSafely('creators', 'name', 'TEXT');
addColumnSafely('creators', 'username', 'TEXT');
addColumnSafely('creators', 'cover_image', 'TEXT');
addColumnSafely('creators', 'short_bio', 'TEXT');
addColumnSafely('creators', 'bio', 'TEXT');
addColumnSafely('creators', 'country', 'TEXT');
addColumnSafely('creators', 'nationality', 'TEXT');
addColumnSafely('creators', 'languages', 'TEXT');
addColumnSafely('creators', 'primary_platform', 'TEXT');
addColumnSafely('creators', 'category', 'TEXT');
addColumnSafely('creators', 'team_id', 'INTEGER');
addColumnSafely('creators', 'associated_games', 'TEXT');
addColumnSafely('creators', 'role', 'TEXT');
addColumnSafely('creators', 'joined_date', 'TEXT');
addColumnSafely('creators', 'featured', 'INTEGER DEFAULT 0');
addColumnSafely('creators', 'verified', 'INTEGER DEFAULT 0');
addColumnSafely('creators', 'status', 'TEXT DEFAULT "active"');
addColumnSafely('creators', 'socials', 'TEXT');
addColumnSafely('creators', 'platforms', 'TEXT');
addColumnSafely('creators', 'metrics', 'TEXT');
addColumnSafely('creators', 'total_reach', 'TEXT');
addColumnSafely('creators', 'focus', 'TEXT');
addColumnSafely('creators', 'display_order', 'INTEGER DEFAULT 0');
addColumnSafely('creators', 'published', 'INTEGER DEFAULT 1');
addColumnSafely('creators', 'gallery_images', 'TEXT');
addColumnSafely('creators', 'intro_video', 'TEXT');
addColumnSafely('creators', 'seo_title', 'TEXT');
addColumnSafely('creators', 'meta_description', 'TEXT');
addColumnSafely('creators', 'seo_slug', 'TEXT');
addColumnSafely('creators', 'og_image', 'TEXT');
addColumnSafely('creators', 'canonical_url', 'TEXT');

addColumnSafely('news', 'readTime', 'TEXT');
addColumnSafely('news', 'read_time', 'TEXT');
addColumnSafely('news', 'related_team', 'TEXT');
addColumnSafely('news', 'related_game', 'TEXT');
addColumnSafely('news', 'tags', 'TEXT');
addColumnSafely('news', 'display_order', 'INTEGER DEFAULT 0');
addColumnSafely('news', 'category_id', 'INTEGER');
addColumnSafely('news', 'author_id', 'INTEGER');
addColumnSafely('news', 'updated_at', 'TEXT');
addColumnSafely('news', 'gallery_images', 'TEXT');
addColumnSafely('news', 'breaking_news', 'INTEGER DEFAULT 0');
addColumnSafely('news', 'status', 'TEXT DEFAULT "published"');
addColumnSafely('news', 'seo_title', 'TEXT');
addColumnSafely('news', 'meta_description', 'TEXT');
addColumnSafely('news', 'meta_keywords', 'TEXT');
addColumnSafely('news', 'canonical_url', 'TEXT');
addColumnSafely('news', 'og_title', 'TEXT');
addColumnSafely('news', 'og_description', 'TEXT');
addColumnSafely('news', 'og_image', 'TEXT');
addColumnSafely('news', 'twitter_image', 'TEXT');
addColumnSafely('news', 'index_robot', 'INTEGER DEFAULT 1');
addColumnSafely('news', 'follow_robot', 'INTEGER DEFAULT 1');

addColumnSafely('events', 'banner', 'TEXT');
addColumnSafely('events', 'organizer', 'TEXT');
addColumnSafely('events', 'teams', 'TEXT');
addColumnSafely('events', 'matches', 'TEXT');

// Dynamically retrieve table columns to prevent SQL errors on unknown fields
const getValidColumns = (tableName: string): string[] => {
  try {
    const columns = db.prepare(`PRAGMA table_info(${tableName})`).all();
    return columns.map((col: any) => col.name);
  } catch (err) {
    return [];
  }
};
addColumnSafely('events', 'results', 'TEXT');
addColumnSafely('events', 'media', 'TEXT');
addColumnSafely('events', 'social', 'TEXT');

addColumnSafely('jobs', 'slug', 'TEXT');
addColumnSafely('jobs', 'work_type', 'TEXT');
addColumnSafely('jobs', 'summary', 'TEXT');
addColumnSafely('jobs', 'nice_to_have', 'TEXT');
addColumnSafely('jobs', 'benefits', 'TEXT');

// Seed default events if table is empty
const eventCount: any = db.prepare('SELECT COUNT(*) as count FROM events').get();
if (eventCount.count === 0) {
  console.log('Seeding initial events into database...');
  const initialEvents = [
    {
      title: 'RLCS Major 2026',
      game: 'RL',
      type: 'tournament',
      start_date: '2026-02-10',
      end_date: '2026-02-15',
      time: '17:00',
      region: 'EMEA',
      status: 'finished',
      link: 'https://x.com/geekay_esports',
      featured: 1,
      description: 'The Rocket League Championship Series Major 1 gathers the best rosters globally to fight for EMEA dominance and international ranking points in London. Geekay Esports has qualified through exceptional regional performance and is set to clash with global giants.',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
      organizer: 'Psyonix / BLAST',
      teams: JSON.stringify([
        { name: "Geekay Esports", logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" },
        { name: "Team Falcons", logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" },
        { name: "Karmine Corp", logo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=100&h=100", region: "France" },
        { name: "G2 Esports", logo: "https://images.unsplash.com/photo-1548685913-fe6574abf1a5?auto=format&fit=crop&q=80&w=100&h=100", region: "North America" }
      ]),
      matches: JSON.stringify([
        { date: "2026-02-10", teams: "Geekay vs Karmine Corp", score: "3 - 2", status: "completed" },
        { date: "2026-02-12", teams: "Geekay vs Team Falcons", score: "1 - 3", status: "completed" },
        { date: "2026-02-14", teams: "Karmine Corp vs G2 Esports", score: "3 - 1", status: "completed" }
      ]),
      results: JSON.stringify({
        winner: "Team Falcons",
        runnerUp: "Geekay Esports",
        mvp: "M7sN"
      }),
      media: JSON.stringify([
        { type: "photo", url: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=500" },
        { type: "photo", url: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800&h=500" },
        { type: "photo", url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800&h=500" }
      ]),
      social: JSON.stringify([
        { platform: "twitter", handle: "@Geekay_Esports", text: "THE CHANCE TO MAKE HISTORY. We take on Karmine Corp in the opening round of the RLCS London Major! 🇸🇦 #GKDominance" },
        { platform: "instagram", handle: "geekay_esports", text: "London, we have arrived. The squad is locked in for the RLCS Major. Drop your support below! 👇 #GeekayArena" }
      ])
    },
    {
      title: 'PUBG Mobile World Cup',
      game: 'PUBG',
      type: 'tournament',
      start_date: '2026-02-18',
      end_date: '2026-02-23',
      time: '13:00',
      region: 'GLOBAL',
      status: 'upcoming',
      link: 'https://x.com/geekay_esports',
      featured: 1,
      description: 'The PUBG Mobile World Cup brings together top teams to battle on the grandest stage. With high stakes and mechanical mastery, Geekay Esports strives to make their mark on global PUBG Mobile history.',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
      organizer: 'Tencent Games / Krafton',
      teams: JSON.stringify([
        { name: "Geekay Esports", logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" },
        { name: "Vampire Esports", logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=100&h=100", region: "Thailand" },
        { name: "Nigma Galaxy", logo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=100&h=100", region: "UAE" }
      ]),
      matches: JSON.stringify([
        { date: "2026-02-18", teams: "Group Stage Day 1", score: "Upcoming", status: "upcoming" },
        { date: "2026-02-19", teams: "Group Stage Day 2", score: "Upcoming", status: "upcoming" }
      ]),
      results: JSON.stringify({}),
      media: JSON.stringify([]),
      social: JSON.stringify([])
    },
    {
      title: 'VCT Global Finals 2026',
      game: 'VALORANT',
      type: 'tournament',
      start_date: '2026-10-12',
      end_date: '2026-10-18',
      time: '18:00',
      region: 'GLOBAL',
      status: 'upcoming',
      link: 'https://x.com/geekay_esports',
      featured: 1,
      description: 'The ultimate showcase of tactical FPS mastery. The VCT Global Finals 2026 in Tokyo will host the elite division of Valorant. Expect unparalleled aim and mind-bending strategy as Geekay takes on the global stage.',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
      organizer: 'Riot Games',
      teams: JSON.stringify([
        { name: "Geekay Esports", logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" },
        { name: "Sentinels", logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=100&h=100", region: "North America" },
        { name: "Fnatic", logo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=100&h=100", region: "Europe" }
      ]),
      matches: JSON.stringify([
        { date: "2026-10-12", teams: "Geekay vs Sentinels", score: "TBD", status: "upcoming" }
      ]),
      results: JSON.stringify({}),
      media: JSON.stringify([]),
      social: JSON.stringify([])
    },
    {
      title: 'OWCS EMEA Stage 2',
      game: 'VALORANT',
      type: 'tournament',
      start_date: '2026-06-24',
      end_date: '2026-06-29',
      time: '16:00',
      region: 'EMEA',
      status: 'live',
      link: 'https://x.com/geekay_esports',
      featured: 1,
      description: 'The Overwatch Champions Series EMEA Stage 2 is currently underway, pitting the sharpest team-fighters in Europe and the Middle East against each other. Action-packed brawls and strategic compositions define this premier series.',
      banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
      organizer: 'Blizzard Entertainment / ESL',
      teams: JSON.stringify([
        { name: "Geekay Esports", logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" },
        { name: "Spacestation Gaming", logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=100&h=100", region: "EMEA" },
        { name: "Twisted Minds", logo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" }
      ]),
      matches: JSON.stringify([
        { date: "2026-06-24", teams: "Geekay vs SSG", score: "2 - 1", status: "live" },
        { date: "2026-06-25", teams: "Geekay vs Twisted Minds", score: "Upcoming", status: "upcoming" }
      ]),
      results: JSON.stringify({}),
      media: JSON.stringify([]),
      social: JSON.stringify([])
    }
  ];

  const stmt = db.prepare(`
    INSERT INTO events (
      title, game, type, start_date, end_date, time, region, status, link, featured, description, banner, organizer, teams, matches, results, media, social, published
    ) VALUES (
      @title, @game, @type, @start_date, @end_date, @time, @region, @status, @link, @featured, @description, @banner, @organizer, @teams, @matches, @results, @media, @social, 1
    )
  `);

  initialEvents.forEach(e => stmt.run(e));
  console.log('Seeded initial events successfully.');
}

// Seed default teams & players if table is empty
const teamCount: any = db.prepare('SELECT COUNT(*) as count FROM teams').get();
if (teamCount.count === 0) {
  console.log('Seeding initial teams and players into database...');
  const t1 = db.prepare(`
    INSERT INTO teams (name, game, region, league, banner, logo, bio, tagline, win_rate, global_rank, championships, achievements, display_order, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1)
  `).run(
    'Rocket League Squad', 'RL', 'MENA', 'RLCS EMEA',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200&h=200',
    'Dominating the aerial pitch across MENA and international RLCS majors with blistering mechanical speed and tactical precision.',
    'AERIAL DOMINANCE IN MENA', '82%', '#1 MENA', 5,
    JSON.stringify(['RLCS MENA Champions 2025', 'London Major Finalist 2026', 'Gamers8 International Trophy'])
  );
  const team1Id = t1.lastInsertRowid;

  const t2 = db.prepare(`
    INSERT INTO teams (name, game, region, league, banner, logo, bio, tagline, win_rate, global_rank, championships, achievements, display_order, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 2, 1)
  `).run(
    'Valorant Squad', 'VALORANT', 'MENA', 'VCL MENA',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200&h=600',
    'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=200&h=200',
    'Our elite Valorant division commands the tactical FPS arena in VCL MENA with disciplined shotcalling and lethal mechanical aim.',
    'PRECISION TACTICAL SHOTCALLING', '78%', '#2 MENA', 3,
    JSON.stringify(['VCL MENA Stage 1 Champions', 'EMEA Ascension Contenders 2025'])
  );
  const team2Id = t2.lastInsertRowid;

  const t3 = db.prepare(`
    INSERT INTO teams (name, game, region, league, banner, logo, bio, tagline, win_rate, global_rank, championships, achievements, display_order, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 3, 1)
  `).run(
    'PUBG Mobile Squad', 'PUBG', 'GLOBAL', 'PMGC',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=1200&h=600',
    'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=200&h=200',
    'Battle-tested survivors commanding the global PMGC standings with aggression and tactical map rotations.',
    'SURVIVAL OF THE STRONGEST', '74%', '#3 GLOBAL', 4,
    JSON.stringify(['PMGC Regional Winners 2025', 'World Cup Finalists'])
  );
  const team3Id = t3.lastInsertRowid;

  // Insert Players
  const playerStmt = db.prepare(`
    INSERT INTO players (team_id, ign, nickname, role, name, age, nationality, photo, bio, kd, mvps, tournaments, win_rate, socials, achievements, display_order, status, published)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', 1)
  `);

  playerStmt.run(team1Id, 'M7sN', 'M7sN', 'Captain / Striker', 'Meshal Al-Otaibi', '20', 'Saudi Arabia', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400&h=400', 'Premier Rocket League operative known for world-class mechanical flip-resets and clutch goals.', 1.45, 18, 14, '84%', JSON.stringify({ twitter: 'https://twitter.com/m7sn', twitch: 'https://twitch.tv/m7sn' }), JSON.stringify(['RLCS Major MVP 2025']), 1);
  playerStmt.run(team1Id, 'oKhaliD', 'oKhaliD', 'First Man', 'Khalid Qasim', '22', 'Saudi Arabia', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400&h=400', 'Legendary 1v1 rocket league icon and relentless pressure player.', 1.38, 22, 20, '80%', JSON.stringify({ twitter: 'https://twitter.com/okhalid', youtube: 'https://youtube.com/okhalid' }), JSON.stringify(['1v1 World Champion']), 2);
  playerStmt.run(team1Id, 'TRK511', 'TRK511', 'Anchor / Midfielder', 'Mohammed Al-Otaibi', '21', 'Saudi Arabia', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=400&h=400', 'Unshakable defensive pillar and master of rotations.', 1.40, 15, 16, '81%', JSON.stringify({ twitter: 'https://twitter.com/trk511' }), JSON.stringify(['Best Defender MENA 2025']), 3);

  playerStmt.run(team2Id, 'SHOOw', 'SHOOw', 'Duelist / Jett', 'Sami Al-Mansoor', '21', 'Saudi Arabia', 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=400&h=400', 'Aggressive entry duelist with pinpoint Operator precision.', 1.35, 14, 11, '79%', JSON.stringify({ twitter: 'https://twitter.com/shoow' }), JSON.stringify(['VCL MVP 2025']), 1);
  playerStmt.run(team2Id, 'NEXUS', 'NEXUS', 'IGL / Controller', 'Fahad Al-Hassan', '23', 'Kuwait', 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=400&h=400', 'Tactical mastermind leading Site executes and mid-round calls.', 1.15, 9, 15, '77%', JSON.stringify({ twitter: 'https://twitter.com/nexus' }), JSON.stringify(['Best IGL MENA']), 2);

  playerStmt.run(team3Id, 'HAWK', 'HAWK', 'Assaulter / IGL', 'Omar Al-Zahrani', '22', 'Saudi Arabia', 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=400&h=400', 'Lethal assault specialist leading battle royale rotations.', 1.50, 25, 18, '76%', JSON.stringify({ twitter: 'https://twitter.com/hawk' }), JSON.stringify(['PMGC Top Fragger']), 1);
  console.log('Seeded initial teams and players successfully.');
}

// Seed default creators if table is empty
const creatorCount: any = db.prepare('SELECT COUNT(*) as count FROM creators').get();
if (creatorCount.count === 0) {
  console.log('Seeding initial creators into database...');
  const creatorStmt = db.prepare(`
    INSERT INTO creators (
      name, alias, username, photo, cover_image, short_bio, bio, country, nationality, languages, primary_platform, category, role, joined_date, featured, verified, status, published, socials, platforms, metrics, total_reach, focus, display_order
    ) VALUES (
      @name, @alias, @username, @photo, @cover_image, @short_bio, @bio, @country, @nationality, @languages, @primary_platform, @category, @role, @joined_date, @featured, @verified, @status, 1, @socials, @platforms, @metrics, @total_reach, @focus, @display_order
    )
  `);

  const initialCreators = [
    {
      name: 'Hassan Suleiman',
      alias: 'AboFlah',
      username: 'aboflah',
      photo: 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=600&h=600',
      cover_image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
      short_bio: 'MENA gaming megastar and legendary content creator empowering communities globally.',
      bio: 'AboFlah is one of the biggest digital personalities in the Middle East and globally. Known for historic charity streams, high-energy gaming challenges, and massive community entertainment.',
      country: 'Kuwait',
      nationality: 'Kuwaiti',
      languages: JSON.stringify(['Arabic', 'English']),
      primary_platform: 'YouTube',
      category: 'Gaming & Philanthropy',
      role: 'Global Ambassador & Creator',
      joined_date: '2024-01-15',
      featured: 1,
      verified: 1,
      status: 'active',
      socials: JSON.stringify({ youtube: 'https://youtube.com/aboflah', instagram: 'https://instagram.com/aboflah', twitter: 'https://twitter.com/aboflah_1', tiktok: 'https://tiktok.com/@aboflah' }),
      platforms: JSON.stringify(['YouTube', 'Instagram', 'TikTok', 'Twitter']),
      metrics: JSON.stringify({ youtube_subscribers: '38M+', total_views: '4.5B+' }),
      total_reach: '38M+',
      focus: 'Entertainment & Charity Streams',
      display_order: 1
    },
    {
      name: 'Meshal Al-Otaibi',
      alias: 'M7sN',
      username: 'm7sn_rl',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600&h=600',
      cover_image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200&h=600',
      short_bio: 'Pro Rocket League champion and high-octane live streamer.',
      bio: 'M7sN combines top-tier professional esports mechanics with hilarious live streams, providing fans with insider competitive tactics and entertainment.',
      country: 'Saudi Arabia',
      nationality: 'Saudi',
      languages: JSON.stringify(['Arabic', 'English']),
      primary_platform: 'Twitch',
      category: 'Esports & Gameplay',
      role: 'Pro Operative & Creator',
      joined_date: '2024-03-01',
      featured: 1,
      verified: 1,
      status: 'active',
      socials: JSON.stringify({ twitch: 'https://twitch.tv/m7sn', youtube: 'https://youtube.com/m7sn', twitter: 'https://twitter.com/m7sn' }),
      platforms: JSON.stringify(['Twitch', 'YouTube', 'Twitter']),
      metrics: JSON.stringify({ twitch_followers: '500K+', youtube_subscribers: '900K+' }),
      total_reach: '1.4M+',
      focus: 'Rocket League Live Streams',
      display_order: 2
    }
  ];

  initialCreators.forEach(c => creatorStmt.run(c));
  console.log('Seeded initial creators successfully.');
}

// Seed news categories, tags, authors if empty
const partnerCount: any = db.prepare('SELECT COUNT(*) as count FROM partners').get();
if (partnerCount.count === 0) {
  console.log('Seeding initial corporate partners...');
  const partnerStmt = db.prepare('INSERT INTO partners (name, category, description, image, url, display_order, published) VALUES (?, ?, ?, ?, ?, ?, ?)');
  partnerStmt.run('GEEKAY RETAIL', 'PARENT COMPANY', 'Leading MENA Gaming Distributor', '', 'https://geekay.com', 1, 1);
  partnerStmt.run('PREDATOR GAMING', 'ENDEMIC SPONSOR', 'Official High-Performance PC Partner', '', '', 2, 1);
  partnerStmt.run('INTEL CORE', 'TECHNICAL SPONSOR', 'Elite Hardware & Processor Supplier', '', '', 3, 1);
  partnerStmt.run('RAZER GEAR', 'PERIPHERAL SPONSOR', 'Professional Grade Peripherals', '', '', 4, 1);
}

const catCount: any = db.prepare('SELECT COUNT(*) as count FROM news_categories').get();
if (catCount.count === 0) {
  const catStmt = db.prepare('INSERT INTO news_categories (name, slug, description, display_order) VALUES (?, ?, ?, ?)');
  catStmt.run('TOURNAMENT', 'tournament', 'Competitive match recaps and tournament announcements', 1);
  catStmt.run('ANNOUNCEMENT', 'announcement', 'Official Geekay Esports organizational news', 2);
  catStmt.run('ROSTER', 'roster', 'Player transfers and team roster updates', 3);
  catStmt.run('COMMUNITY', 'community', 'Fan events, creator spotlights, and community updates', 4);
  catStmt.run('BLOGS', 'blogs', 'In-depth essays, guides, and strategic insights', 5);
}

const tagCount: any = db.prepare('SELECT COUNT(*) as count FROM news_tags').get();
if (tagCount.count === 0) {
  const tagStmt = db.prepare('INSERT INTO news_tags (name, slug, description) VALUES (?, ?, ?)');
  tagStmt.run('QUALIFIERS', 'qualifiers', 'Tournament qualification news');
  tagStmt.run('CHAMPIONSHIP', 'championship', 'Championship wins and trophies');
  tagStmt.run('ROCKET LEAGUE', 'rocket-league', 'Rocket League news');
  tagStmt.run('VALORANT', 'valorant', 'Valorant news');
  tagStmt.run('PUBG', 'pubg', 'PUBG Mobile news');
}

const authorCount: any = db.prepare('SELECT COUNT(*) as count FROM news_authors').get();
if (authorCount.count === 0) {
  const authorStmt = db.prepare('INSERT INTO news_authors (name, title, bio, photo) VALUES (?, ?, ?, ?)');
  authorStmt.run('GEEKAY HQ', 'Official Media Desk', 'The official communications division of Geekay Esports.', 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=200&h=200');
  authorStmt.run('MARKETING TEAM', 'Brand & Media Division', 'Bringing esports culture and partner announcements to fans.', 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=200&h=200');
  authorStmt.run('COMPETITIVE OPERATIONS', 'Esports Ops', 'Direct insights from our head coaches and competitive directors.', 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=200&h=200');
}

// Seed default news if table is empty
const newsCount: any = db.prepare('SELECT COUNT(*) as count FROM news').get();
if (newsCount.count === 0) {
  console.log('Seeding initial news into database...');
  const initialNews = [
    {
      title: 'GEEKAY SECURES SPOT IN INTERNATIONAL CHAMPIONSHIP QUALIFIERS',
      slug: 'international-qualifications-2026',
      category: 'TOURNAMENT',
      date: 'FEB 26, 2026',
      readTime: '5 MIN READ',
      excerpt: 'After a dominant regional run, our elite squads have officially qualified for the global stage in London.',
      image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=800',
      content: 'The competitive landscape in the MENA region is evolving at an unprecedented pace. As Geekay Esports continues to dominate the regional circuits, our focus remains on operational excellence and the professional development of our operatives. This latest update follows our strategic roadmap for the 2026 season, emphasizing our commitment to the global esports ecosystem.\n\nOur performance analytics team has been working closely with the coaching staff to refine tactics and ensure peak performance across all divisions. We are seeing significant growth in our strategic initiatives, particularly in the integration of youth talent into our championship-winning rosters.\n\nLooking ahead to the upcoming international qualifiers, we have implemented a rigorous training regimen designed to address high-pressure scenarios and diverse meta-shifts. Our operatives consistently demonstrate the resilience and technical proficiency required to compete at the highest levels of global competition.\n\nGeekay Esports values the overwhelming support from our community. Every victory is shared with our fans, and we are dedicated to delivering world-class entertainment and competitive success. Stay tuned for more operational briefings as we progress through the competitive calendar.',
      author: 'GEEKAY HQ',
      tags: JSON.stringify(['QUALIFIERS', 'CHAMPIONSHIP', 'LONDON', 'MENA']),
      featured: 1,
      published: 1,
      related_team: 'Rocket League Squad',
      related_game: 'RL'
    },
    {
      title: 'OFFICIAL GEEKAY ROCKET LEAGUE DECALS NOW AVAILABLE IN-GAME',
      slug: 'rl-decals-launch-2026',
      category: 'ANNOUNCEMENT',
      date: 'FEB 24, 2026',
      readTime: '3 MIN READ',
      excerpt: 'Represent the pride of MENA on the pitch. The 2026 GEEKAY decal collection is now live in the Rocket League item shop.',
      image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200&h=800',
      content: 'We are thrilled to announce that the official Geekay Esports in-game decals are now officially live in the Rocket League Esports Shop! This marks a historic milestone for our organization and the entire Middle East and North Africa competitive gaming scene.\n\nDesigned with our signature premium dark navy and gold aesthetics, the 2026 decal allows fans and players alike to represent GEEKAY on the pitch. The bundle features both Home and Away decal variants, along with dynamic wheels and customized banners to deck out your battle-car in style.\n\nEvery purchase directly supports our Rocket League roster and competitive operations as we strive for global glory. Head over to the Rocket League Esports Shop today, grab your gear, and show the world the power of GEEKAY!',
      author: 'MARKETING TEAM',
      tags: JSON.stringify(['DECALS', 'ROCKET LEAGUE', 'SHOP', 'CUSTOMIZATION']),
      featured: 0,
      published: 1,
      related_team: 'Rocket League Squad',
      related_game: 'RL'
    },
    {
      title: 'MAJOR ROSTER UPDATE: GEEKAY REVEALS NEW TALENT FOR 2026 SEASON',
      slug: 'major-roster-announcement-2026',
      category: 'ROSTER',
      date: 'FEB 22, 2026',
      readTime: '4 MIN READ',
      excerpt: 'Strategic reinforcements have arrived. Meet the new operatives joining our championship-winning divisions.',
      image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1200&h=800',
      content: 'As we prepare to face the world on international stages, the GEEKAY command center is proud to announce strategic roster updates for our elite divisions. These roster acquisitions align perfectly with our goal of maintaining absolute regional dominance and breaking into the top tiers of international play.\n\nWe have secured some of the most mechanically gifted and tactically sound players in the EMEA region. These elite operatives have already begun training with our existing core and coaching staff, displaying incredible synergy and operational alignment.\n\n"We are building more than just a winning team; we are building a legacy," said our Competitive Director. "These new players bring a wealth of experience, hunger, and technical mastery that will elevate GEEKAY to new heights."\n\nMake sure to follow our socials to see the official player cards and upcoming roster deep-dive videos!',
      author: 'COMPETITIVE OPERATIONS',
      tags: JSON.stringify(['ROSTER', 'REINFORCEMENTS', 'SEASON 2026', 'NEW TALENT']),
      featured: 0,
      published: 1,
      related_team: 'Valorant Squad',
      related_game: 'VALORANT'
    }
  ];

  const newsStmt = db.prepare(`
    INSERT INTO news (
      title, slug, category, date, readTime, excerpt, image, content, author, tags, featured, published, related_team, related_game
    ) VALUES (
      @title, @slug, @category, @date, @readTime, @excerpt, @image, @content, @author, @tags, @featured, @published, @related_team, @related_game
    )
  `);

  initialNews.forEach(n => newsStmt.run(n));
  console.log('Seeded initial news successfully.');
}

// Seed default admin & editor if not exists
const adminExists = db.prepare('SELECT * FROM users WHERE username = ?').get('admin');
if (!adminExists) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)').run('admin', 'admin@geekay.com', hashedPassword, 'admin', 'active', new Date().toISOString());
  console.log('Default admin created: admin / admin123');
}

const editorExists = db.prepare('SELECT * FROM users WHERE username = ?').get('editor');
if (!editorExists) {
  const hashedPassword = bcrypt.hashSync('editor123', 10);
  db.prepare('INSERT INTO users (username, email, password, role, status, created_at) VALUES (?, ?, ?, ?, ?, ?)').run('editor', 'editor@geekay.com', hashedPassword, 'editor', 'active', new Date().toISOString());
  console.log('Default editor created: editor / editor123');
}

// Ensure jehada and jehade accounts have valid hashes
const jehadaUser = db.prepare('SELECT * FROM users WHERE username = ?').get('jehada');
if (jehadaUser) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('UPDATE users SET password = ?, role = ?, status = ?, email = ? WHERE username = ?').run(hashedPassword, 'admin', 'active', 'jehada@geekay.com', 'jehada');
}

const jehadeUser = db.prepare('SELECT * FROM users WHERE username = ?').get('jehade');
if (jehadeUser) {
  const hashedPassword = bcrypt.hashSync('editor123', 10);
  db.prepare('UPDATE users SET password = ?, role = ?, status = ?, email = ? WHERE username = ?').run(hashedPassword, 'editor', 'active', 'jehade@geekay.com', 'jehade');
}

// --- Multer Setup for Uploads (Memory storage for Supabase / Local fallback) ---
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }
});

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use('/uploads', express.static('public/uploads'));

// --- Security Headers Middleware ---
app.use((req, res, next) => {
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  }
  next();
});

// Security Logger
const logSecurityEvent = (eventType: string, username: string, ip: string, details: string) => {
  const ts = new Date().toISOString();
  console.log(`[SECURITY EVENT ${ts}] ${eventType} | User: ${username} | IP: ${ip} | ${details}`);
  try {
    db.prepare('INSERT INTO security_logs (event_type, username, ip_address, details, timestamp) VALUES (?, ?, ?, ?, ?)')
      .run(eventType, username || 'anonymous', ip, details, ts);
  } catch (err) {
    console.error('Failed to write security log:', err);
  }
};

// --- Rate Limiter & Brute Force Protection ---
interface RateLimitEntry {
  count: number;
  firstAttempt: number;
  lockedUntil?: number;
}
const loginAttemptsMap = new Map<string, RateLimitEntry>();

function checkRateLimit(key: string): { allowed: boolean; remainingSeconds?: number } {
  const now = Date.now();
  const entry = loginAttemptsMap.get(key);
  if (!entry) return { allowed: true };

  if (entry.lockedUntil && entry.lockedUntil > now) {
    return {
      allowed: false,
      remainingSeconds: Math.ceil((entry.lockedUntil - now) / 1000)
    };
  }

  // Reset after 15 minutes window
  if (now - entry.firstAttempt > 15 * 60 * 1000) {
    loginAttemptsMap.delete(key);
    return { allowed: true };
  }

  return { allowed: true };
}

function recordFailedAttempt(key: string) {
  const now = Date.now();
  const entry = loginAttemptsMap.get(key) || { count: 0, firstAttempt: now };
  entry.count += 1;

  if (entry.count >= 5) {
    entry.lockedUntil = now + 15 * 60 * 1000; // 15-minute lock after 5 failures
  }
  loginAttemptsMap.set(key, entry);
}

function clearFailedAttempts(key: string) {
  loginAttemptsMap.delete(key);
}

// Request Logger
app.use((req, res, next) => {
  const log = `${new Date().toISOString()} - ${req.method} ${req.url}\n`;
  if (!isVercel) {
    try { fs.appendFileSync('server.log', log); } catch (e) {}
  }
  console.log(log.trim());
  next();
});

// --- Authentication & RBAC Middlewares ---
const authenticateToken = (req: any, res: any, next: any) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Authentication required. Access denied.' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Session expired or invalid token. Please log in again.' });
  }
};

const requireRole = (...allowedRoles: string[]) => {
  return (req: any, res: any, next: any) => {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      logSecurityEvent('UNAUTHORIZED_ACCESS_ATTEMPT', req.user.username, req.ip || 'unknown', `Attempted ${req.method} ${req.originalUrl || req.url}`);
      return res.status(403).json({ error: 'Access denied: Insufficient privileges.' });
    }
    next();
  };
};

app.get('/api/debug/logs', authenticateToken, requireRole('admin'), (req, res) => {
  if (fs.existsSync('server.log')) {
    res.send(fs.readFileSync('server.log', 'utf8'));
  } else {
    res.send('No logs found');
  }
});

// --- Health Check Endpoint ---
app.get('/api/health', (req, res) => {
  try {
    db.prepare('CREATE TABLE IF NOT EXISTS _health (id INTEGER PRIMARY KEY, val TEXT)').run();
    db.prepare('INSERT INTO _health (val) VALUES (?)').run(new Date().toISOString());
    res.json({ 
      status: 'ok', 
      db: 'writable', 
      isVercel,
      dbPath,
      timestamp: new Date().toISOString() 
    });
  } catch (err: any) {
    console.error('Health check DB error:', err);
    res.json({ 
      status: 'error', 
      db: 'readonly or error', 
      error: 'Database connection issue', 
      isVercel,
      dbPath,
      timestamp: new Date().toISOString() 
    });
  }
});

// --- TWO-STEP AUTHENTICATION ENDPOINTS ---

// Step 1: Username / Email Verification
app.post(['/api/auth/check-user', '/api/auth/check-user/'], async (req: any, res: any) => {
  try {
    const { identifier } = req.body || {};
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (!identifier || typeof identifier !== 'string' || !identifier.trim()) {
      return res.status(400).json({ error: 'Please enter a username or email.' });
    }

    const cleanId = identifier.trim().toLowerCase();
    let user: any = null;

    // Check local database first
    try {
      user = db.prepare('SELECT id, username, email, status FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanId, cleanId);
    } catch (e) {}

    // Check Supabase if configured and not found locally
    if (!user && supabase) {
      try {
        const { data } = await supabase.from('users').select('id, username, email, status').or(`username.ilike.${cleanId},email.ilike.${cleanId}`).maybeSingle();
        if (data) {
          user = data;
        }
      } catch (e) {}
    }

    if (!user) {
      // Return 401 invalid credentials if user does not exist in DB
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive or suspended.' });
    }

    logSecurityEvent('LOGIN_STEP1_SUCCESS', user.username, ip, 'Passed step 1 check');
    return res.json({ success: true, username: user.username });
  } catch (err) {
    console.error('Check user error:', err);
    return res.status(401).json({ error: 'Invalid username or password.' });
  }
});

// Step 2: Password Authentication
app.post(['/api/auth/login', '/api/auth/login/'], async (req: any, res: any) => {
  try {
    const { username, password, rememberMe } = req.body || {};
    const ip = req.ip || req.socket.remoteAddress || 'unknown';

    if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please enter your username and password.' });
    }

    const cleanUser = username.trim().toLowerCase();

    let user: any = null;

    // Check local database
    try {
      user = db.prepare('SELECT * FROM users WHERE LOWER(username) = ? OR LOWER(email) = ?').get(cleanUser, cleanUser);
    } catch (e) {}

    // Check Supabase if not found locally
    if (!user && supabase) {
      try {
        const { data } = await supabase.from('users').select('*').or(`username.ilike.${cleanUser},email.ilike.${cleanUser}`).maybeSingle();
        if (data) {
          user = data;
        }
      } catch (e) {}
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    if (user.status && user.status !== 'active') {
      return res.status(403).json({ error: 'Account is inactive or suspended.' });
    }

    let isMatch = false;
    if (user.password) {
      if (user.password === password) {
        isMatch = true;
      } else {
        try {
          isMatch = bcrypt.compareSync(password, user.password);
        } catch (e) {}
      }
    }

    // If local SQLite password failed to match, check if Supabase has the updated password hash
    if (!isMatch && supabase) {
      try {
        const { data } = await supabase.from('users').select('*').or(`username.ilike.${cleanUser},email.ilike.${cleanUser}`).maybeSingle();
        if (data && data.password) {
          if (data.password === password || bcrypt.compareSync(password, data.password)) {
            isMatch = true;
            user = data;
            try {
              db.prepare('UPDATE users SET password = ? WHERE id = ?').run(data.password, user.id);
            } catch (err) {}
          }
        }
      } catch (e) {}
    }

    if (!isMatch) {
      logSecurityEvent('FAILED_LOGIN_STEP2', user.username, ip, 'Incorrect password supplied');
      return res.status(401).json({ error: 'Invalid username or password.' });
    }

    const nowIso = new Date().toISOString();
    try {
      db.prepare('UPDATE users SET last_login = ? WHERE id = ?').run(nowIso, user.id);
    } catch (e) {}

    const tokenPayload = {
      id: user.id,
      username: user.username,
      email: user.email || `${user.username}@geekay.com`,
      role: user.role || 'editor'
    };

    const expiresIn = rememberMe ? '30d' : '8h';
    const maxAgeMs = rememberMe ? 30 * 24 * 3600 * 1000 : 8 * 3600 * 1000;

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn });

    res.cookie('token', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: maxAgeMs
    });

    logSecurityEvent('LOGIN_SUCCESS', user.username, ip, `Role: ${user.role}`);

    return res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email || `${user.username}@geekay.com`,
        role: user.role || 'editor'
      }
    });
  } catch (err: any) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Login service error' });
  }
});

app.post(['/api/auth/logout', '/api/auth/logout/'], (req: any, res: any) => {
  res.clearCookie('token', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' });
  logSecurityEvent('LOGOUT', req.user?.username || 'anonymous', req.ip || 'unknown', 'Session logged out');
  res.json({ message: 'Logged out successfully' });
});

app.get('/api/auth/me', (req: any, res: any) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ user: null, error: 'Unauthenticated' });
  }

  try {
    const decoded: any = jwt.verify(token, JWT_SECRET);
    const freshUser = db.prepare('SELECT id, username, email, role, status FROM users WHERE id = ?').get(decoded.id);
    if (!freshUser || freshUser.status === 'inactive') {
      res.clearCookie('token');
      return res.status(401).json({ user: null, error: 'Account inactive or disabled' });
    }

    return res.json({
      user: {
        id: freshUser.id,
        username: freshUser.username,
        email: freshUser.email || `${freshUser.username}@geekay.com`,
        role: freshUser.role
      }
    });
  } catch (err) {
    res.clearCookie('token');
    return res.status(401).json({ user: null, error: 'Session expired' });
  }
});

  // Helper functions for safe Supabase mutation with column fallback
  const safeInsertSupabase = async (tableName: string, rawPayload: any) => {
    if (!supabase) return null;
    let payload = { ...rawPayload };

    for (let attempts = 0; attempts < 20; attempts++) {
      try {
        const { data, error } = await supabase.from(tableName).upsert([payload]).select().maybeSingle();
        if (!error && data) return data;

        if (error) {
          const msg = (error.message || '') + ' ' + (error.details || '') + ' ' + (error.hint || '');

          if (msg.includes('Could not find the table') || (msg.includes('relation') && msg.includes('does not exist'))) {
            console.warn(`Supabase table '${tableName}' not found. Skipping Supabase insert.`);
            return null;
          }

          let removedAKey = false;
          const colMatches = [
            /Could not find the '([^']+)' column/,
            /column "([^"]+)"/,
            /column '([^']+)'/,
            /Could not find the '([^']+)'/
          ];

          for (const regex of colMatches) {
            const match = msg.match(regex);
            if (match && match[1] && match[1] in payload) {
              delete payload[match[1]];
              removedAKey = true;
              break;
            }
          }

          if (!removedAKey) {
            for (const key of Object.keys(payload)) {
              if (msg.toLowerCase().includes(`'${key.toLowerCase()}'`) || msg.toLowerCase().includes(`"${key.toLowerCase()}"`) || msg.toLowerCase().includes(`column ${key.toLowerCase()}`)) {
                delete payload[key];
                removedAKey = true;
                break;
              }
            }
          }

          if (!removedAKey && (msg.includes('duplicate key') || msg.includes('primary key') || error.code === '23505')) {
            delete payload.id;
            const { data: insData, error: insErr } = await supabase.from(tableName).insert([payload]).select().maybeSingle();
            if (!insErr && insData) return insData;
            if (insErr) {
              const insMsg = (insErr.message || '') + ' ' + (insErr.details || '');
              for (const key of Object.keys(payload)) {
                if (insMsg.toLowerCase().includes(key.toLowerCase())) {
                  delete payload[key];
                  removedAKey = true;
                  break;
                }
              }
            }
          }

          if (!removedAKey) {
            console.warn(`Supabase insert info on ${tableName}:`, msg);
            break;
          }
        }
      } catch (err) {
        console.error(`Exception in safeInsertSupabase on ${tableName}:`, err);
        break;
      }
    }
    return null;
  };

  const safeUpdateSupabase = async (tableName: string, id: any, rawPayload: any) => {
    if (!supabase) return false;
    const targetId = !isNaN(Number(id)) ? Number(id) : id;
    let payload = { ...rawPayload };
    delete payload.id;

    for (let attempts = 0; attempts < 20; attempts++) {
      try {
        const { data, error } = await supabase.from(tableName).update(payload).eq('id', targetId).select();

        if (!error && data && data.length > 0) return true;

        if (!error && data && data.length === 0) {
          const inserted = await safeInsertSupabase(tableName, { id: targetId, ...rawPayload });
          return !!inserted;
        }

        if (error) {
          const msg = (error.message || '') + ' ' + (error.details || '');
          let removedAKey = false;
          for (const key of Object.keys(payload)) {
            if (msg.toLowerCase().includes(key.toLowerCase())) {
              delete payload[key];
              removedAKey = true;
              break;
            }
          }
          if (!removedAKey) break;
        }
      } catch (err) {
        break;
      }
    }
    return false;
  };

  // Helper to safely merge Supabase and SQLite records, giving strict priority to SQLite local edits
  const mergeRecords = (sqlItem: any, sbItem: any) => {
    if (sqlItem) return sqlItem;
    return sbItem || {};
  };

  function sanitizeSqliteValue(val: any): any {
    if (val === undefined || val === null) return null;
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof val === 'number' || typeof val === 'string' || typeof val === 'bigint' || Buffer.isBuffer(val)) return val;
    if (typeof val === 'object') return JSON.stringify(val);
    return String(val);
  }

  // Helper to sync Supabase rows to SQLite and purge deleted SQLite records
  const syncSupabaseToSqlite = (tableName: string, sbItems: any[]) => {
    if (!Array.isArray(sbItems)) return;
    const validCols = getValidColumns(tableName);
    if (validCols.length === 0) return;

    try {
      const sbIds = new Set(sbItems.map((item: any) => String(item?.id)).filter(Boolean));
      const sqliteRows = db.prepare(`SELECT id FROM ${tableName}`).all() as any[];

      // Delete SQLite records that no longer exist in Supabase
      for (const row of sqliteRows) {
        if (!sbIds.has(String(row.id))) {
          db.prepare(`DELETE FROM ${tableName} WHERE id = ?`).run(row.id);
        }
      }

      // Upsert Supabase records into SQLite
      for (const item of sbItems) {
        if (!item || item.id === undefined || item.id === null) continue;
        const payload: any = {};
        for (const k of Object.keys(item)) {
          if (validCols.includes(k)) {
            payload[k] = item[k];
          }
        }
        const fields = Object.keys(payload);
        if (fields.length > 0) {
          const placeholders = fields.map(() => '?').join(',');
          const values = fields.map(f => sanitizeSqliteValue(payload[f]));
          db.prepare(`INSERT OR REPLACE INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders})`).run(...values);
        }
      }
    } catch (e) {
      console.error(`Error in syncSupabaseToSqlite for ${tableName}:`, e);
    }
  };

  // --- API Routes (Generic CRUD Helper) ---
  const createCrudRoutes = (tableName: string, entityName: string) => {
    // GET list endpoint
    app.get(`/api/${tableName}`, async (req: any, res: any) => {
      try {
        if (tableName === 'users') {
          // Verify user is authenticated and is Admin
          let token = req.cookies?.token;
          if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
          }
          if (!token) return res.status(401).json({ error: 'Authentication required. Access denied.' });
          try {
            const decoded: any = jwt.verify(token, JWT_SECRET);
            if (decoded.role !== 'admin') {
              return res.status(403).json({ error: 'Access denied: Administrator privileges required.' });
            }
          } catch (e) {
            return res.status(401).json({ error: 'Session expired or invalid token.' });
          }
        }

        if (supabase) {
          try {
            const validCols = getValidColumns(tableName);
            const orderCol = validCols.includes('display_order') ? 'display_order' : 'id';
            const { data, error } = await supabase.from(tableName).select('*').order(orderCol, { ascending: true });

            if (!error && Array.isArray(data)) {
              syncSupabaseToSqlite(tableName, data);
              let itemsToReturn = data;
              if (tableName === 'users') {
                itemsToReturn = itemsToReturn.map((u: any) => {
                  const copy = { ...u };
                  delete copy.password;
                  return copy;
                });
              }
              return res.json(itemsToReturn);
            }
          } catch (sbErr) {
            console.error(`Supabase fetch sync failed for ${tableName}:`, sbErr);
          }
        }

        let sqliteItems: any[] = [];
        try {
          const validCols = getValidColumns(tableName);
          const orderClause = validCols.includes('display_order') ? 'ORDER BY display_order ASC' : 'ORDER BY id DESC';
          sqliteItems = db.prepare(`SELECT * FROM ${tableName} ${orderClause}`).all();
        } catch (e) {
          try {
            sqliteItems = db.prepare(`SELECT * FROM ${tableName}`).all();
          } catch (err2) {
            sqliteItems = [];
          }
        }

        // Never leak password field in user list!
        if (tableName === 'users' && Array.isArray(sqliteItems)) {
          sqliteItems = sqliteItems.map((u: any) => {
            const copy = { ...u };
            delete copy.password;
            return copy;
          });
        }

        res.json(sqliteItems);
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to retrieve records.' });
      }
    });

    // GET single endpoint
    app.get(`/api/${tableName}/:id`, async (req: any, res: any) => {
      try {
        if (tableName === 'users') {
          let token = req.cookies?.token;
          if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
          }
          if (!token) return res.status(401).json({ error: 'Authentication required.' });
          try {
            jwt.verify(token, JWT_SECRET);
          } catch (e) {
            return res.status(401).json({ error: 'Session expired.' });
          }
        }

        const targetId = !isNaN(Number(req.params.id)) ? Number(req.params.id) : req.params.id;
        let sqliteItem = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(targetId);
        if (!sqliteItem && supabase) {
          try {
            const { data, error } = await supabase.from(tableName).select('*').eq('id', targetId).single();
            if (!error && data) {
              syncSupabaseToSqlite(tableName, [data]);
              sqliteItem = db.prepare(`SELECT * FROM ${tableName} WHERE id = ?`).get(targetId);
            }
          } catch (e) {}
        }

        if (tableName === 'users' && sqliteItem) {
          delete sqliteItem.password;
        }

        res.json(sqliteItem || null);
      } catch (err: any) {
        res.status(500).json({ error: 'Failed to retrieve item.' });
      }
    });

    // POST create endpoint
    app.post(`/api/${tableName}`, authenticateToken, (req: any, res: any, next: any) => {
      if (tableName === 'users' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: User management requires Administrator privileges.' });
      }
      next();
    }, async (req: any, res: any) => {
      try {
        if (!req.body || Object.keys(req.body).length === 0) {
          return res.status(400).json({ error: 'Request body is empty' });
        }
        const rawPayload = { ...req.body };
        delete rawPayload.id;

        const validCols = getValidColumns(tableName).filter(c => c !== 'id');
        const payload: any = {};
        for (const k of Object.keys(rawPayload)) {
          if (validCols.length === 0 || validCols.includes(k)) {
            payload[k] = rawPayload[k];
          }
        }

        if (tableName === 'users' && payload.password && typeof payload.password === 'string') {
          if (!payload.password.startsWith('$2b$') && !payload.password.startsWith('$2a$')) {
            payload.password = bcrypt.hashSync(payload.password, 10);
            rawPayload.password = payload.password;
          }
        }

        const fields = Object.keys(payload);
        if (fields.length === 0) {
          return res.status(400).json({ error: 'No valid fields provided for insertion' });
        }
        const placeholders = fields.map(() => '?').join(',');
        const values = fields.map(f => sanitizeSqliteValue(payload[f]));
        
        const info = db.prepare(`INSERT INTO ${tableName} (${fields.join(',')}) VALUES (${placeholders})`).run(...values);
        const newId = info.lastInsertRowid;
        const insertedObj = { id: newId, ...payload };
        if (tableName === 'users') delete insertedObj.password;

        try {
          const sbRes = await safeInsertSupabase(tableName, { ...rawPayload, id: newId });
          if (sbRes && sbRes.id) {
            insertedObj.id = sbRes.id;
            try {
              if (sbRes.id !== newId) {
                db.prepare(`UPDATE ${tableName} SET id = ? WHERE id = ?`).run(sbRes.id, newId);
              }
            } catch (syncErr) {}
          }
        } catch (sbErr) {
          console.error(`Supabase sync error on POST /api/${tableName}:`, sbErr);
        }

        try {
          db.prepare('INSERT INTO activity_log (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)')
            .run(req.user.id || 1, `Created ${entityName}`, tableName, newId);
        } catch (logErr) {}

        logSecurityEvent('ENTITY_CREATED', req.user.username, req.ip, `Created ${entityName} ID ${newId}`);
        res.json(insertedObj);
      } catch (err: any) {
        console.error(`Error in POST /api/${tableName}:`, err);
        res.status(500).json({ error: 'Failed to create record.' });
      }
    });

    // PUT update endpoint
    app.put(`/api/${tableName}/:id`, authenticateToken, (req: any, res: any, next: any) => {
      if (tableName === 'users' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: User management requires Administrator privileges.' });
      }
      next();
    }, async (req: any, res: any) => {
      try {
        if (!req.body || Object.keys(req.body).length === 0) {
          return res.status(400).json({ error: 'Request body is empty' });
        }
        const rawPayload = { ...req.body };
        delete rawPayload.id;

        const targetId = !isNaN(Number(req.params.id)) ? Number(req.params.id) : req.params.id;

        const validCols = getValidColumns(tableName).filter(c => c !== 'id');
        const payload: any = {};
        for (const k of Object.keys(rawPayload)) {
          if (validCols.length === 0 || validCols.includes(k)) {
            payload[k] = rawPayload[k];
          }
        }

        if (tableName === 'users' && payload.password && typeof payload.password === 'string') {
          if (!payload.password.startsWith('$2b$') && !payload.password.startsWith('$2a$')) {
            payload.password = bcrypt.hashSync(payload.password, 10);
            rawPayload.password = payload.password;
          }
        }

        const fields = Object.keys(payload);
        if (fields.length > 0) {
          const setClause = fields.map(f => `${f} = ?`).join(',');
          const values = fields.map(f => sanitizeSqliteValue(payload[f]));
          const info = db.prepare(`UPDATE ${tableName} SET ${setClause} WHERE id = ?`).run(...values, targetId);
          if (info.changes === 0) {
            const insertFields = ['id', ...fields];
            const insertPlaceholders = insertFields.map(() => '?').join(',');
            const insertValues = [targetId, ...values];
            try {
              db.prepare(`INSERT OR REPLACE INTO ${tableName} (${insertFields.join(',')}) VALUES (${insertPlaceholders})`).run(...insertValues);
            } catch (insErr) {
              console.error(`Fallback insert error into ${tableName}:`, insErr);
            }
          }
        }

        try {
          await safeUpdateSupabase(tableName, targetId, rawPayload);
        } catch (sbErr) {
          console.error(`Supabase sync error on PUT /api/${tableName}/${targetId}:`, sbErr);
        }

        try {
          db.prepare('INSERT INTO activity_log (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)')
            .run(req.user.id || 1, `Updated ${entityName}`, tableName, req.params.id);
        } catch (logErr) {}

        logSecurityEvent('ENTITY_UPDATED', req.user.username, req.ip, `Updated ${entityName} ID ${req.params.id}`);
        if (tableName === 'users') delete payload.password;
        res.json({ success: true, id: req.params.id, ...payload });
      } catch (err: any) {
        console.error(`Error in PUT /api/${tableName}/${req.params.id}:`, err);
        res.status(500).json({ error: 'Failed to update record.' });
      }
    });

    // DELETE endpoint
    app.delete(`/api/${tableName}/:id`, authenticateToken, (req: any, res: any, next: any) => {
      if (tableName === 'users' && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'Access denied: User management requires Administrator privileges.' });
      }
      next();
    }, async (req: any, res: any) => {
      try {
        const rawId = req.params.id;
        const numId = Number(rawId);
        const targetId = !isNaN(numId) ? numId : rawId;

        try {
          db.prepare(`DELETE FROM ${tableName} WHERE id = ? OR id = ?`).run(targetId, String(rawId));
        } catch (sqlErr) {
          console.error(`SQLite delete error on ${tableName}:`, sqlErr);
        }

        if (supabase) {
          try {
            if (!isNaN(numId)) {
              await supabase.from(tableName).delete().eq('id', numId);
            }
            await supabase.from(tableName).delete().eq('id', String(rawId));
          } catch (sbErr) {
            console.error(`Supabase delete error on ${tableName}:`, sbErr);
          }
        }

        try {
          db.prepare('INSERT INTO activity_log (user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?)')
            .run(req.user.id || 1, `Deleted ${entityName}`, tableName, targetId);
        } catch (logErr) {}

        logSecurityEvent('ENTITY_DELETED', req.user.username, req.ip, `Deleted ${entityName} ID ${targetId}`);
        res.json({ success: true });
      } catch (err: any) {
        console.error(`Error deleting from ${tableName}:`, err);
        res.status(500).json({ error: 'Failed to delete record.' });
      }
    });
  };

  // Password hashing middleware for /api/users
  app.use('/api/users', (req: any, res: any, next: any) => {
    if (req.method === 'POST' && req.body && req.body.password) {
      if (!req.body.password.startsWith('$2a$') && !req.body.password.startsWith('$2b$')) {
        req.body.password = bcrypt.hashSync(req.body.password, 10);
      }
    }
    if (req.method === 'PUT' && req.body) {
      if (req.body.password && typeof req.body.password === 'string' && req.body.password.trim() !== '') {
        if (!req.body.password.startsWith('$2a$') && !req.body.password.startsWith('$2b$')) {
          req.body.password = bcrypt.hashSync(req.body.password, 10);
        }
      } else {
        delete req.body.password;
      }
    }
    next();
  });

  createCrudRoutes('leadership', 'Leadership Member');
  createCrudRoutes('partners', 'Corporate Partner');
  createCrudRoutes('teams', 'Team');
  createCrudRoutes('creators', 'Content Creator');
  createCrudRoutes('events', 'Event');
  createCrudRoutes('gallery', 'Gallery Item');
  createCrudRoutes('jobs', 'Job Opening');
  createCrudRoutes('news', 'News Article');
  createCrudRoutes('news_categories', 'News Category');
  createCrudRoutes('news_tags', 'News Tag');
  createCrudRoutes('news_authors', 'News Author');
  createCrudRoutes('users', 'User');
  createCrudRoutes('subscribers', 'Subscriber');
  createCrudRoutes('game_titles', 'Game Title');

  // --- Dedicated Settings API Endpoints ---
  app.get('/api/settings', async (req: any, res: any) => {
    try {
      const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
      const settingsObj: Record<string, any> = {};
      for (const r of rows) {
        if (r.value === 'true') settingsObj[r.key] = true;
        else if (r.value === 'false') settingsObj[r.key] = false;
        else settingsObj[r.key] = r.value;
      }

      if (supabase) {
        try {
          const { data, error } = await supabase.from('settings').select('*');
          if (!error && Array.isArray(data) && data.length > 0) {
            for (const item of data) {
              const k = item.key || item.id;
              const v = item.value;
              if (k && settingsObj[k] === undefined && v !== undefined) {
                if (v === 'true' || v === true) settingsObj[k] = true;
                else if (v === 'false' || v === false) settingsObj[k] = false;
                else settingsObj[k] = v;
              }
            }
          }
        } catch (sbErr) {
          console.warn('Supabase settings fetch warning:', sbErr);
        }
      }

      res.json(settingsObj);
    } catch (err: any) {
      console.error('Error fetching settings:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post(['/api/settings', '/api/settings/'], async (req: any, res: any) => {
    try {
      const body = req.body || {};
      const stmt = db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value');

      const entriesToSave: { key: string; value: string }[] = [];
      for (const [k, v] of Object.entries(body)) {
        const stringVal = typeof v === 'boolean' ? (v ? 'true' : 'false') : String(v ?? '');
        stmt.run(k, stringVal);
        entriesToSave.push({ key: k, value: stringVal });
      }

      if (supabase) {
        try {
          await supabase.from('settings').upsert(entriesToSave);
        } catch (sbErr) {
          console.warn('Supabase settings upsert warning:', sbErr);
        }
      }

      const rows = db.prepare('SELECT key, value FROM settings').all() as any[];
      const settingsObj: Record<string, any> = {};
      for (const r of rows) {
        if (r.value === 'true') settingsObj[r.key] = true;
        else if (r.value === 'false') settingsObj[r.key] = false;
        else settingsObj[r.key] = r.value;
      }
      res.json(settingsObj);
    } catch (err: any) {
      console.error('Error saving settings:', err);
      res.status(500).json({ error: err.message });
    }
  });

  // Alias endpoints for dash-separated URLs
  app.get('/api/game-titles', (req, res) => res.redirect('/api/game_titles'));
  app.post('/api/game-titles', (req, res) => res.redirect(307, '/api/game_titles'));
  app.delete('/api/game-titles/:id', (req, res) => res.redirect(307, `/api/game_titles/${req.params.id}`));
  
  app.delete('/api/game_titles/by-name/:name', async (req: any, res: any) => {
    try {
      const name = req.params.name;
      db.prepare('DELETE FROM game_titles WHERE LOWER(name) = LOWER(?)').run(name);
      if (supabase) {
        try {
          await supabase.from('game_titles').delete().ilike('name', name);
        } catch (sbErr) {}
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/news-categories', (req, res) => res.redirect('/api/news_categories'));
  app.post('/api/news-categories', (req, res) => res.redirect(307, '/api/news_categories'));
  app.delete('/api/news-categories/:id', (req, res) => res.redirect(307, `/api/news_categories/${req.params.id}`));
  app.get('/api/news-tags', (req, res) => res.redirect('/api/news_tags'));
  app.post('/api/news-tags', (req, res) => res.redirect(307, '/api/news_tags'));
  app.delete('/api/news-tags/:id', (req, res) => res.redirect(307, `/api/news_tags/${req.params.id}`));
  app.get('/api/news-authors', (req, res) => res.redirect('/api/news_authors'));
  app.post('/api/news-authors', (req, res) => res.redirect(307, '/api/news_authors'));
  app.delete('/api/news-authors/:id', (req, res) => res.redirect(307, `/api/news_authors/${req.params.id}`));

  // --- Specialized Player Routes ---
  app.get('/api/players', async (req: any, res: any) => {
    try {
      if (supabase) {
        try {
          const { data, error } = await supabase.from('players').select('*').order('display_order', { ascending: true });
          if (!error && Array.isArray(data)) {
            syncSupabaseToSqlite('players', data);
            return res.json(data);
          }
        } catch (sbErr) {}
      }
      let sqlitePlayers = db.prepare('SELECT * FROM players ORDER BY display_order ASC').all();
      res.json(sqlitePlayers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/players/:id', async (req: any, res: any) => {
    try {
      let sqlitePlayer = db.prepare('SELECT * FROM players WHERE id = ? OR ign = ? OR nickname = ?').get(req.params.id, req.params.id, req.params.id);
      if (!sqlitePlayer && supabase) {
        try {
          const { data, error } = await supabase.from('players').select('*').eq('id', req.params.id).single();
          if (!error && data) {
            syncSupabaseToSqlite('players', [data]);
            return res.json(data);
          }
        } catch (e) {}
      }
      res.json(sqlitePlayer || null);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/teams/:id/players', async (req: any, res: any) => {
    try {
      if (supabase) {
        try {
          const { data, error } = await supabase.from('players').select('*').eq('team_id', req.params.id).order('display_order', { ascending: true });
          if (!error && Array.isArray(data) && data.length > 0) {
            syncSupabaseToSqlite('players', data);
            return res.json(data);
          }
        } catch (e) {}
      }
      let sqlitePlayers = db.prepare('SELECT * FROM players WHERE team_id = ? ORDER BY display_order ASC').all(req.params.id);
      res.json(sqlitePlayers);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/players', async (req: any, res: any) => {
    try {
      console.log('POST /api/players payload:', JSON.stringify(req.body));
      const rawPayload = { ...req.body };
      delete rawPayload.id;

      const validCols = getValidColumns('players').filter(c => c !== 'id');
      const payload: any = {};
      for (const k of Object.keys(rawPayload)) {
        if (validCols.length === 0 || validCols.includes(k)) {
          payload[k] = rawPayload[k];
        }
      }

      const fields = Object.keys(payload);
      if (fields.length === 0) return res.status(400).json({ error: 'No valid player fields provided' });

      const placeholders = fields.map(() => '?').join(',');
      const values = fields.map(f => sanitizeSqliteValue(payload[f]));
      const info = db.prepare(`INSERT INTO players (${fields.join(',')}) VALUES (${placeholders})`).run(...values);
      const newId = info.lastInsertRowid;
      const insertedObj = { id: newId, ...payload };

      const sbRes = await safeInsertSupabase('players', { ...rawPayload, id: newId });
      if (sbRes && sbRes.id) {
        insertedObj.id = sbRes.id;
      }

      res.json(insertedObj);
    } catch (err: any) {
      console.error('Error in POST /api/players:', err);
      res.status(500).json({ error: err.message });
    }
  });

  app.put('/api/players/:id', async (req: any, res: any) => {
    try {
      console.log(`PUT /api/players/${req.params.id} payload:`, JSON.stringify(req.body));
      const rawPayload = { ...req.body };
      delete rawPayload.id;

      const targetId = !isNaN(Number(req.params.id)) ? Number(req.params.id) : req.params.id;

      const validCols = getValidColumns('players').filter(c => c !== 'id');
      const payload: any = {};
      for (const k of Object.keys(rawPayload)) {
        if (validCols.length === 0 || validCols.includes(k)) {
          payload[k] = rawPayload[k];
        }
      }

      const fields = Object.keys(payload);
      if (fields.length > 0) {
        const setClause = fields.map(f => `${f} = ?`).join(',');
        const values = fields.map(f => sanitizeSqliteValue(payload[f]));
        const info = db.prepare(`UPDATE players SET ${setClause} WHERE id = ?`).run(...values, targetId);
        if (info.changes === 0) {
          const insertFields = ['id', ...fields];
          const insertPlaceholders = insertFields.map(() => '?').join(',');
          const insertValues = [targetId, ...values];
          try {
            db.prepare(`INSERT OR REPLACE INTO players (${insertFields.join(',')}) VALUES (${insertPlaceholders})`).run(...insertValues);
          } catch (insErr) {
            console.error('Fallback insert error into players:', insErr);
          }
        }
      }

      try {
        await safeUpdateSupabase('players', targetId, rawPayload);
      } catch (e) {}

      res.json({ success: true, id: req.params.id, ...payload });
    } catch (err: any) {
      console.error(`Error in PUT /api/players/${req.params.id}:`, err);
      res.status(500).json({ error: err.message });
    }
  });

  app.delete('/api/players/:id', async (req: any, res: any) => {
    try {
      const rawId = req.params.id;
      const numId = Number(rawId);
      const targetId = !isNaN(numId) ? numId : rawId;

      try {
        db.prepare('DELETE FROM players WHERE id = ? OR id = ?').run(targetId, String(rawId));
      } catch (sqlErr) {
        console.error('SQLite delete error on players:', sqlErr);
      }

      if (supabase) {
        try {
          if (!isNaN(numId)) {
            await supabase.from('players').delete().eq('id', numId);
          }
          await supabase.from('players').delete().eq('id', String(rawId));
        } catch (sbErr) {
          console.error('Supabase delete error on players:', sbErr);
        }
      }

      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // --- Specialized News Route by Slug ---
  app.get('/api/news/slug/:slug', async (req: any, res: any) => {
    try {
      const article = db.prepare('SELECT * FROM news WHERE slug = ?').get(req.params.slug);
      if (supabase) {
        try {
          const { data, error } = await supabase.from('news').select('*').eq('slug', req.params.slug).single();
          if (!error && data) {
            return res.json(mergeRecords(article, data));
          }
        } catch (e) {}
      }
      res.json(article || null);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/stats', async (req: any, res: any) => {
    try {
      const getCount = (table: string) => {
        try {
          return db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get()?.count || 0;
        } catch (e) {
          return 0;
        }
      };

      const stats: any = {
        teams: getCount('teams'),
        players: getCount('players'),
        events: getCount('events'),
        gallery: getCount('gallery'),
        jobs: getCount('jobs'),
        news: getCount('news'),
      };

      if (supabase) {
        const tables = ['teams', 'players', 'events', 'gallery', 'jobs', 'news'];
        for (const table of tables) {
          try {
            const { count, error } = await supabase.from(table).select('*', { count: 'exact', head: true });
            if (!error && typeof count === 'number' && count > stats[table]) {
              stats[table] = count;
            }
          } catch (e) {}
        }
      }

      res.json(stats);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get('/api/activity', async (req: any, res: any) => {
    try {
      if (supabase) {
        const { data, error } = await supabase.from('activity_log').select('*, users(username)').order('timestamp', { ascending: false }).limit(50);
        if (!error && data) {
          const formatted = data.map((log: any) => ({
            ...log,
            username: log.users?.username || 'admin'
          }));
          return res.json(formatted);
        }
      }
      const logs = db.prepare(`
        SELECT activity_log.*, users.username 
        FROM activity_log 
        JOIN users ON activity_log.user_id = users.id 
        ORDER BY timestamp DESC LIMIT 50
      `).all();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post('/api/upload', (req: any, res: any, next: any) => {
    res.setHeader('Content-Type', 'application/json');
    upload.single('file')(req, res, async (err: any) => {
      if (err) {
        console.error('Multer file upload error:', err);
        return res.status(400).json({ error: err.message || 'File upload processing failed' });
      }

      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded in form payload' });
      }

      try {
        const fileExt = path.extname(req.file.originalname) || '.png';
        const fileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;

        if (supabase) {
          try {
            const { data, error } = await supabase.storage
              .from(supabaseStorageBucket)
              .upload(fileName, req.file.buffer, {
                contentType: req.file.mimetype || 'image/png',
                upsert: true
              });

            if (!error) {
              const { data: publicUrlData } = supabase.storage
                .from(supabaseStorageBucket)
                .getPublicUrl(fileName);

              if (publicUrlData?.publicUrl) {
                console.log('✅ Uploaded file to Supabase Storage:', publicUrlData.publicUrl);
                return res.json({ url: publicUrlData.publicUrl });
              }
            } else {
              console.error('Supabase storage upload error:', error);
            }
          } catch (uploadErr: any) {
            console.error('Supabase storage upload failed, falling back to local storage:', uploadErr.message);
          }
        }

        const dir = isVercel ? '/tmp/uploads' : path.join(process.cwd(), 'public/uploads');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
        const filePath = path.join(dir, fileName);
        fs.writeFileSync(filePath, req.file.buffer);
        console.log('✅ File saved successfully:', `/uploads/${fileName}`);
        return res.json({ url: `/uploads/${fileName}` });
      } catch (saveErr: any) {
        console.error('Error saving upload:', saveErr);
        return res.status(500).json({ error: saveErr.message || 'Failed to save file' });
      }
    });
  });

  // Catch-all 404 for unhandled /api routes to prevent HTML falling through
  app.all('/api/*splat', (req: any, res: any) => {
    res.setHeader('Content-Type', 'application/json');
    res.status(404).json({ error: `API route not found: ${req.method} ${req.url}` });
  });

  // --- Global Error Handler ---
  app.use((err: any, req: any, res: any, next: any) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({ error: 'Internal server error', details: err.message });
  });

  // --- Vite Middleware ---
  (async () => {
    if (process.env.NODE_ENV !== 'production' && !isVercel) {
      const vite = await createViteServer({
        server: { middlewareMode: true },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } else {
      app.use(express.static('dist'));
      app.get('{*path}', (req, res) => res.sendFile(path.resolve(__dirname, 'dist/index.html')));
    }

    if (!isVercel) {
      app.listen(3000, '0.0.0.0', () => {
        console.log('Server running on http://localhost:3000');
      });
    }
  })();

export default app;

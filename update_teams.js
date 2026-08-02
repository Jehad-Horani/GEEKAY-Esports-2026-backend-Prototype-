const fs = require('fs');

let content = fs.readFileSync('constants.tsx', 'utf8');

// Add region to existing teams
content = content.replace(/name: 'VALORANT PRO',/g, "name: 'VALORANT PRO',\n    region: 'MENA',");
content = content.replace(/name: 'DOTA 2 ELITE',/g, "name: 'DOTA 2 ELITE',\n    region: 'MENA',");
content = content.replace(/name: 'CS2 SQUAD',/g, "name: 'CS2 SQUAD',\n    region: 'MENA',");
content = content.replace(/name: 'ROCKET STRIKE',/g, "name: 'ROCKET STRIKE',\n    region: 'MENA',");

const newTeams = `
  {
    id: 'lol-1',
    name: 'LEAGUE OF LEGENDS',
    game: 'LEAGUE OF LEGENDS',
    region: 'MENA',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['Arabian League Champions', 'EMEA Masters Participant'],
    players: [],
    stats: { winRate: '70%', rank: '#1 MENA', championships: 3, globalEvents: 2, seasonRecord: '14-2' }
  },
  {
    id: 'r6-1',
    name: 'RAINBOW SIX SIEGE',
    game: 'R6 SIEGE',
    region: 'MENA',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['MENA League Winner', 'Six Invitational Contender'],
    players: [],
    stats: { winRate: '68%', rank: '#2 MENA', championships: 4, globalEvents: 3, seasonRecord: '12-4' }
  },
  {
    id: 'apex-1',
    name: 'APEX LEGENDS',
    game: 'APEX LEGENDS',
    region: 'GLOBAL',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['ALGS Split 1 Playoffs', 'EMEA Regional Finals'],
    players: [],
    stats: { winRate: '55%', rank: '#8 EMEA', championships: 1, globalEvents: 5, seasonRecord: 'N/A' }
  },
  {
    id: 'pubgm-1',
    name: 'PUBG MOBILE',
    game: 'PUBG MOBILE',
    region: 'MENA',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['PMPL Arabia Champions', 'PMGC Finalists'],
    players: [],
    stats: { winRate: '75%', rank: '#1 Arabia', championships: 5, globalEvents: 4, seasonRecord: 'N/A' }
  },
  {
    id: 'ff-1',
    name: 'FREE FIRE',
    game: 'FREE FIRE',
    region: 'MENA',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['MEA League Winners', 'World Series Participants'],
    players: [],
    stats: { winRate: '65%', rank: '#2 MEA', championships: 2, globalEvents: 2, seasonRecord: 'N/A' }
  },
  {
    id: 'ow2-1',
    name: 'OVERWATCH 2',
    game: 'OVERWATCH 2',
    region: 'EU',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['OWCS EMEA Stage 1', 'Faceit League Contenders'],
    players: [],
    stats: { winRate: '60%', rank: '#5 EU', championships: 1, globalEvents: 1, seasonRecord: '10-5' }
  },
  {
    id: 'sf6-1',
    name: 'STREET FIGHTER 6',
    game: 'STREET FIGHTER 6',
    region: 'GLOBAL',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['Capcom Cup Qualified', 'Evo Top 8'],
    players: [],
    stats: { winRate: '80%', rank: '#3 Global', championships: 6, globalEvents: 10, seasonRecord: 'N/A' }
  },
  {
    id: 't8-1',
    name: 'TEKKEN 8',
    game: 'TEKKEN 8',
    region: 'GLOBAL',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['TWT Finals Top 16', 'Combo Breaker Champion'],
    players: [],
    stats: { winRate: '72%', rank: '#6 Global', championships: 4, globalEvents: 8, seasonRecord: 'N/A' }
  },
  {
    id: 'cc-1',
    name: 'CONTENT CREATORS',
    game: 'VARIOUS',
    region: 'GLOBAL',
    isContentCreators: true,
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['10M+ Combined Followers', 'Award Winning Content'],
    players: [],
    stats: { winRate: 'N/A', rank: 'N/A', championships: 0, globalEvents: 0, seasonRecord: 'N/A' }
  }
];`;

content = content.replace(/\];\n\nexport const MOCK_EVENTS/g, ",\n" + newTeams + "\n\nexport const MOCK_EVENTS");

fs.writeFileSync('constants.tsx', content);

import { Team, Event, Job, NewsItem, Creator, Product } from './types';

export const BRAND_COLORS = {
  primary: '#081B3A', // Tactical Navy
  secondary: '#0d3365', // Performance Blue
  accent: '#FFC400',  // High-Visibility Yellow
  accentGlow: 'rgba(255, 196, 0, 0.6)',
  surface: '#0A254D',
};

export const GEEKAY_LOGO = "/assets/Gk Logo.png";

export const MOCK_TEAMS: Team[] = [
  {
    id: 'overwatch',
    name: 'Overwatch',
    game: 'Overwatch',
    region: 'EMEA',
    league: 'OWCS',
    logo: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['OWCS 2025 EMEA Stage 2 Champions', 'Saudi eLeague 2025 Major 1 Winners'],
    bio: 'A powerhouse in the EMEA Overwatch scene, featuring a mix of seasoned veterans and rising stars.',
    trophies: [
      { id: 'ow-t1', title: 'OWCS 2025 - NA Stage 2', year: '2025', rank: '1ST' },
      { id: 'ow-t2', title: 'Saudi eLeague 2023 Season 2', year: '2023', rank: '2ND' },
      { id: 'ow-t3', title: 'OWCS 2025 - NA Stage 3', year: '2025', rank: '3RD' },
      { id: 'ow-t4', title: 'OWCS 2026 - EMEA Stage 1', year: '2026', rank: '3RD' },
    ],
    stats: {
      winRate: '82%',
      rank: '#1 EMEA',
      championships: 6,
      globalEvents: 10,
      seasonRecord: '28-6'
    },
    players: [
      {
        id: 'ow-ziyad',
        nickname: 'ZIYAD',
        name: 'ZIYAD',
        role: 'Tank',
        photo: '/assets/ZIYAD.png',
        bio: 'ZIYAD is a community favourite tank player within the EMEA OWCS scene. From winning OWTV Best Tank of the Year awards at the OWTV Community Awards Show 2025, to Best Rising Player of the Year at the SEF Awards 2025, he has a lot of support across many fans.',
        stats: { kd: 1.25, mvps: 15, tournaments: 20, winRate: '75%' },
        achievements: [
          { year: '2025', title: 'Overwatch Champions Series 2025 - EMEA Stage 2 (1st)' },
          { year: '2025', title: 'Overwatch Champions Series 2025 Midseason Championship (2nd)' },
          { year: '2025', title: 'Overwatch Champions Series 2025 World Finals (2nd)' },
          { year: '2025', title: 'Saudi eLeague 2025 - Major 1 (1st)' }
        ],
        socials: { 
          twitter: '4,031', 
          instagram: '1,648', 
          twitch: '5,600', 
          tiktok: '2,014' 
        }
      },
      {
        id: 'ow-lbbd7',
        nickname: 'LBBD7',
        name: 'LBBD7',
        role: 'Hitscan DPS',
        photo: '/assets/LBBD7.png',
        bio: 'LBBD7 is an incredibly consistent and skilled hitscan player. He was the recipient of the Saudi Esports Federation Awards Rising Player of the Year in 2023. Most notably LBBD7 brought Saudi Arabia to victory at the 2023 Overwatch World Cup.',
        stats: { kd: 1.45, mvps: 22, tournaments: 28, winRate: '80%' },
        achievements: [
          { year: '2023', title: 'Overwatch World Cup 2023 (1st)' },
          { year: '2023', title: 'Overwatch Contenders Summer Series: Europe (1st)' },
          { year: '2023', title: 'Overwatch Contenders Spring Series: Europe (1st)' },
          { year: '2025', title: 'Overwatch Champions Series 2025 - EMEA Stage 2 (1st)' }
        ],
        socials: { 
          twitter: '18,093', 
          instagram: '13,315', 
          twitch: '29,200', 
          youtube: '5,920', 
          tiktok: '16,300' 
        }
      },
      {
        id: 'ow-alphayi',
        nickname: 'AlphaYi',
        name: 'AlphaYi',
        role: 'Flex DPS',
        photo: '/assets/AlphaYi.png',
        bio: "When clutch moments are needed, AlphaYi is the one to call. He has been playing in tier 1 Overwatch since 2022, starting with Hangzhou Spark, placing 4th in his first OWL season.",
        stats: { kd: 1.35, mvps: 18, tournaments: 32, winRate: '72%' },
        achievements: [
          { year: '2021', title: 'Overwatch Contenders Season 2: Regular Season 1 (1st)' },
          { year: '2021', title: 'Overwatch Contenders Season 2: Regular Season 2 (1st)' },
          { year: '2022', title: 'Overwatch League 2022 - Countdown Cup (1st)' },
          { year: '2025', title: 'Overwatch Champions Series 2025 - Korea Stage 1 (2nd)' }
        ],
        socials: { 
          twitter: '4,813', 
          instagram: '1,128', 
          twitch: '9,700', 
          youtube: '1,020' 
        }
      },
      {
        id: 'ow-finn',
        nickname: 'FiNN',
        name: 'FiNN',
        role: 'Flex Support',
        photo: '/assets/FiNN.png',
        bio: 'FiNN is a well-known and supported player not just for his flex support gameplay, but also his streaming career. FiNN currently has 37k followers on Twitch!',
        stats: { kd: 1.15, mvps: 12, tournaments: 35, winRate: '78%' },
        achievements: [
          { year: '2022', title: 'Overwatch League 2022 - Midseason Madness (2nd)' },
          { year: '2022', title: 'Overwatch League 2022 - Summer Showdown (2nd)' },
          { year: '2022', title: 'Overwatch League 2022 - Regular Season (2nd)' },
          { year: '2022', title: 'Overwatch League 2022 - Playoffs (2nd)' }
        ],
        socials: { 
          twitter: '30,023', 
          instagram: '6,694', 
          twitch: '37,000', 
          youtube: '35,900' 
        }
      },
      {
        id: 'ow-haku',
        nickname: 'Haku',
        name: 'Haku',
        role: 'Support',
        photo: '/assets/Haku.png',
        bio: 'Haku is the oldest player on the Geekay roster, holding lots of experience within Overwatch Esports. He has been playing within Saudi E League since 2021 and has consistently placed top 3.',
        stats: { kd: 1.05, mvps: 8, tournaments: 42, winRate: '68%' },
        achievements: [
          { year: '2023', title: 'Overwatch Contenders Spring Series: Europe (1st)' },
          { year: '2023', title: 'Overwatch World Cup 2023 (1st)' },
          { year: '2025', title: 'Saudi eLeague 2025 - Major 1 (1st)' },
          { year: '2023', title: 'Saudi eLeague 2023: Season 1 (1st)' }
        ],
        socials: { 
          twitter: '9,921', 
          instagram: '5,852', 
          twitch: '12,700' 
        }
      },
      {
        id: 'ow-aid',
        nickname: 'Aid',
        name: 'Aid',
        role: 'Coach',
        photo: '/assets/Aid.png',
        bio: 'Aid began his OWL career in 2019 as a main support player for Toronto Defiant, eventually pivoting to the coach role with Dallas Fuel- where he won the 2022 OWL season!',
        stats: { kd: 0, mvps: 0, tournaments: 50, winRate: '60%' },
        achievements: [
          { year: '2022', title: 'Overwatch League 2022 - Summer Showdown (1st)' },
          { year: '2022', title: 'Overwatch League 2022 - Regular Season (1st)' },
          { year: '2022', title: 'Overwatch League 2022 - Playoffs (1st)' },
          { year: '2025', title: 'Overwatch Champions Series 2025 Midseason Championship (1st)' }
        ],
        socials: { 
          twitter: '4,240', 
          twitch: '1,100' 
        }
      }
    ]
  },
  {
    id: 'easfc',
    name: 'EA SPORTS FC',
    game: 'EA SPORTS FC',
    region: 'MENA',
    logo: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['Major Quarter-Finalist', 'Pro League Champions'],
    bio: 'Pure precision and tactical mastery on the pitch. Our EA SPORTS FC squad is built on the foundation of elite skill and clinical finishing.',
    trophies: [
      { id: 'fc-t1', title: 'FIFAe Club Series 2022 - MEA: Playoffs', year: '2022', rank: '2ND' },
      { id: 'fc-t2', title: 'eSPL 2026', year: '2026', rank: '3RD' },
    ],
    stats: {
      winRate: '68%',
      rank: '#4 MENA',
      championships: 5,
      globalEvents: 20,
      seasonRecord: '15-5'
    },
    players: [
      {
        id: 'fc-abdulrahman',
        nickname: 'Abdulrahman Al-Tmimi',
        name: 'Abdulrahman Al-Tmimi',
        role: 'Pro Player',
        photo: '/assets/Abdulrahman Al-Tmimi.jpg',
        bio: 'A top-tier competitor in the EA SPORTS FC scene, known for strategic gameplay and consistency.',
        stats: { kd: 0, mvps: 15, tournaments: 35, winRate: '60%' },
        socials: { twitter: '#' }
      },
      {
        id: 'fc-doo7i',
        nickname: 'doo7i',
        name: 'doo7i',
        role: 'Pro Player',
        photo: '/assets/doo7i.png',
        bio: 'Flashy and creative, doo7i is a player who can turn any match in his favor with a single moment of brilliance.',
        stats: { kd: 0, mvps: 8, tournaments: 30, winRate: '58%' },
        socials: { twitch: '#' }
      },
      {
        id: 'fc-lebrady',
        nickname: 'Lebrady_12',
        name: 'Lebrady_12',
        role: 'Pro Player',
        photo: '/assets/Lebrady_12.png',
        bio: 'A veteran tactical mind in virtual football, Lebrady_12 leads with experience and composure.',
        stats: { kd: 0, mvps: 4, tournaments: 50, winRate: '65%' },
        socials: { twitter: '#' }
      }
    ]
  },
  {
    id: 'crossfire',
    name: 'CROSSFIRE',
    game: 'CROSSFIRE',
    region: 'Vietnam',
    league: 'CFVL',
    logo: 'https://images.unsplash.com/photo-1614027164847-1b280143eb9c?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['CFPL 2024 Season 1 Champions', 'CFS 2025 Regional Finals Winners'],
    bio: 'A dominant force in the Crossfire scene, representing Geekay on the international stage with unmatched precision.',
    stats: {
      winRate: '75%',
      rank: '#3 Global',
      championships: 8,
      globalEvents: 12,
      seasonRecord: '24-4'
    },
    players: [
      {
        id: 'cf-kimbum',
        nickname: 'KimBum',
        name: 'Nguyễn “KIMBUM” Công Tuấn Thành',
        role: 'Pro Player',
        photo: '/assets/KimBum.png',
        bio: 'Nguyễn “KIMBUM” Công Tuấn Thành may have started playing competitively only in 2024, but he already has two World Championship appearances.',
        stats: { kd: 1.35, mvps: 12, tournaments: 15, winRate: '68%' },
        achievements: [
          { year: '2024', title: 'CrossFire Vietnam Professional League 2024 Season 1 (1st)' },
          { year: '2024', title: 'CrossFire Stars 2024 Vietnam Regional Finals (2nd)' },
          { year: '2025', title: 'CrossFire Vietnam Professional League 2025 Season 2 (2nd)' },
          { year: '2025', title: 'CrossFire Stars 2025 Vietnam Regional Finals (1st)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'cf-boqcute',
        nickname: 'BOQCUTE',
        name: 'BOQCUTE',
        role: 'Pro Player',
        photo: '/assets/BOQCUTE.png',
        bio: 'Highly mechanical player known for consistent performance in high-pressure regional finals.',
        stats: { kd: 1.25, mvps: 8, tournaments: 12, winRate: '65%' },
        achievements: [
          { year: '2024', title: 'CrossFire Stars 2024 Vietnam Regional Finals (3rd)' },
          { year: '2025', title: 'CrossFire Vietnam Professional League 2025 Season 1 (2nd)' },
          { year: '2025', title: 'CrossFire Vietnam Professional League 2025 Season 2 (2nd)' },
          { year: '2025', title: 'CrossFire Stars 2025 Vietnam Regional Finals (1st)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'cf-datchip',
        nickname: 'Datchip',
        name: 'Datchip',
        role: 'Pro Player',
        photo: '/assets/Datchip.png',
        bio: 'A core member of the CrossFire roster with a history of success in Vietnam professional leagues.',
        stats: { kd: 1.18, mvps: 6, tournaments: 12, winRate: '62%' },
        achievements: [
          { year: '2024', title: 'CrossFire Stars 2024 Vietnam Regional Finals (3rd)' },
          { year: '2025', title: 'CrossFire Vietnam Professional League 2025 Season 1 (2nd)' },
          { year: '2025', title: 'CrossFire Vietnam Professional League 2025 Season 2 (2nd)' },
          { year: '2025', title: 'CrossFire Stars 2025 Vietnam Regional Finals (1st)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'cf-piem',
        nickname: 'PIEM',
        name: 'PIEM',
        role: 'Pro Player',
        photo: '/assets/PIEM.png',
        bio: 'Experienced strategist with multiple top-3 finishes in the Vietnam Professional League.',
        stats: { kd: 1.12, mvps: 5, tournaments: 14, winRate: '60%' },
        achievements: [
          { year: '2023', title: 'CrossFire Vietnam Professional League 2023 Season 2 (3rd)' },
          { year: '2024', title: 'CrossFire Vietnam Professional League 2024 Season 2 (2nd)' },
          { year: '2024', title: 'CrossFire Stars 2024 Vietnam Regional Finals (1st)' },
          { year: '2025', title: 'CrossFire Vietnam Professional League 2025 Season 1 (3rd)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'cf-ductoan',
        nickname: 'Ductoan',
        name: 'Ductoan',
        role: 'Pro Player',
        photo: '/assets/Ductoan.png',
        bio: 'A proven champion in the CrossFire scene, known for his impact in major regional finals.',
        stats: { kd: 1.28, mvps: 10, tournaments: 16, winRate: '66%' },
        achievements: [
          { year: '2023', title: 'CrossFire Vietnam Professional League 2023 Season 2 (1st)' },
          { year: '2024', title: 'CrossFire Vietnam Professional League 2024 Season 2 (2nd)' },
          { year: '2024', title: 'CrossFire Stars 2024 Vietnam Regional Finals (1st)' },
          { year: '2025', title: 'CrossFire Vietnam Professional League 2025 Season 2 (1st)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'cf-poo',
        nickname: 'Poo',
        name: 'Poo',
        role: 'Pro Player',
        photo: '/assets/Poo.png',
        bio: 'Dynamic player with strong results in both regional finals and professional leagues.',
        stats: { kd: 1.15, mvps: 4, tournaments: 12, winRate: '61%' },
        achievements: [
          { year: '2024', title: 'CrossFire Stars 2024 Vietnam Regional Finals (3rd)' },
          { year: '2025', title: 'CrossFire Vietnam Professional League 2025 Season 1 (2nd)' },
          { year: '2025', title: 'CrossFire Vietnam Professional League 2025 Season 2 (2nd)' }
        ],
        socials: { twitter: '#' }
      }
    ]
  },
  {
    id: 'rocket-league',
    name: 'Rocket League',
    game: 'Rocket League',
    region: 'Europe',
    league: 'RLCS',
    logo: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['RLCS Fall Split Major Champions', 'Raleigh Major Finalists'],
    bio: 'Mechanical gods on wheels. Our Rocket League team is known for insane aerials and unbeatable defensive rotation.',
    trophies: [
      { id: 'rl-t1', title: 'RLCS 2025 - Birmingham Major: EU Open 3', year: '2025', rank: '1ST' },
      { id: 'rl-t2', title: 'RLCS 2026 - Boston Major: EU Open 2', year: '2026', rank: '2ND' },
      { id: 'rl-t3', title: 'Esports World Cup 2025', year: '2025', rank: '2ND' },
      { id: 'rl-t4', title: 'Offseason Open - 3v3: MENA', year: '2025', rank: '2ND' },
      { id: 'rl-t5', title: 'Saudi eLeague 2024 - Major 4 Final', year: '2024', rank: '3RD' },
    ],
    stats: {
      winRate: '85%',
      rank: '#1 Global',
      championships: 10,
      globalEvents: 12,
      seasonRecord: '20-4'
    },
    players: [
      {
        id: 'rl-jack',
        nickname: 'ApparentlyJack',
        name: 'Jack "ApparentlyJack" Benton',
        role: 'Striker',
        photo: '/assets/Apparently.png',
        bio: 'Jack “ApparentlyJack” Benton is an English professional Rocket League player and content creator. Jack is also a RLCS 2022-23 Fall Major Champion, and was named the Fall Major MVP of that tournament.',
        stats: { kd: 2.5, mvps: 25, tournaments: 15, winRate: '85%' },
        achievements: [
          { year: '2022', title: 'RLCS 2022-23 - Fall Split Major (1st)' },
          { year: '2023', title: 'RLCS 2022-23 - Winter Open NA (1st)' },
          { year: '2024', title: 'RLCS 2024 - Major 2: NA Qualifier 4 (1st)' },
          { year: '2025', title: 'RLCS 2025 - Raleigh Major (2nd)' }
        ],
        socials: { 
          twitter: '96,249', 
          instagram: '14,089', 
          twitch: '191,000', 
          youtube: '271,000', 
          tiktok: '21,800' 
        }
      },
      {
        id: 'rl-joyo',
        nickname: 'Joyo',
        name: 'Joseph "Joyo" Young',
        role: 'Midfield',
        photo: '/assets/Joyo.png',
        bio: 'Joseph “Joyo” Young is a freestyler turned Rocket League pro from England. His camera hijinks and insane mechanics quickly turned him into a superstar. Joyo was named the Spring Major MVP in the RLCS 2021-22 season.',
        stats: { kd: 1.8, mvps: 18, tournaments: 20, winRate: '80%' },
        achievements: [
          { year: '2022', title: 'RLCS 2021-22 - Spring Split Major (1st)' },
          { year: '2022', title: 'RLCS 2021-22 - Europe Regional Event 3 (1st)' },
          { year: '2022', title: 'RLCS 2022-23 - Fall Split Major (2nd)' },
          { year: '2025', title: 'Esports World Cup 2025 featuring Rocket League (2nd)' }
        ],
        socials: { 
          twitter: '59,311', 
          twitch: '25,000', 
          youtube: '13,800' 
        }
      },
      {
        id: 'rl-tempoh',
        nickname: 'TempoH',
        name: 'Christian Fabricius "TempoH" Mortensen',
        role: 'Defense',
        photo: '/assets/TempoH.png',
        bio: 'Christian Fabricius “TempoH” Mortensen is a Danish professional Rocket League player. With his dazzling mechanics and brilliant off the ball plays, TempoH got the call from Geekay Esports during the trade window of the 2026 season.',
        stats: { kd: 1.5, mvps: 10, tournaments: 12, winRate: '78%' },
        achievements: [
          { year: '2025', title: 'Champions Road 2025 - 3v3 Open: EU (1st)' },
          { year: '2026', title: 'RLCS 2026 - Boston Major: EU Open 3 (3rd)' },
          { year: '2025', title: 'Coupe de France Slash 2025 - Finals (3rd)' },
          { year: '2025', title: 'Champions Road 2025 - 3v3 Open: Europe (1st)' }
        ],
        socials: { 
          twitter: '3,569', 
          twitch: '3,900', 
          youtube: '6,190', 
          tiktok: '8,652' 
        }
      },
      {
        id: 'rl-ali',
        nickname: 'Ali',
        name: 'Ali',
        role: 'Pro Player',
        photo: '/assets/ali.png',
        bio: 'Ali is a rising star in the Rocket League scene, known for his incredible mechanical skill and tactical awareness.',
        stats: { kd: 1.25, mvps: 5, tournaments: 10, winRate: '72%' },
        socials: { 
          twitter: '1,076', 
          instagram: '1,080' 
        }
      }
    ]
  },
  {
    id: 'r6-siege-x',
    name: 'Rainbow Six Siege X',
    game: 'Rainbow Six Siege',
    region: 'EMEA',
    league: 'EML',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['Saudi eLeague 2025 Major 2 Champions', 'R6 Central Combine 2025 Winners'],
    bio: 'An elite Rainbow Six Siege squad with a history of dominance in international and regional tournaments.',
    trophies: [
      { id: 'r6-t1', title: 'Saudi eLeagues Season 2023 - Stage 2', year: '2023', rank: '1ST' },
      { id: 'r6-t2', title: 'MENA League 2024 - Stage 1', year: '2024', rank: '1ST' },
      { id: 'r6-t3', title: 'MENA League 2023 - Stage 2', year: '2023', rank: '1ST' },
      { id: 'r6-t4', title: 'Saudi eLeague 2025 - Major 2', year: '2025', rank: '1ST' },
      { id: 'r6-t5', title: 'R6 North Rainbow Rumble 2025 - August', year: '2025', rank: '1ST' },
      { id: 'r6-t6', title: 'R6 South Breach 2025', year: '2025', rank: '1ST' },
      { id: 'r6-t7', title: 'R6 Central Combine 2025', year: '2025', rank: '1ST' },
      { id: 'r6-t8', title: 'Saudi eLeague 2024 - Major 3', year: '2024', rank: '1ST' },
      { id: 'r6-t9', title: 'TEC Invitational', year: '2024', rank: '1ST' },
      { id: 'r6-t10', title: 'MENA Community Face-Off Series Season 1', year: '2023', rank: '1ST' },
      { id: 'r6-t11', title: 'Die Meisterschaft 2025: Europe', year: '2025', rank: '1ST' },
      { id: 'r6-t12', title: 'Saudi eLeagues Season 2022 - Stage 2', year: '2022', rank: '2ND' },
      { id: 'r6-t13', title: 'Saudi eLeague 2025 - Championship', year: '2025', rank: '2ND' },
      { id: 'r6-t14', title: 'Saudi eLeague 2024 - Championship', year: '2024', rank: '2ND' },
      { id: 'r6-t15', title: 'MENA League 2024 - Stage 2', year: '2024', rank: '2ND' },
      { id: 'r6-t16', title: 'MENA League 2023 - Stage 1', year: '2023', rank: '2ND' },
      { id: 'r6-t17', title: 'Saudi eLeague 2025 - Major 1', year: '2025', rank: '2ND' },
      { id: 'r6-t18', title: 'VOV Super cup - R6S', year: '2023', rank: '2ND' },
      { id: 'r6-t19', title: 'Saudi eLeague 2024 - Major 1', year: '2024', rank: '2ND' },
    ],
    stats: {
      winRate: '78%',
      rank: '#3 Global',
      championships: 6,
      globalEvents: 10,
      seasonRecord: '22-4'
    },
    players: [
      {
        id: 'r6-ask',
        nickname: 'AsK',
        name: 'AsK',
        role: 'IGL',
        photo: '/assets/AsK.png',
        bio: 'AsK is a Brazilian player with the role of IGL for Geekay. He has a range of success across the R6 title, from regional matches to international tournaments.',
        stats: { kd: 1.25, mvps: 15, tournaments: 45, winRate: '68%' },
        achievements: [
          { year: '2021', title: 'Brasileirão 2021 - Finals (1st)' },
          { year: '2022', title: 'Copa Elite Six - Season 2022: Stage 1 (1st)' },
          { year: '2022', title: 'Six Jönköping Major 2022 (1st)' },
          { year: '2022', title: 'Brasileirão 2022 - Finals (1st)' }
        ],
        socials: { 
          twitter: '17,609', 
          instagram: '8,233', 
          twitch: '16,900', 
          youtube: '5,680' 
        }
      },
      {
        id: 'r6-hungry',
        nickname: 'Hungry',
        name: 'Hungry',
        role: 'Pro Player',
        photo: '/assets/Hungry.png',
        bio: 'Hungry is a player with tons of experience behind him. Hailing from Germany, he is decorated with many tournament wins, with his list of achievements dating back to 2017.',
        stats: { kd: 1.15, mvps: 18, tournaments: 55, winRate: '64%' },
        achievements: [
          { year: '2018', title: 'DreamHack Winter 2018 (2nd)' },
          { year: '2021', title: 'European League 2021 - Stage 2 (2nd)' },
          { year: '2025', title: 'R6 Central Combine 2025 (1st)' },
          { year: '2025', title: 'R6 North Rainbow Rumble 2025 - August (1st)' }
        ],
        socials: { 
          twitter: '24,822', 
          instagram: '3,843', 
          twitch: '16,200', 
          youtube: '1,170' 
        }
      },
      {
        id: 'r6-pacbull',
        nickname: 'Pacbull',
        name: 'Pacbull',
        role: 'Support',
        photo: '/assets/Pacbull.png',
        bio: 'Pacbull is from Northern Ireland, and represents Geekay within the support role in R6. He has a wide range of experience from regional to tier 1 large scale events.',
        stats: { kd: 1.05, mvps: 10, tournaments: 40, winRate: '70%' },
        achievements: [
          { year: '2025', title: 'Saudi eLeague 2025 - Major 2 (1st)' },
          { year: '2025', title: 'R6 Central Combine 2025 (1st)' },
          { year: '2025', title: 'Saudi eLeague 2025 - Championship (2nd)' },
          { year: '2025', title: 'R6 South Breach 2025 (1st)' }
        ],
        socials: { 
          twitter: '5,097', 
          twitch: '3,800', 
          youtube: '6,170', 
          tiktok: '67,700' 
        }
      },
      {
        id: 'r6-rexhun',
        nickname: 'Rexhun999',
        name: 'Rexhun999',
        role: 'Entry Fragger',
        photo: '/assets/Rexhun.png',
        bio: 'Rexhun999 is the entry fragger for Geekay’s R6 team, also with a long history. During the R6 North Rainbow Rumble 2025 - August, he was voted as Tournament MVP.',
        stats: { kd: 1.38, mvps: 22, tournaments: 32, winRate: '62%' },
        achievements: [
          { year: '2025', title: 'Saudi eLeague 2025 - Major 2 (1st)' },
          { year: '2025', title: 'R6 North Rainbow Rumble 2024-2025 (1st)' },
          { year: '2025', title: 'R6 Central Combine 2025 (1st)' },
          { year: '2025', title: 'R6 North Rainbow Rumble 2025 - August (1st)' }
        ],
        socials: { 
          twitter: '1,324', 
          twitch: '2,500', 
          youtube: '197' 
        }
      },
      {
        id: 'r6-sarks',
        nickname: 'Sarks',
        name: 'Sarks',
        role: 'Flex',
        photo: '/assets/Sarks.png',
        bio: 'Sarks is an Italian R6 player, and Geekay’s current flex. His wide range of skills allow him to be a consistent and reliable flex player.',
        stats: { kd: 1.12, mvps: 5, tournaments: 32, winRate: '62%' },
        achievements: [
          { year: '2024', title: 'R6 Central Combine 2024 (2nd)' }
        ],
        socials: { 
          twitter: '1,920', 
          twitch: '6,000', 
          youtube: '2,770' 
        }
      },
      {
        id: 'r6-murarz',
        nickname: 'Murarz',
        name: 'Murarz',
        role: 'Coach',
        photo: '/assets/Murarz.png',
        bio: 'Murarz is a Polish R6 coach, playing a large role in the Geekay’s success in tournaments. His favourite polish food is Pierogi Ruskie!',
        stats: { kd: 0, mvps: 0, tournaments: 30, winRate: '60%' },
        achievements: [
          { year: '2025', title: 'Saudi eLeague 2025 - Major 2 (1st)' },
          { year: '2025', title: 'R6 Central Combine 2025 (1st)' },
          { year: '2025', title: 'Saudi eLeague 2025 - Championship (2nd)' },
          { year: '2024', title: 'Saudi eLeague 2024 - Championship (2nd)' }
        ],
        socials: { twitter: '678' }
      },
      {
        id: 'r6-sheppard',
        nickname: 'ShepparD',
        name: 'ShepparD',
        role: 'Coach',
        photo: '/assets/ShepparD.png',
        bio: 'ShepparD is the other current R6 coach for Geekay, with great results stretching back to 2017. He is consistently intelligent with his strategy.',
        stats: { kd: 0, mvps: 0, tournaments: 45, winRate: '70%' },
        achievements: [
          { year: '2019', title: 'Six Major Raleigh 2019 (1st)' },
          { year: '2019', title: 'Pro League Season 9 - Finals (1st)' },
          { year: '2020', title: 'Six November 2020 Major - Europe (1st)' },
          { year: '2022', title: 'Six Invitational 2022 (2nd)' }
        ],
        socials: { 
          twitter: '16,095', 
          instagram: '1,952', 
          twitch: '1,700', 
          telegram: '590' 
        }
      }
    ]
  },
  {
    id: 'fortnite',
    name: 'Fortnite',
    game: 'Fortnite',
    region: 'MENA',
    league: 'FNCS',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['FNCS 2024 Major 2 Winners', 'FNCS 2025 Major 1 & 2 Winners'],
    bio: 'Commanding the Fortnite scene in the MENA region with unparalleled building and combat skills.',
    stats: { winRate: '75%', rank: '#1 MENA', championships: 5, globalEvents: 10, seasonRecord: '24-2' },
    players: [
      {
        id: 'fn-adapter',
        nickname: 'Adapter',
        name: 'Abdulaziz "Adapter" Algarzae',
        role: 'Pro Player',
        photo: '/assets/Adapter.png',
        bio: 'Abdulaziz "Adapter" Algarzae is a Saudi Arabian professional Fortnite player. He is one of the most established names in the Saudi and wider MENA Fortnite scene.',
        stats: { kd: 1.45, mvps: 15, tournaments: 35, winRate: '65%' },
        achievements: [
          { year: '2024', title: 'FNCS 2024 - Major 2: ME Grand Finals (1st)' },
          { year: '2025', title: 'Virtuocity Battleground Qatar (1st)' },
          { year: '2025', title: 'FNCS 2025 - Major 3: ME Grand Finals (1st)' },
          { year: '2025', title: 'Games of the Future 2025 (3rd)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'fn-fks',
        nickname: 'FKS',
        name: 'Faisal "FKS" Khalid Alsanea',
        role: 'Pro Player',
        photo: '/assets/FKS.png',
        bio: 'Faisal "FKS" Khalid Alsanea is a Saudi Arabian professional Fortnite player. He is regarded as one of the most reliable competitive Fortnite players in the region.',
        stats: { kd: 1.38, mvps: 8, tournaments: 30, winRate: '68%' },
        achievements: [
          { year: '2022', title: 'FNCS: Chapter 3 Season 1 - ME Grand Finals (1st)' },
          { year: '2024', title: 'FNCS 2024 - Major 2: ME Grand Finals (1st)' },
          { year: '2025', title: 'FNCS 2025 - Major 1: ME Grand Finals (1st)' },
          { year: '2025', title: 'FNCS 2025 - Major 2: ME Grand Finals (1st)' }
        ],
        socials: { twitch: '#' }
      },
      {
        id: 'fn-kakarot',
        nickname: 'Kakarot',
        name: 'Abdulaziz "Kakarot"',
        role: 'Game Manager',
        photo: '/assets/Kakarot.png',
        bio: "Abdulaziz “Kakarot” is a Saudi Arabian Fortnite veteran turned Game Manager for Geekay Esports. He brings firsthand competitive experience to his managerial role.",
        stats: { kd: 0, mvps: 0, tournaments: 25, winRate: '60%' },
        achievements: [
          { year: '2024', title: 'Shong Invitational (3rd)' }
        ],
        socials: { twitter: '#' }
      }
    ]
  },
  {
    id: 'fortniteEU',
    name: 'Fortnite EU',
    game: 'Fortnite',
    region: 'EU',
    league: 'FNCS',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['FNCS 2024 Major 2 Winners', 'FNCS 2025 Major 1 & 2 Winners'],
    bio: 'Commanding the Fortnite scene in the MENA region with unparalleled building and combat skills.',
    stats: { winRate: '75%', rank: '#1 MENA', championships: 5, globalEvents: 10, seasonRecord: '24-2' },
    players: [
      {
        id: 'fn-Japko',
        nickname: 'Japko',
        name: 'Abdulaziz "Japko" Algarzae',
        role: 'Pro Player',
        photo: '/assets/Japko.png',
        bio: 'Abdulaziz "Japko" Algarzae is a Saudi Arabian professional Fortnite player. He is one of the most established names in the Saudi and wider MENA Fortnite scene.',
        stats: { kd: 1.45, mvps: 15, tournaments: 35, winRate: '65%' },
        achievements: [
          { year: '2024', title: 'FNCS 2024 - Major 2: ME Grand Finals (1st)' },
          { year: '2025', title: 'Virtuocity Battleground Qatar (1st)' },
          { year: '2025', title: 'FNCS 2025 - Major 3: ME Grand Finals (1st)' },
          { year: '2025', title: 'Games of the Future 2025 (3rd)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'fn-panzer',
        nickname: 'panzer',
        name: 'Faisal "panzer" Khalid Alsanea',
        role: 'Pro Player',
        photo: '/assets/panzer.png',
        bio: 'Faisal "panzer" Khalid Alsanea is a Saudi Arabian professional Fortnite player. He is regarded as one of the most reliable competitive Fortnite players in the region.',
        stats: { kd: 1.38, mvps: 8, tournaments: 30, winRate: '68%' },
        achievements: [
          { year: '2022', title: 'FNCS: Chapter 3 Season 1 - ME Grand Finals (1st)' },
          { year: '2024', title: 'FNCS 2024 - Major 2: ME Grand Finals (1st)' },
          { year: '2025', title: 'FNCS 2025 - Major 1: ME Grand Finals (1st)' },
          { year: '2025', title: 'FNCS 2025 - Major 2: ME Grand Finals (1st)' }
        ],
        socials: { twitch: '#' }
      },
   
    ]
  },
  {
    id: 'honor-of-kings',
    name: 'HONOR OF KINGS',
    game: 'HONOR OF KINGS',
    region: 'Malaysia',
    league: 'MKL',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['HoK International Championship 2025 Winners', 'HoK Championship 2024 Winners'],
    bio: 'The undisputed kings of the Honor of Kings international stage, blending youthful talent with experienced leadership.',
    trophies: [
      { id: 'hok-t1', title: 'MY Honor of Kings League Spring 2026', year: '2026', rank: '2ND' },
      { id: 'hok-t2', title: 'AIC 2022 - Arabia Cup', year: '2022', rank: '2ND' },
      { id: 'hok-t3', title: 'HoK International Championship 2022 - Arabia Qualifier', year: '2022', rank: '3RD' },
    ],
    stats: { winRate: '88%', rank: '#1 Global', championships: 6, globalEvents: 5, seasonRecord: '32-4' },
    players: [  
      {
        id: 'hok-guiyu',
        nickname: 'GuiYu',
        name: 'GuiYu',
        role: 'EXP Lane',
        photo: '/assets/GuiYu.png',
        bio: 'Born on February 10, 2008, GuiYu is currently the youngest player in the HoK pro league. Despite this, he has multiple accomplishments at both a regional and global level.',
        stats: { kd: 4.8, mvps: 22, tournaments: 15, winRate: '85%' },
        achievements: [
          { year: '2025', title: 'Indonesia Kings Laga Spring 2025 (2nd)' },
          { year: '2025', title: 'MY Honor of Kings League Fall 2025 (1st)' },
          { year: '2025', title: 'Honor of Kings International Championship 2025 (1st)' },
          { year: '2026', title: 'MY Honor of Kings League Spring 2026 (2nd)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'hok-musangking',
        nickname: 'MusangKing',
        name: 'MusangKing',
        role: 'Jungle',
        photo: '/assets/MusangKing.png',
        bio: 'MusangKing is a focused and confident player who thrives when setting the pace of the game. He gives Geekay a reliable edge from the jungle.',
        stats: { kd: 4.2, mvps: 18, tournaments: 12, winRate: '82%' },
        achievements: [
          { year: '2024', title: 'Honor of Kings Invitational 2024 Season 2 (1st)' },
          { year: '2024', title: 'Honor of Kings Championship 2024 (1st)' },
          { year: '2025', title: 'MY Honor of Kings League Fall 2025 (2nd)' },
          { year: '2025', title: 'Honor of Kings International Championship 2025 (1st)' }
        ],
        socials: { twitch: '#' }
      },
      {
        id: 'hok-shisan',
        nickname: 'Shisan',
        name: 'Shisan',
        role: 'Mid Lane',
        photo: '/assets/ShiSan.png',
        bio: 'Shisan is a composed and thoughtful mid laner who brings balance and control to the squad.',
        stats: { kd: 3.5, mvps: 10, tournaments: 14, winRate: '75%' },
        achievements: [
          { year: '2024', title: 'Honor of Kings Invitational 2024 Season 2 (2nd)' },
          { year: '2024', title: 'Honor of Kings Championship 2024 (3rd)' },
          { year: '2025', title: 'Honor of Kings International Championship 2025 (3rd)' },
          { year: '2026', title: 'MY Honor of Kings League Spring 2026 (2nd)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'hok-zhe',
        nickname: 'Zhe',
        name: 'Zhe',
        role: 'Support',
        photo: '/assets/Zhe.png',
        bio: 'Zhe is a steady and team-first player who helps keep the squad connected in crucial moments.',
        stats: { kd: 2.8, mvps: 8, tournaments: 15, winRate: '80%' },
        achievements: [
          { year: '2024', title: 'Honor of Kings Invitational 2024 Season 2 (1st)' },
          { year: '2024', title: 'Honor of Kings Invitational Midseason 2024 (2nd)' },
          { year: '2024', title: 'Honor of Kings Championship 2024 (1st)' },
          { year: '2025', title: 'Honor of Kings International Championship 2025 (1st)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'hok-jem',
        nickname: 'Jem',
        name: 'Jem',
        role: 'Farm Lane',
        photo: '/assets/Jem.png',
        bio: 'Jem carries over his expertise of the game from the China HOK server, bringing a calm attitude and sharp focus whenever the team needs him most.',
        stats: { kd: 3.9, mvps: 12, tournaments: 10, winRate: '70%' },
        achievements: [
          { year: '2026', title: 'MY Honor of Kings League Spring 2026 (2nd)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'hok-mopo',
        nickname: 'Mopo',
        name: 'Mopo',
        role: 'Coach',
        photo: '/assets/Mopo.jpeg',
        bio: 'Mopo is a disciplined and strategic coach who helps bring structure to the team’s gameplay.',
        stats: { kd: 0, mvps: 0, tournaments: 18, winRate: '75%' },
        achievements: [
          { year: '2024', title: 'Honor of Kings Championship 2024 (1st)' },
          { year: '2026', title: 'MY Honor of Kings League Spring 2026 (2nd)' }
        ],
        socials: { twitch: '#' }
      },
      {
        id: 'hok-broccoli',
        nickname: 'Broccoli',
        name: 'Broccoli',
        role: 'Assistant Coach',
        photo: '/assets/Broccoli.png',
        bio: 'Broccoli brings energy, support, and a strong understanding of the game to the team environment.',
        stats: { kd: 0, mvps: 0, tournaments: 12, winRate: '80%' },
        achievements: [
          { year: '2025', title: 'MY Honor of Kings League Fall 2025 (1st)' },
          { year: '2025', title: 'Honor of Kings International Championship 2025 (1st)' },
          { year: '2026', title: 'MY Honor of Kings League Spring 2026 (2nd)' }
        ],
        socials: { twitter: '#' }
      }
    ],
  },
  {
    id: 'mobile-legends',
    name: 'Mobile Legends: Bang Bang',
    game: 'Mobile Legends: Bang Bang',
    region: 'GLOBAL',
    league: 'MPL',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['MPL MENA Season 7 Champions', 'IESF African Esports Championship 2024 Winners'],
    bio: 'The most dominant Mobile Legends force in the MENA region, consistently competing on the global stage.',
    stats: { winRate: '72%', rank: '#1 MENA', championships: 4, globalEvents: 8, seasonRecord: '20-6' },
    players: [  
      {
        id: 'ml-aizn',
        nickname: 'Aizn',
        name: 'Enkhbat "Aizn" Munkhharaa',
        role: 'EXP Lane',
        photo: '/assets/Aizn.jpeg',
        bio: 'Enkhbat "Aizn" Munkhharaa is a Mongolian professional Mobile Legends player. He brings international competitive experience, having competed at the M5 World Championship.',
        stats: { kd: 1.28, mvps: 22, tournaments: 45, winRate: '68%' },
        achievements: [
          { year: '2023', title: 'ESN National Championship 2023 (1st)' },
          { year: '2024', title: 'MLBB Mid Season Cup 2024 - Mongolia Qualifier (1st)' },
          { year: '2025', title: 'MLBB Mid Season Cup 2025 - Mongolia Qualifier (2nd)' },
          { year: '2025', title: 'ESN National Championship 2025 (1st)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'ml-shen',
        nickname: 'Shen',
        name: 'Mohamed "Shen" Elshanawany',
        role: 'Roam',
        photo: '/assets/Shen.jpeg',
        bio: 'Mohamed "Shen" Elshanawany is an Egyptian professional player who specializes in the Roam role. One of the longest-serving members of Geekay Esports.',
        stats: { kd: 1.12, mvps: 18, tournaments: 40, winRate: '64%' },
        achievements: [
          { year: '2023', title: 'Arena Esports 2023 (1st)' },
          { year: '2024', title: 'MPL MENA Season 5 (3rd)' },
          { year: '2024', title: 'IESF African Esports Championship 2024 (1st)' },
          { year: '2025', title: 'MPL MENA Season 6 (2nd)' }
        ],
        socials: { twitch: '#' }
      },
      {
        id: 'ml-xeno',
        nickname: 'Xeno',
        name: 'Anand "Xeno" Baatarkhuu',
        role: 'Jungler',
        photo: '/assets/Xeno.jpeg',
        bio: 'Anand "Xeno" Baatarkhuu is a Mongolian professional player who has competed on the biggest stages, including the M6 World Championship.',
        stats: { kd: 1.35, mvps: 10, tournaments: 25, winRate: '70%' },
        achievements: [
          { year: '2025', title: 'MPL MENA Season 6 (2nd)' },
          { year: '2025', title: 'MLBB Continental Championships Season 5 (3rd)' },
          { year: '2025', title: 'CyberHero x Donatov.net Showdown S1 (1st)' },
          { year: '2025', title: 'MLBB Continental Championships Season 6 (3rd)' }
        ],
        socials: { twitter: '#' }
      },
      {
        id: 'ml-aody',
        nickname: 'Aody',
        name: 'Mahmoud "Aody" Mahmoud',
        role: 'Gold Lane',
        photo: '/assets/Aody.png',
        bio: 'Known for his aggressive and impactful presence in the carry role, Aody is a key offensive force within the roster.',
        stats: { kd: 1.45, mvps: 5, tournaments: 32, winRate: '62%' },
        socials: { twitter: '#' }
      },
      {
        id: 'ml-pharaoh',
        nickname: 'Pharaoh',
        name: 'Omar "Pharaoh" Ali',
        role: 'Mid Lane',
        photo: '/assets/Pharaoh.png',
        bio: "As the team's mid laner, Pharaoh serves as the strategic centerpiece of the roster, controlling the pace of the game.",
        stats: { kd: 1.18, mvps: 4, tournaments: 28, winRate: '60%' },
        achievements: [
          { year: '2025', title: 'MPL MENA Season 7 (1st)' }
        ],
        socials: { twitch: '#' }
      },
      {
        id: 'ml-quanok',
        nickname: 'Quanok',
        name: 'Quanok',
        role: 'Mid Lane',
        photo: '/assets/Quanok.png',
        bio: 'A core part of the MLBB roster, contributing to multiple championship runs in the region.',
        stats: { kd: 1.05, mvps: 4, tournaments: 28, winRate: '60%' },
        achievements: [
          { year: '2025', title: 'MPL MENA Season 7 (1st)' },
          { year: '2026', title: 'MPL MENA Season 8 (2nd)' }
        ],
        socials: { twitch: '#' }
      },
      {
        id: 'ml-gamba',
        nickname: 'Gamba',
        name: 'Gamba',
        role: 'Pro Player',
        photo: '/assets/Ghostarica.png', // Placeholder
        bio: 'Professional MLBB player representing Geekay Esports.',
        stats: { kd: 1.1, mvps: 2, tournaments: 15, winRate: '55%' },
        socials: { twitch: '#' }
      },
      {
        id: 'ml-ghostarica',
        nickname: 'Ghostarica',
        name: 'Ghostarica',
        role: 'Pro Player',
        photo: '/assets/Ghostarica.png',
        bio: 'Professional MLBB player with a strong focus on team coordination and objectives.',
        stats: { kd: 1.08, mvps: 3, tournaments: 18, winRate: '58%' },
        socials: { twitch: '#' }
      }
    ],
  },
  {
    id: 'pubg-mobile',
    name: 'PUBG MOBILE',
    game: 'PUBG MOBILE',
    region: 'MENA',
    league: 'PMSL',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['Saudi eLeague 2023 Season 1 Champions', 'PMSL MENA Fall 2025 Top 3'],
    bio: 'One of the most established PUBG Mobile rosters in the region, lead by veteran IGL RAGNAROK.',
    trophies: [
      { id: 'pm-t1', title: 'PUBG Mobile Pro League - MEA Championship Spring 2023', year: '2023', rank: '1ST' },
      { id: 'pm-t2', title: 'Saudi eLeagues 2022 Season 2', year: '2022', rank: '1ST' },
      { id: 'pm-t3', title: 'Saudi eLeague 2024: Major 3', year: '2024', rank: '2ND' },
      { id: 'pm-t4', title: 'Saudi eLeague 2024: Major 2', year: '2024', rank: '2ND' },
      { id: 'pm-t5', title: 'PUBG Mobile Pro League - Arabia Fall 2023', year: '2023', rank: '2ND' },
      { id: 'pm-t6', title: 'PUBG Mobile Star Challenge Arabia 2022', year: '2022', rank: '2ND' },
      { id: 'pm-t7', title: 'PUBG Mobile Super League - MENA Fall 2025', year: '2025', rank: '3RD' },
      { id: 'pm-t8', title: 'PMPL - MEA Championship Fall 2022', year: '2022', rank: '3RD' },
      { id: 'pm-t9', title: 'PUBG Mobile Pro League - Arabia Fall 2022', year: '2022', rank: '3RD' },
      { id: 'pm-t10', title: 'Saudi eLeagues 2022 Season 1', year: '2022', rank: '3RD' },
    ],
    stats: { winRate: '65%', rank: '#2 MEA', championships: 5, globalEvents: 8, seasonRecord: '28-12' },
      players: [  
      {
        id: 'pm-ragnarok',
        nickname: 'RAGNAROK',
        name: 'Mohammad "RAGNARoK" Aladdasi',
        role: 'IGL',
        photo: '/assets/RAGNAROK.png',
        bio: 'Mohammad "RAGNARoK" Aladdasi is a Jordanian professional player. Serving as the IGL, he brings years of competitive experience to the roster.',
        stats: { kd: 1.15, mvps: 22, tournaments: 45, winRate: '68%' },
        achievements: [
          { year: '2020', title: 'SURVIVAL METRO TOURNAMENT 2020 (1st)' },
          { year: '2021', title: 'PUBG Mobile Star Challenge Arabia 2021 (2nd)' },
          { year: '2023', title: 'Wizzo Championship (1st)' },
          { year: '2025', title: 'PUBG Mobile Super League - MENA Fall 2025 (3rd)' }
        ],
        socials: { 
          twitter: '594', 
          instagram: '18,414', 
          youtube: '1,630', 
          tiktok: '7,994' 
        }
      },
      {
        id: 'pm-kevin',
        nickname: 'KEVIN',
        name: 'Muhammad "KEVIN" Walid',
        role: 'Pro Player',
        photo: '/assets/KEVIN.png',
        bio: 'Muhammad "KEVIN" Walid is a French-Iraqi professional player. Despite his young age, he has already proven himself as a standout competitor.',
        stats: { kd: 1.38, mvps: 12, tournaments: 20, winRate: '75%' },
        achievements: [
          { year: '2022', title: 'ESL Snapdragon Pro Series 2022 Season 2 (3rd)' },
          { year: '2025', title: 'PUBG Mobile Super League - MENA Fall 2025 (3rd)' }
        ],
        socials: { 
          instagram: '3,784', 
          tiktok: '6,067' 
        }
      },
      {
        id: 'pm-ez4badboy',
        nickname: 'EZ4BADBOY',
        name: 'Botirov "EZ4BADBOY" Muhammadali',
        role: 'Pro Player',
        photo: '/assets/EZ4BADBOY.png',
        bio: 'Botirov "EZ4BADBOY" Muhammadali is an Uzbek professional player. He joined Geekay Esports bringing international experience and a strong background.',
        stats: { kd: 1.42, mvps: 18, tournaments: 40, winRate: '68%' },
        achievements: [
          { year: '2025', title: 'PUBG Mobile Gorilla Campus Cup 2025 (1st)' },
          { year: '2025', title: 'PUBG Mobile National Championship Uzbekistan 2025 (2nd)' }
        ],
        socials: { 
          instagram: '8,983', 
          youtube: '14,500', 
          tiktok: '5,121', 
          telegram: '4,074' 
        }
      },
      {
        id: 'pm-safg',
        nickname: 'SAFG',
        name: 'SAFG',
        role: 'Pro Player',
        photo: '/assets/SAFG.png',
        bio: 'Known for his strong performances in regional tournaments, he currently represents Geekay Esports as part of their competitive roster.',
        stats: { kd: 1.12, mvps: 5, tournaments: 32, winRate: '62%' },
        achievements: [
          { year: '2025', title: 'PUBG Mobile Super League - MENA Fall 2025 (3rd)' }
        ],
        socials: { 
          instagram: '4,268', 
          youtube: '34', 
          tiktok: '1,208' 
        }
      },
      {
        id: 'pm-saleh',
        nickname: 'SALEH',
        name: 'SALEH',
        role: 'Pro Player',
        photo: '/assets/SALEH.png',
        bio: 'A key member of the current roster, bringing competitive experience and dedication to the team.',
        stats: { kd: 1.05, mvps: 4, tournaments: 28, winRate: '60%' },
        socials: { 
          instagram: '420', 
          tiktok: '1,005' 
        }
      },
      {
        id: 'pm-feitan',
        nickname: 'Feitan',
        name: 'Feitan',
        role: 'Head Coach',
        photo: '/assets/Feitan.png',
        bio: 'Head coach of the PUBG Mobile roster, playing a key role in strategy and competitive development.',
        stats: { kd: 0, mvps: 0, tournaments: 40, winRate: '64%' },
        achievements: [
          { year: '2022', title: 'PMPL MEA Championship Fall 2022 (2nd)' },
          { year: '2022', title: 'Saudi eLeagues 2022 Season 2 (2nd)' },
          { year: '2023', title: 'Saudi eLeague 2023 Season 1 (1st)' },
          { year: '2024', title: 'Saudi eLeague 2024: Major 1 Female (1st)' }
        ],
        socials: { 
          twitter: '479', 
          instagram: '12,426' 
        }
      },
      {
        id: 'pm-zaraki',
        nickname: 'ZARAKI',
        name: 'ZARAKI',
        role: 'Pro Player',
        photo: '/assets/ZARAKI.png',
        bio: 'ZARAKI is a key player in the PUBG Mobile roster, known for his consistent performance and dedication.',
        stats: { kd: 1.2, mvps: 8, tournaments: 25, winRate: '65%' },
        socials: { 
          twitter: '398', 
          instagram: '14,662' 
        }
      }
    ],
  },
  {
    id: 'pubg-pc',
    name: 'PUBG PC',
    game: 'PUBG PC',
    region: 'KOREA',
    league: 'PGS',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['Predator League 2020/21: Asia Champions', 'PGC 2025 Participants'],
    bio: 'An elite PUBG roster based in Korea, featuring some of the most decorated veterans in the game.',
    trophies: [
      { id: 'pc-t1', title: 'PUBG EMEA Championship: 2025 Spring', year: '2025', rank: '1ST' },
      { id: 'pc-t2', title: 'Esports World Cup 2025: EMEA Qualifier', year: '2025', rank: '2ND' },
      { id: 'pc-t3', title: 'PUBGRU M5 SERIES 4', year: '2025', rank: '1ST' },
      { id: 'pc-t4', title: 'PUBGRU M5 PRO SERIES 3', year: '2025', rank: '3RD' },
    ],
    stats: { winRate: '65%', rank: '#5 Global', championships: 5, globalEvents: 10, seasonRecord: '24-12' },
  players: [  
      {
        id: 'pubg-seongjang',
        nickname: 'Seongjang',
        name: 'Seong "Seongjang" Jang-hwan',
        role: 'Pro Player',
        photo: '/assets/Seongjang.png',
        bio: 'Seong "Seongjang" Jang-hwan is the veteran and the most decorated player of the team with five first place finishes.',
        stats: { kd: 1.35, mvps: 22, tournaments: 45, winRate: '68%' },
        achievements: [
          { year: '2019', title: 'PUBG Korea League 2019 - Phase 3 (1st)' },
          { year: '2020', title: 'Predator League 2020/21: Asia (1st)' },
          { year: '2020', title: '2020 INCHEON CHALLENGE CUP (1st)' },
          { year: '2018', title: 'PUBG Survival Series 2018 - Beta Season (1st)' }
        ],
        socials: { 
          youtube: '4,500',
          soop: '7,100'
        }
      },
      {
        id: 'pubg-ej',
        nickname: 'EJ',
        name: 'Lee "EJ" Jung-woo',
        role: 'Pro Player',
        photo: '/assets/EJ.png',
        bio: 'Lee "EJ" Jung-woo has become a household name in the Asian PUBG scene ever since he started competing in 2019.',
        stats: { kd: 1.25, mvps: 18, tournaments: 40, winRate: '64%' },
        achievements: [
          { year: '2021', title: 'PUBG WEEKLY SERIES: EAST ASIA Phase 1 (1st)' },
          { year: '2021', title: 'PUBG WEEKLY SERIES: EAST ASIA Pre-Season (1st)' },
          { year: '2020', title: 'PUBG Continental Series 3: Korean Qualifier (2nd)' },
          { year: '2020', title: 'Battlegrounds Smash Cup Season 3 (3rd)' }
        ],
        socials: { soop: '5,600' }
      },
      {
        id: 'pubg-parkpro',
        nickname: 'Parkpro',
        name: 'Park "Parkpro" Hye-sung',
        role: 'Pro Player',
        photo: '/assets/Parkpro.png',
        bio: 'Park "Parkpro" Hye-sung began competing in 2025, but already in his first year as a pro he managed to attend four PGS events and PGC.',
        stats: { kd: 1.15, mvps: 10, tournaments: 20, winRate: '70%' },
        socials: { 
          youtube: '12,900',
          soop: '13,800'
        }
      },
      {
        id: 'pubg-akan',
        nickname: 'AKaN',
        name: 'Kim "AKaN" Min-wook',
        role: 'Pro Player',
        photo: '/assets/AKaN.png',
        bio: 'Kim "AKaN" Min-wook is a tenured PUBG player who attended four PGS events and his first PGC in 2025.',
        stats: { kd: 1.18, mvps: 5, tournaments: 32, winRate: '62%' },
        achievements: [
          { year: '2019', title: 'PUBG Survival Series 2019 UNIVERSITY GLOBAL (2nd)' }
        ],
        socials: { 
          youtube: '1,480',
          soop: '7,300'
        }
      }
    ],  
  },
  {
    id: 'cod-warzone',
    name: 'Call of Duty Warzone',
    game: 'Call of Duty Warzone',
    region: 'EU',
    league: 'WSOW',
    logo: 'https://images.unsplash.com/photo-1624138784614-87fd1b6528f8?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['Regional League Champions'],
    bio: 'Established as the premier tactical squad in the MENA region, GEEKAY COD combines aggressive playstyles with deep strategic depth.',
    stats: {
      winRate: '72%',
      rank: '#4 Global',
      championships: 12,
      globalEvents: 24,
      seasonRecord: '24-6'
    },
    trophies: [
      { id: 'cod-t1', title: 'WARZONE CHALLENGERS', year: '2024', rank: '1ST' },
      { id: 'cod-t2', title: 'MENA OPEN', year: '2023', rank: '1ST' }
    ],
    players: [
      {
        id: 'cod-abosalih',
        name: 'Abosalih',
        nickname: 'Abosalih',
        role: 'Duelist',
        photo: '/assets/Abosalih.png',
        bio: 'The unmatched entry fragger known for his aggressive map control and clutch ability in high-pressure finals.',
        stats: { kd: 1.45, mvps: 12, tournaments: 24, winRate: '68%' },
        achievements: [
          { year: '2025', title: 'MVP Warzone Qualifiers' },
          { year: '2024', title: 'Top 5 Players Global' }
        ],
        timeline: [
          { year: '2022', event: 'Joined GEEKAY' },
          { year: '2023', event: 'Regional Finalist' },
          { year: '2025', event: 'International Champion' }
        ],
        socials: { twitter: '1,500', twitch: '2,300' }
      },
      {
        id: 'cod-almost',
        name: 'Almost',
        nickname: 'Almost',
        role: 'Initiator',
        photo: '/assets/Almost.png',
        bio: 'Strategic mastermind behind some of the greatest comebacks in history. Her utility usage is considered the gold standard.',
        stats: { kd: 1.12, mvps: 8, tournaments: 20, winRate: '62%' },
        achievements: [
          { year: '2024', title: 'Best Initiator MENA' }
        ],
        socials: { twitter: '8,421', instagram: '12,300' }
      },
      {
        id: 'cod-kun3bood',
        nickname: 'Kun3bood',
        name: 'Kun3bood',
        role: 'Controller',
        photo: '/assets/kun3bood.png',
        bio: 'King of smokes and site denial. Kun3bood provides the anchors needed for the team to rotate effectively.',
        stats: { kd: 1.05, mvps: 5, tournaments: 18, winRate: '58%' },
        socials: { twitter: '2,400', twitch: '5,600' }
      },
    ]
  },
  {
    id: 'apex-legends',
    name: 'Apex Legends',
    game: 'Apex Legends',
    region: 'NA',
    league: 'ALGS',
    logo: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100',
    banner: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    achievements: ['ALGS 2025 Split 1 Champions'],
    bio: 'A world-class Apex Legends roster consisting of seasoned veterans known for their aggressive rotations and elite gunplay.',
    stats: {
      winRate: '65%',
      rank: '#3 Global',
      championships: 4,
      globalEvents: 15,
      seasonRecord: '18-8'
    },
    trophies: [
      { id: 'apex-t1', title: 'ALGS Split 1 Playoffs', year: '2025', rank: '1ST' },
    ],
    players: [
      {
        id: 'apex-dropped',
        nickname: 'Dropped',
        name: 'Dropped',
        role: 'IGL',
        photo: '/assets/Dropped.png',
        bio: 'Dropped is a veteran IGL known for his calm leadership and incredible game sense in the final circles.',
        stats: { kd: 1.85, mvps: 15, tournaments: 30, winRate: '70%' },
        socials: { twitter: '45,200', twitch: '120,000' }
      },
      {
        id: 'apex-jxmo',
        nickname: 'Jxmo',
        name: 'Jxmo',
        role: 'Pro Player',
        photo: '/assets/Jxmo.png',
        bio: 'Jxmo brings explosive firepower and mechanical excellence to the squad.',
        stats: { kd: 2.1, mvps: 12, tournaments: 25, winRate: '68%' },
        socials: { twitter: '12,500', twitch: '35,000' }
      },
      {
        id: 'apex-keon',
        nickname: 'Keon',
        name: 'Keon',
        role: 'Pro Player',
        photo: '/assets/Keon.png',
        bio: 'Keon is known for his incredible aim and ability to secure entry knocks in team fights.',
        stats: { kd: 1.95, mvps: 10, tournaments: 28, winRate: '65%' },
        socials: { twitter: '8,400', twitch: '22,000' }
      },
      {
        id: 'apex-knoqd',
        nickname: 'Knoqd',
        name: 'Knoqd',
        role: 'Pro Player',
        photo: '/assets/Knoqd.png',
        bio: 'Knoqd is a versatile force on the team, providing consistent damage and elite survivability.',
        stats: { kd: 1.9, mvps: 8, tournaments: 32, winRate: '67%' },
        socials: { twitter: '32,100', twitch: '85,000' }
      }
    ]
  },
];

export const MOCK_CREATORS: Creator[] = [
  {
    id: 'creator-weeb',
    nickname: 'xWeebMaster',
    name: 'Youssef Elkhouly',
    photo: '/assets/NO PHOTO.png',
    platforms: [
      { type: 'twitter', url: '#', handle: '5,964' },
      { type: 'instagram', url: '#', handle: '11,215' },
      { type: 'twitch', url: '#', handle: '38,800' },
      { type: 'youtube', url: '#', handle: '15,200' },
      { type: 'tiktok', url: '#', handle: '13,600' },
      { type: 'facebook', url: '#', handle: '14,000' }
    ],
    metrics: {
      followers: '108.7K',
      totalReach: '200K+'
    },
    focus: 'Casting / Hosting / Streaming'
  },
  {
    id: 'creator-1',
    nickname: 'Breezi',
    name: 'Breezi',
    photo: '/assets/Breezi.png',
    platforms: [
      { type: 'twitter', url: '#', handle: '13,288' },
      { type: 'instagram', url: '#', handle: '13,852' },
      { type: 'twitch', url: '#', handle: '84,400' },
      { type: 'youtube', url: '#', handle: '39,800' },
      { type: 'tiktok', url: '#', handle: '201,500' }
    ],
    metrics: {
      followers: '352.9K',
      totalReach: '500K+'
    },
    focus: 'Streaming / Gameplay'
  },
  {
    id: 'creator-2',
    nickname: 'Jorhdys',
    name: 'Jorhdys',
    photo: '/assets/Jorhdys.png',
    platforms: [
      { type: 'twitter', url: '#', handle: '17,279' },
      { type: 'instagram', url: '#', handle: '23,576' },
      { type: 'twitch', url: '#', handle: '80,000' },
      { type: 'youtube', url: '#', handle: '42,300' },
      { type: 'tiktok', url: '#', handle: '79,400' }
    ],
    metrics: {
      followers: '242.5K',
      totalReach: '400K+'
    },
    focus: 'Entertainment / Commentary'
  },
  {
    id: 'creator-3',
    nickname: 'Aboodrisk',
    name: 'Aboodrisk',
    photo: '/assets/NO PHOTO.png',
    platforms: [
      { type: 'twitter', url: '#', handle: '2,097' },
      { type: 'twitch', url: '#', handle: '2,300' }
    ],
    metrics: {
      followers: '4.3K',
      totalReach: '10K+'
    },
    focus: 'Streaming / Gameplay'
  },
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e1',
    title: 'VCT GLOBAL FINALS 2026',
    game: 'VALORANT',
    date: '2026-10-12',
    time: '18:00',
    type: 'TOURNAMENT',
    location: 'TOKYO, JP',
    prizePool: '$1,000,000',
    status: 'LIVE',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e2',
    title: 'THE INTERNATIONAL 2026',
    game: 'DOTA 2',
    date: '2026-11-05',
    time: '14:00',
    type: 'TOURNAMENT',
    location: 'COPENHAGEN, DK',
    prizePool: '$18,000,000',
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e3',
    title: 'GEEKAY CHALLENGERS Q1',
    game: 'VALORANT',
    date: '2026-01-22',
    time: '20:00',
    type: 'MATCH',
    location: 'DUBAI, UAE',
    prizePool: '$50,000',
    status: 'FINISHED',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e4',
    title: 'PRO LEAGUE SEASON 12',
    game: 'CS2',
    date: '2026-02-15',
    time: '19:00',
    type: 'MATCH',
    location: 'STOCKHOLM, SE',
    prizePool: '$250,000',
    status: 'FINISHED',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e5',
    title: 'SUMMER MASTERS INVITATIONAL',
    game: 'VALORANT',
    date: '2026-06-08',
    time: '16:00',
    type: 'TOURNAMENT',
    location: 'PARIS, FR',
    prizePool: '$500,000',
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e6',
    title: 'MENA REGIONAL SHOWDOWN',
    game: 'DOTA 2',
    date: '2026-07-20',
    time: '12:00',
    type: 'MATCH',
    location: 'RIYADH, SA',
    prizePool: '$100,000',
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e7',
    title: 'GRAND SLAM FINALS',
    game: 'CS2',
    date: '2026-12-18',
    time: '21:00',
    type: 'TOURNAMENT',
    location: 'NEW YORK, USA',
    prizePool: '$2,000,000',
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e8',
    title: 'RLCS MAJOR 1',
    game: 'RL',
    date: '2026-02-10',
    time: '17:00',
    type: 'TOURNAMENT',
    location: 'LONDON, UK',
    prizePool: '$500,000',
    status: 'FINISHED',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e9',
    title: 'HOK INVITATIONAL',
    game: 'HOK',
    date: '2026-02-12',
    time: '15:00',
    type: 'MATCH',
    location: 'SHANGHAI, CN',
    prizePool: '$100,000',
    status: 'FINISHED',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e10',
    title: 'PUBG MOBILE GLOBAL',
    game: 'PUBG',
    date: '2026-02-18',
    time: '13:00',
    type: 'TOURNAMENT',
    location: 'BANGKOK, TH',
    prizePool: '$2,000,000',
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e11',
    title: 'VALORANT MASTERS',
    game: 'VAL',
    date: '2026-02-22',
    time: '19:00',
    type: 'TOURNAMENT',
    location: 'MADRID, ES',
    prizePool: '$500,000',
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e12',
    title: 'CS2 SHOWDOWN',
    game: 'CS2',
    date: '2026-02-22',
    time: '21:00',
    type: 'MATCH',
    location: 'ONLINE',
    prizePool: '$10,000',
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  },
  {
    id: 'e13',
    title: 'RL REGIONAL FINALS',
    game: 'RL',
    date: '2026-02-22',
    time: '23:00',
    type: 'MATCH',
    location: 'ONLINE',
    prizePool: '$25,000',
    status: 'UPCOMING',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
  }
];

export const MOCK_JOBS: Job[] = [
  { 
    id: 'j1', 
    slug: 'content-director',
    title: 'Content Director', 
    department: 'Creative', 
    location: 'Remote', 
    type: 'Remote',
    summary: 'We are looking for a visionary Content Director to lead our creative storytelling and brand narrative across all digital platforms.',
    responsibilities: [
      'Define and execute the global content strategy for Geekay Esports.',
      'Lead a team of designers, editors, and creators to produce world-class esports content.',
      'Oversee the production of high-impact video series and documentaries.',
      'Collaborate with the marketing team to ensure brand consistency across all channels.',
      'Analyze content performance and optimize for engagement and reach.'
    ],
    requirements: [
      '5+ years of experience in creative direction or content management.',
      'Deep understanding of the esports and gaming landscape.',
      'Proven track record of building and scaling digital audiences.',
      'Strong leadership and project management skills.',
      'Excellent communication and storytelling abilities.'
    ],
    niceToHave: [
      'Experience working with professional esports teams.',
      'Background in video production or motion design.',
      'Knowledge of the MENA gaming market.'
    ],
    benefits: [
      'Competitive salary and performance bonuses.',
      'Remote-first work environment.',
      'Access to elite industry events and networks.',
      'Professional development and career acceleration.'
    ]
  },
  { 
    id: 'j2', 
    slug: 'senior-motion-designer',
    title: 'Senior Motion Designer', 
    department: 'Production', 
    location: 'Dubai, UAE', 
    type: 'On-site',
    summary: 'Join our production team to create high-end motion graphics and visual effects that define the Geekay aesthetic.',
    responsibilities: [
      'Create dynamic motion graphics for social media, broadcasts, and live events.',
      'Develop visual identities for new team rosters and tournament series.',
      'Collaborate with video editors to enhance storytelling through VFX.',
      'Stay ahead of design trends and implement cutting-edge techniques.',
      'Maintain and evolve the Geekay Esports brand guidelines.'
    ],
    requirements: [
      'Expertise in After Effects, Cinema 4D, and the Adobe Creative Suite.',
      'Strong portfolio showcasing high-end motion design work.',
      'Ability to work in a fast-paced, high-intensity environment.',
      'Excellent eye for timing, rhythm, and typography.',
      '3+ years of professional design experience.'
    ],
    benefits: [
      'State-of-the-art workstation and hardware.',
      'Health insurance and wellness programs.',
      'Relocation assistance to Dubai.',
      'Opportunity to work on global esports broadcasts.'
    ]
  },
  { 
    id: 'j3', 
    slug: 'social-media-manager',
    title: 'Social Media Manager', 
    department: 'Marketing', 
    location: 'Remote', 
    type: 'Hybrid',
    summary: 'We need a Social Media Manager who lives and breathes esports to manage our community and grow our digital footprint.',
    responsibilities: [
      'Manage daily posting and community engagement across X, Instagram, and TikTok.',
      'Develop and execute social media campaigns for match days and announcements.',
      'Monitor social trends and implement real-time engagement strategies.',
      'Coordinate with players and creators for social content capture.',
      'Report on social metrics and community sentiment.'
    ],
    requirements: [
      'Deep knowledge of Valorant, Dota 2, and CS2 pro scenes.',
      'Experience managing large-scale social media accounts.',
      'Strong copywriting skills with a focus on gaming culture.',
      'Ability to work flexible hours during major tournaments.',
      'Data-driven mindset with experience in social analytics.'
    ],
    benefits: [
      'Flexible working hours.',
      'Performance-based growth opportunities.',
      'Inclusive and high-performance team culture.',
      'Direct impact on the MENA esports ecosystem.'
    ]
  }
];

export const MOCK_NEWS: NewsItem[] = [
  {
    id: 'n1',
    slug: 'international-qualifications-2026',
    title: 'GEEKAY SECURES SPOT IN INTERNATIONAL CHAMPIONSHIP QUALIFIERS',
    category: 'TOURNAMENT',
    date: 'FEB 26, 2026',
    readTime: '5 MIN READ',
    excerpt: 'After a dominant regional run, our elite squads have officially qualified for the global stage in London.',
    image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=800',
    content: 'Full article content for international qualifications...'
  },
  {
    id: 'n2',
    slug: 'rl-decals-launch-2026',
    title: 'OFFICIAL GEEKAY ROCKET LEAGUE DECALS NOW AVAILABLE IN-GAME',
    category: 'ANNOUNCEMENT',
    date: 'FEB 24, 2026',
    readTime: '3 MIN READ',
    excerpt: 'Represent the pride of MENA on the pitch. The 2026 GEEKAY decal collection is now live in the Rocket League item shop.',
    image: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=1200&h=800',
    content: 'Full article content for RL decals launch...'
  },
  {
    id: 'n3',
    slug: 'major-roster-announcement-2026',
    title: 'MAJOR ROSTER UPDATE: GEEKAY REVEALS NEW TALENT FOR 2026 SEASON',
    category: 'ROSTER',
    date: 'FEB 22, 2026',
    readTime: '4 MIN READ',
    excerpt: 'Strategic reinforcements have arrived. Meet the new operatives joining our championship-winning divisions.',
    image: 'https://images.unsplash.com/photo-1552820728-8b83bb6b773f?auto=format&fit=crop&q=80&w=1200&h=800',
    content: 'Full article content for major roster announcement...'
  }
];

export const MOCK_PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Geekay Esports Jersey 2025',
    price: '119.00',
    link: 'https://www.geekay.com/en/geekay-esports-jersey-2025',
    image: '/assets/jearsy.png',
    category: 'Apparel'
  },
  {
    id: 'p2',
    name: 'Geekay Esports Frame – Rocket League Edition',
    price: 'TBA',
    link: 'https://www.geekay.com/en/geekay-esports-frame-rocket-league-edition-oaly',
    image: '/assets/frame.png',
    category: 'Collectibles'
  },
  {
    id: 'p3',
    name: 'Geekay Esports Chair/Play Mat',
    price: '99.00',
    link: 'https://www.geekay.com/en/geekay-esports-chair-mat',
    image: '/assets/mat.png',
    category: 'Accessories'
  },
  {
    id: 'p4',
    name: 'Geekay Esports Desk Mat Mouse Pad',
    price: '49.00',
    link: 'https://www.geekay.com/en/geekay-e-sports-desk-mat-mouse-pad',
    image: '/assets/mouse.png',
    category: 'Accessories'
  },
  {
    id: 'p5',
    name: 'GamerTek Esports Bag – Black',
    price: '149.00',
    link: 'https://www.geekay.com/en/gamertek-esports-bag-black',
    image: '/assets/bag.png',
    category: 'Gear'
  }
];

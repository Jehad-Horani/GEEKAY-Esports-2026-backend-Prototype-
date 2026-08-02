
export interface PlayerAchievement {
  year: string;
  title: string;
}

export interface PlayerTimelineEvent {
  year: string;
  event: string;
}

export interface Player {
  id: string;
  name: string;
  nickname: string;
  role: string;
  photo: string;
  bio: string;
  age?: string;
  nationality?: string;
  stats: {
    kd: number;
    mvps: number;
    tournaments: number;
    winRate: string;
  };
  achievements?: PlayerAchievement[];
  timeline?: PlayerTimelineEvent[];
  socials: {
    twitter?: string;
    twitch?: string;
    instagram?: string;
    youtube?: string;
    tiktok?: string;
    facebook?: string;
    telegram?: string;
    kick?: string;
    soop?: string;
  };
}

export interface Trophy {
  id: string;
  title: string;
  year: string;
  rank: string;
}

export interface Team {
  id: string;
  name: string;
  game: string;
  region?: string;
  league?: string;
  isContentCreators?: boolean;
  logo: string;
  banner: string;
  achievements: string[];
  trophies?: Trophy[];
  players: Player[];
  stats?: {
    winRate: string;
    rank: string;
    championships: number;
    globalEvents: number;
    seasonRecord: string;
  };
  bio?: string;
}

export interface Creator {
  id: string;
  name: string;
  nickname: string;
  photo: string;
  platforms: {
    type: 'youtube' | 'twitch' | 'tiktok' | 'twitter' | 'instagram' | 'facebook' | 'telegram' | 'kick' | 'soop';
    url: string;
    handle: string;
  }[];
  metrics: {
    followers: string;
    totalReach: string;
  };
  focus: string; // Streaming / Gameplay / Commentary / Entertainment
}

export interface Event {
  id: string;
  title: string;
  game: string;
  date: string;
  time?: string;
  type?: 'MATCH' | 'TOURNAMENT';
  location: string;
  prizePool: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  image: string;
}

export interface Job {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  type: 'On-site' | 'Remote' | 'Hybrid';
  summary: string;
  responsibilities: string[];
  requirements: string[];
  niceToHave?: string[];
  benefits: string[];
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  category: 'ANNOUNCEMENT' | 'ROSTER' | 'TOURNAMENT' | 'COMMUNITY' | 'PARTNERSHIP';
  date: string;
  readTime: string;
  excerpt: string;
  image: string;
  content?: string;
}

export interface Product {
  id: string;
  name: string;
  price?: string;
  link: string;
  image: string;
  category?: string;
}

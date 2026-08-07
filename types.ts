
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
  joined_date?: string;
  stats: {
    kd: number;
    mvps: number;
    tournaments: number;
    matches?: number;
    winRate: string;
  };
  achievements?: PlayerAchievement[];
  timeline?: PlayerTimelineEvent[];
  media?: any[];
  rating_performance?: number | string;
  rating_consistency?: number | string;
  rating_community?: number | string;
  rating_overall?: number | string;
  championship_wins?: number | string;
  major_titles?: number | string;
  int_placements?: number | string;
  trophy_count?: number | string;
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
  tagline?: string;
  achievements: any[];
  trophies?: Trophy[];
  media?: any[];
  players: Player[];
  win_rate?: string;
  winRate?: string;
  global_rank?: string;
  globalRank?: string;
  championships?: number | string;
  season_record?: string;
  seasonRecord?: string;
  stats?: {
    winRate?: string;
    rank?: string;
    championships?: number | string;
    globalEvents?: number | string;
    seasonRecord?: string;
  };
  bio?: string;
}

export interface Creator {
  id: string;
  name: string;
  alias?: string;
  nickname: string;
  photo: string;
  published?: number;
  display_order?: number;
  total_reach?: string;
  followers?: string;
  socials?: any;
  platforms: {
    type: 'youtube' | 'twitch' | 'tiktok' | 'twitter' | 'instagram' | 'facebook' | 'telegram' | 'kick' | 'soop' | string;
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
  email?: string;
}

export interface NewsItem {
  id: string;
  slug: string;
  title: string;
  category: string;
  date: string;
  readTime?: string;
  read_time?: string;
  author?: string;
  excerpt: string;
  image: string;
  content?: string;
  tags?: string[] | string;
  featured?: boolean | number;
  breaking_news?: boolean | number;
  published?: boolean | number;
  status?: string;
  related_team?: string;
  related_game?: string;
}

export interface Product {
  id: string;
  name: string;
  price?: string;
  link: string;
  image: string;
  category?: string;
}

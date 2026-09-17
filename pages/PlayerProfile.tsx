import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Trophy as TrophyIcon, 
  Award, 
  MapPin, 
  Calendar, 
  Users, 
  ChevronLeft, 
  ChevronRight, 
  TrendingUp, 
  Zap, 
  Flame, 
  Target, 
  Shield, 
  Flag,
  ArrowRight,
  User,
  ExternalLink,
  Briefcase,
  Medal
} from 'lucide-react';

import { MOCK_TEAMS } from '../constants';
import { Player, Team } from '../types';
import ArenaButton from '../components/ui/ArenaButton';
import SocialFollowerIcon from '../components/SocialFollowerIcon';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta, { generatePlayerRatingSchema, generateSportsTeamSchema } from '../components/SEOMeta';

// Deterministic player rating generator based on stats and nickname
import { safeJsonParse } from '../src/utils/json';
import { getNationalityDetails, calculateAgeFromBirthDate, formatBirthDate } from '../src/utils/nationality';

const getPlayerRatings = (player: Player) => {
  const tournamentPerformance = parseFloat((Number(player.rating_performance) || 4.4).toFixed(1));
  const consistency = parseFloat((Number(player.rating_consistency) || 4.6).toFixed(1));
  const communityRating = parseFloat((Number(player.rating_community) || 4.7).toFixed(1));
  
  // Calculate overall rating automatically as the exact average of the 3 sub-ratings
  const overall = parseFloat(((tournamentPerformance + consistency + communityRating) / 3).toFixed(1));
  
  const matchesCount = (player.stats as any)?.totalMatches || player.stats?.matches || player.stats?.tournaments || 12;
  const reviewCount = Math.max(15, matchesCount * 5 + 29);

  return {
    tournamentPerformance,
    consistency,
    communityRating,
    overall,
    reviewCount
  };
};

// Nationalities mapping helper with flags and clean names
const normalizeSocials = (rawSocials: any): Record<string, string> => {
  const parsed = safeJsonParse(rawSocials, rawSocials || {});
  if (Array.isArray(parsed)) {
    const res: Record<string, string> = {};
    parsed.forEach((item: any) => {
      if (item && item.platform) {
        res[item.platform] = item.handle || item.url || '#';
      }
    });
    return res;
  }
  if (parsed && typeof parsed === 'object') {
    return parsed;
  }
  return {};
};

// Procedural Join Date generator
const getJoinDate = (playerId: string) => {
  const hash = playerId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const years = [2022, 2023, 2024, 2025];
  const months = ['January', 'March', 'June', 'September', 'November'];
  const year = years[hash % years.length];
  const month = months[hash % months.length];
  return `${month} ${year}`;
};

// Visual trophy visualizer cards
const TROPHY_PRESETS = [
  { title: 'Championship Wins', desc: 'S-Tier international gold medals', icon: <TrophyIcon className="text-[#FFC400]" size={36} />, count: '3' },
  { title: 'Major Titles', desc: 'Regional division final trophies', icon: <Award className="text-yellow-400" size={36} />, count: '6' },
  { title: 'Int. Placements', desc: 'Global stage top 3 finishes', icon: <Zap className="text-amber-400" size={36} />, count: '12' },
  { title: 'Trophy Count', desc: 'Total registered organization cups', icon: <Flame className="text-orange-500" size={36} />, count: '21' },
];

// Fallback high-quality unsplash imagery for player media gallery
const GALLERY_PHOTOS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1548685913-fe6574abf1a5?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1560253023-3ec5d502959f?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800&h=500',
];

export default function PlayerProfile() {
  const { playerName } = useParams<{ playerName: string }>();
  const navigate = useNavigate();

  const [dbTeams, setDbTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    fetch('/api/teams')
      .then(res => res.ok ? res.json() : [])
      .then(async (data) => {
        if (isMounted && Array.isArray(data)) {
          const loadedTeams: Team[] = await Promise.all(
            data.map(async (t: any) => {
              let playersData: any[] = [];
              try {
                const pRes = await fetch(`/api/teams/${t.id}/players`);
                if (pRes.ok) playersData = await pRes.json();
              } catch (e) {}

              const mappedPlayers: Player[] = playersData.map((p: any) => ({
                id: String(p.id),
                nickname: p.ign || p.nickname || 'PLAYER',
                role: p.role || 'ROSTER',
                name: p.name || '',
                photo: p.photo || 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=500&h=600',
                bio: p.bio || '',
                age: p.age || '20',
                birth_date: p.birth_date || '',
                country: p.country || p.nationality || 'Saudi Arabia',
                nationality: p.nationality || p.country || 'Saudi Arabia',
                joined_date: p.joined_date || p.joinedDate || '',
                socials: normalizeSocials(p.socials),
                achievements: safeJsonParse(p.achievements, []),
                media: safeJsonParse(p.media, []),
                rating_performance: p.rating_performance ?? p.ratingPerformance,
                rating_consistency: p.rating_consistency ?? p.ratingConsistency,
                rating_community: p.rating_community ?? p.ratingCommunity,
                rating_overall: p.rating_overall ?? p.ratingOverall ?? p.rating,
                championship_wins: p.championship_wins ?? p.championshipWins,
                major_titles: p.major_titles ?? p.majorTitles,
                int_placements: p.int_placements ?? p.intPlacements,
                trophy_count: p.trophy_count ?? p.trophyCount,
                stats: {
                  kd: p.kd !== undefined && p.kd !== null ? Number(p.kd) : (p.stats?.kd ?? 1.2),
                  mvps: p.mvps !== undefined && p.mvps !== null ? Number(p.mvps) : (p.stats?.mvps ?? 0),
                  tournaments: p.tournaments !== undefined && p.tournaments !== null ? Number(p.tournaments) : (p.stats?.tournaments ?? 0),
                  matches: p.matches ?? p.total_matches ?? p.tournaments ?? (p.stats?.matches ?? 0),
                  winRate: p.win_rate || p.winRate || p.stats?.winRate || '70%'
                }
              }));

              return {
                id: String(t.id),
                name: t.name,
                game: t.game,
                region: t.region || 'MENA',
                league: t.league || '',
                banner: t.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
                logo: t.logo || '',
                bio: t.bio || '',
                tagline: t.tagline || '',
                players: mappedPlayers,
                achievements: safeJsonParse(t.achievements, []),
                winRate: t.win_rate || t.winRate || '75%',
                globalRank: t.global_rank || t.globalRank || '#1 GLOBAL',
                championships: t.championships || 3
              };
            })
          );
          setDbTeams(loadedTeams);
        }
      })
      .catch(err => console.error('Failed to fetch teams for player profile:', err))
      .finally(() => {
        if (isMounted) setLoading(false);
      });
    return () => { isMounted = false; };
  }, []);

  // Flatten and cache all players for global navigation & lookups
  const allPlayersWithTeams = useMemo(() => {
    const list: { player: Player; team: Team }[] = [];
    dbTeams.forEach(team => {
      (team.players || []).forEach(p => {
        if (!list.some(item => item.player.id === p.id)) {
          list.push({ player: p, team });
        }
      });
    });
    return list;
  }, [dbTeams]);

  // Find the current player by slug matching nickname
  const currentData = useMemo(() => {
    if (!playerName) return null;
    const cleanName = playerName.toLowerCase().replace(/[-_]/g, '');
    return allPlayersWithTeams.find(item => {
      const pNameClean = item.player.nickname.toLowerCase().replace(/[-_]/g, '');
      const pIdClean = item.player.id.toLowerCase().replace(/[-_]/g, '');
      return pNameClean === cleanName || pIdClean === cleanName || pIdClean.endsWith(cleanName);
    }) || null;
  }, [playerName, allPlayersWithTeams]);

  // Handle fallback error state if player not found
  useEffect(() => {
    if (!currentData && allPlayersWithTeams.length > 0) {
      // If we don't find the exact player, redirect to the teams page
      const timer = setTimeout(() => {
        navigate('/teams');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [currentData, navigate, allPlayersWithTeams]);

  // Image error state handling
  const [imgError, setImgError] = useState(false);

  // Reset image error state when player changes
  useEffect(() => {
    setImgError(false);
  }, [playerName]);

  const player = currentData?.player;
  const team = currentData?.team;

  const ratings = useMemo(() => {
    if (!player) return { overall: 4.5, reviewCount: 50, tournamentPerformance: 4.5, consistency: 4.5, communityRating: 4.5 };
    return getPlayerRatings(player);
  }, [player]);

  const seoSchemas = useMemo(() => {
    if (!player || !team) return [];
    const pRatingSchema = generatePlayerRatingSchema(player.nickname, ratings.overall, ratings.reviewCount, team.name);
    const teamPlayers = (team.players || []).map(p => ({
      nickname: p.nickname,
      role: p.role,
      url: `https://geekayesports.com/players/${p.nickname.toLowerCase()}`
    }));
    const pTeamSchema = generateSportsTeamSchema(team.name, teamPlayers, team.region, team.logo, team.achievements);
    return [pRatingSchema, pTeamSchema];
  }, [player, team, ratings]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#081B3A] flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFC400]/20 border-t-[#FFC400] rounded-full animate-spin mb-4" />
        <span className="font-syncopate text-[#FFC400] text-xs font-bold tracking-widest uppercase animate-pulse">
          LOADING PLAYER PROFILE...
        </span>
      </div>
    );
  }

  if (!currentData || !player || !team) {
    return (
      <div className="bg-[#081B3A] min-h-screen flex flex-col items-center justify-center p-6 text-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'linear' }}
          className="w-16 h-16 border-t-2 border-b-2 border-[#FFC400] rounded-full mb-8"
        />
        <h2 className="font-syncopate text-2xl font-black text-white uppercase tracking-widest mb-4">RECONSTITUTING INTEL...</h2>
        <p className="text-slate-500 font-inter text-sm max-w-sm">
          If player record does not exist, you will be automatically returned to the War Room.
        </p>
      </div>
    );
  }

  const natDetails = getNationalityDetails(player.nationality || player.country);
  const calculatedAge = calculateAgeFromBirthDate(player.birth_date);
  const operativeAge = calculatedAge !== null ? String(calculatedAge) : (player.age || '22');
  const joinDate = getJoinDate(player.id);

  // Teammates lookup (excluding current player)
  const teammates = team.players.filter(p => p.id !== player.id);

  // Roster-based navigation inside the team
  const rosterIndex = team.players.findIndex(p => p.id === player.id);
  const prevPlayer = team.players[rosterIndex === 0 ? team.players.length - 1 : rosterIndex - 1];
  const nextPlayer = team.players[rosterIndex === team.players.length - 1 ? 0 : rosterIndex + 1];

  // Map achievements to dynamic chronological timeline results (Strictly real database data)
  const timelineResults = player.achievements && Array.isArray(player.achievements) && player.achievements.length > 0 
    ? player.achievements.map((ach: any) => {
        if (typeof ach === 'string') {
          const match = ach.match(/\((\d+(?:st|nd|rd|th))\)/i);
          const placement = match ? match[1] : 'Tournament MVP';
          const cleanTitle = ach.replace(/\s*\(\d+(?:st|nd|rd|th)\)\s*$/i, '');
          return { placement, tournamentName: cleanTitle, year: '2026' };
        }
        const rawTitle = ach?.tournament || ach?.title || ach?.name || ach?.event || '';
        const rawPlacement = ach?.placement || ach?.mvpType || ach?.award || ach?.type || 'Tournament MVP';
        const cleanTitle = rawTitle ? String(rawTitle).replace(/\s*\(\d+(?:st|nd|rd|th)\)\s*$/i, '') : 'Championship Tournament';
        return {
          placement: String(rawPlacement),
          tournamentName: cleanTitle,
          year: String(ach?.year || ach?.date || '2026')
        };
      })
    : [];

  // Matches played procedural calculation
  const calculatedMatches = player.stats?.tournaments ? player.stats.tournaments * 8 + 32 : 124;

  return (
    <div className="bg-[#081B3A] min-h-screen selection:bg-[#FFC400] selection:text-black pt-28 sm:pt-32 pb-32 sm:pb-40 overflow-x-hidden">
      <SEOMeta 
        title={`${player.nickname} - Geekay Esports ${team.game} Professional Player`}
        description={`Meet ${player.nickname} (${player.name}), professional ${team.game} player for Geekay Esports. Read career statistics, tournament achievements, player ratings and background biography.`}
        ogType="profile"
        schemas={seoSchemas}
      />
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <Breadcrumbs />
        
        {/* Back navigation bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 sm:mb-12 flex flex-wrap gap-3 justify-between items-center"
        >
          <Link 
            to="/teams" 
            className="group flex items-center gap-2 sm:gap-4 text-slate-500 hover:text-[#FFC400] transition-colors font-syncopate text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.4em] font-bold uppercase"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            BACK TO WAR ROOM
          </Link>
          
          <div className="bg-white/5 border border-slate-800 px-3 sm:px-4 py-1.5 sm:py-2 font-syncopate text-[8px] sm:text-[9px] text-[#FFC400] tracking-widest uppercase">
            OPERATIVE STATUS: ACTIVE
          </div>
        </motion.div>

        {/* ====================================================
            HERO SECTION (Optimized for mobile viewports)
            ==================================================== */}
        <div className="relative border border-slate-800 bg-[#040E1E]/40 overflow-hidden mb-12 sm:mb-16 p-5 sm:p-8 md:p-14 lg:p-16 flex flex-col lg:flex-row gap-8 sm:gap-12 items-center lg:items-end">
          {/* Ambient Grid Background */}
          <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC400]/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Giant background text - hidden on mobile to avoid overflow and visual clutter */}
          <div className="hidden lg:block absolute right-10 bottom-0 font-syncopate text-[10vw] font-black text-white/[0.015] select-none pointer-events-none leading-none tracking-tighter uppercase truncate max-w-full">
            {player.nickname}
          </div>

          {/* Player Image container */}
          <div className="relative w-64 h-80 sm:w-72 sm:h-96 md:w-80 md:h-[450px] shrink-0 border border-slate-800/80 bg-slate-950 overflow-hidden group mx-auto lg:mx-0">
            {/* Corner Bracket Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFC400]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFC400]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFC400]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFC400]" />

            {imgError ? (
              <div className="w-full h-full bg-[#05142B] flex flex-col items-center justify-center p-8 text-center relative">
                <span className="font-syncopate text-[100px] sm:text-[140px] font-black text-white/[0.02] absolute inset-0 flex items-center justify-center select-none">{player.nickname[0]}</span>
                <User size={56} className="text-[#FFC400]/40 mb-4" />
                <span className="font-syncopate text-xl sm:text-2xl font-black text-white uppercase tracking-tight break-words px-2">{player.nickname}</span>
                <span className="font-syncopate text-[10px] text-yellow-500 mt-2 tracking-widest uppercase">{player.role}</span>
              </div>
            ) : (
              <img 
                src={player.photo} 
                alt={player.nickname} 
                className="w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-105 group-hover:brightness-110"
                onError={() => setImgError(true)}
              />
            )}
            
            {/* Scanning line overlay */}
            <div className="absolute inset-0 bg-scanline opacity-[0.15] pointer-events-none" />
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black to-transparent" />
          </div>

          {/* Hero Meta Details */}
          <div className="flex-grow z-10 w-full min-w-0 max-w-full text-left">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-3 sm:mb-4">
              <span className="bg-[#FFC400] text-black px-3 sm:px-4 py-1 sm:py-1.5 font-syncopate text-[9px] sm:text-[10px] font-black tracking-wider sm:tracking-[0.2em] uppercase skew-x-[-10deg]">
                <span className="block skew-x-[10deg]">{team.game} Division</span>
              </span>
              <div className="hidden sm:block h-[1px] w-8 bg-slate-800" />
              <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 font-syncopate text-[9px] sm:text-[10px] font-bold tracking-widest uppercase">
                <MapPin size={12} className="text-[#FFC400]" />
                {team.region || 'MENA'}
              </div>
            </div>

            {/* Mobile-optimized Player Nickname */}
            <h1 className="font-syncopate text-3xl sm:text-5xl md:text-7xl lg:text-8xl font-black text-white uppercase tracking-tight sm:tracking-tighter leading-[1.05] mb-2 sm:mb-4 break-words hyphens-auto w-full min-w-0 max-w-full">
              {player.nickname}
            </h1>

            {/* Mobile-optimized Real Name & Role */}
            <p className="font-syncopate text-slate-400 text-[10px] sm:text-xs md:text-sm tracking-wider sm:tracking-[0.25em] md:tracking-[0.4em] uppercase mb-6 sm:mb-8 flex flex-wrap items-center gap-2 sm:gap-3 leading-relaxed">
              {player.name && <span className="break-words">{player.name}</span>}
              {player.name && <span className="text-slate-800">//</span>}
              <span className="text-[#FFC400] font-black">{player.role}</span>
            </p>

            {/* Social platform links (Display ONLY available) */}
            <div className="border-t border-slate-800/80 pt-6 sm:pt-8 mt-4 w-full min-w-0">
              <p className="text-slate-500 font-syncopate text-[8px] sm:text-[9px] tracking-[0.2em] sm:tracking-[0.3em] uppercase mb-3 sm:mb-4">
                CONNECT WITH OPERATIVE
              </p>
              <div className="flex flex-wrap gap-2.5 sm:gap-4 w-full">
                {Object.entries(normalizeSocials(player.socials)).map(([platform, value]) => {
                  if (!value || value === '#') return null;
                  const href = typeof value === 'string' && value.startsWith('http') ? value : `https://${platform}.com`;
                  return (
                    <a 
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-slate-900/60 hover:bg-[#FFC400]/10 border border-slate-800 hover:border-[#FFC400]/40 transition-all group max-w-full"
                    >
                      <SocialFollowerIcon 
                        platform={platform} 
                        count="" 
                        className="text-slate-400 group-hover:text-[#FFC400] transition-colors shrink-0" 
                      />
                      <span className="font-syncopate text-[8px] sm:text-[9px] font-bold text-slate-400 group-hover:text-white uppercase tracking-wider shrink-0">
                        {platform}
                      </span>
                      <span className="font-mono text-[8px] sm:text-[9px] text-slate-600 group-hover:text-[#FFC400] truncate max-w-[140px] sm:max-w-[180px]">
                        {typeof value === 'string' ? value : ''}
                      </span>
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Main layout split */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          
          {/* Main Column */}
          <div className="lg:col-span-8 space-y-20">
            
            {/* ====================================================
                PLAYER OVERVIEW
                ==================================================== */}
            <section className="scroll-mt-32">
              <h2 className="font-syncopate text-xl text-white font-black tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                <span className="text-[#FFC400] font-mono">//</span> PLAYER OVERVIEW
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
                {/* Meta details list */}
                <div className="space-y-4 border border-slate-800 p-8 bg-[#040E1E]/20 relative">
                  <div className="absolute top-0 left-0 w-full h-[2px] bg-[#FFC400]/50" />
                  
                  <div className="flex justify-between py-2 border-b border-slate-900">
                    <span className="font-syncopate text-[10px] text-slate-500 tracking-wider">FULL NAME</span>
                    <span className="font-syncopate text-[11px] font-bold text-white">{player.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-900">
                    <span className="font-syncopate text-[10px] text-slate-500 tracking-wider">NICKNAME</span>
                    <span className="font-syncopate text-[11px] font-bold text-[#FFC400]">{player.nickname}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-900">
                    <span className="font-syncopate text-[10px] text-slate-500 tracking-wider">ROSTER UNIT</span>
                    <span className="font-syncopate text-[11px] font-bold text-white uppercase">{team.name}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-900">
                    <span className="font-syncopate text-[10px] text-slate-500 tracking-wider">TACTICAL ROLE</span>
                    <span className="font-syncopate text-[11px] font-bold text-white">{player.role}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-900">
                    <span className="font-syncopate text-[10px] text-slate-500 tracking-wider">OPERATIVE AGE</span>
                    <span className="font-syncopate text-[11px] font-bold text-white flex items-center gap-1.5">
                      <span>{operativeAge} YEARS</span>
                      {player.birth_date && (
                        <span className="text-[9px] text-slate-500 font-mono tracking-normal">
                          ({formatBirthDate(player.birth_date)})
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-900">
                    <span className="font-syncopate text-[10px] text-slate-500 tracking-wider">NATIONALITY</span>
                    <span className="font-syncopate text-[11px] font-bold text-white flex items-center gap-2">
                      <span className="text-base select-none leading-none inline-block">{natDetails.flag}</span>
                      <span className="uppercase">{natDetails.name}</span>
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-syncopate text-[10px] text-slate-500 tracking-wider">JOINED GEEKAY</span>
                    <span className="font-syncopate text-[11px] font-bold text-white uppercase">{player.joined_date || joinDate}</span>
                  </div>
                </div>

                {/* Biography narrative */}
                <div className="border border-slate-800 p-8 bg-[#040E1E]/20 relative flex flex-col justify-between">
                  <div>
                    <span className="font-syncopate text-[#FFC400] text-[9px] tracking-widest font-bold mb-4 block uppercase">BACKGROUND BIOGRAPHY</span>
                    <p className="text-slate-400 font-inter text-sm md:text-base leading-relaxed font-light">
                      {player.bio || `${player.nickname} is a key asset to the Geekay Esports ${team.game} squad. Consistently delivering exceptional strategic capability, mechanical accuracy, and championship focus in high pressure environments across regional and international final matches.`}
                    </p>
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-900 text-slate-600 font-mono text-[9px] tracking-widest uppercase">
                    SYS_LOG_DATED: {joinDate.toUpperCase()} // READY
                  </div>
                </div>
              </div>
            </section>

            {/* ====================================================
                MVP TITLES (Strictly database data)
                ==================================================== */}
            {timelineResults.length > 0 && (
              <section className="scroll-mt-32">
                <h2 className="font-syncopate text-xl text-white font-black tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                  <span className="text-[#FFC400] font-mono">//</span> MVP TITLES
                </h2>

                <div className="border border-slate-800 bg-[#040E1E]/20 p-8 space-y-6">
                  {timelineResults.map((res, i) => (
                    <div key={i} className="flex gap-6 items-center group">
                      <div className="w-16 h-16 shrink-0 bg-[#0A254D] border border-slate-800 flex items-center justify-center text-center skew-x-[-10deg] group-hover:border-[#FFC400] transition-colors">
                        <div className="skew-x-[10deg] font-syncopate text-xs font-black text-[#FFC400] group-hover:text-white transition-colors leading-none tracking-widest">
                          MVP
                        </div>
                      </div>
                      
                      <div className="flex-grow border-b border-slate-900 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                        <div>
                          <h4 className="font-syncopate text-xs font-black text-white group-hover:text-[#FFC400] transition-colors uppercase tracking-widest">
                            {res.tournamentName}
                          </h4>
                          <span className="text-slate-400 font-syncopate text-[10px] font-bold tracking-wider uppercase block mt-1">
                            {res.placement}
                          </span>
                        </div>
                        <span className="font-syncopate text-[10px] text-slate-500 tracking-wider md:text-right font-bold">{res.year}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* ====================================================
                ACHIEVEMENTS SECTION
                ==================================================== */}
            <section className="scroll-mt-32">
              <h2 className="font-syncopate text-xl text-white font-black tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                <span className="text-[#FFC400] font-mono">//</span> ACHIEVEMENTS & ACCOLADES
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {[
                  { 
                    title: 'Championship Wins', 
                    desc: 'S-Tier international gold medals', 
                    icon: <TrophyIcon className="text-[#FFC400]" size={36} />, 
                    count: (player.championship_wins !== undefined && player.championship_wins !== null && String(player.championship_wins).trim() !== '')
                      ? player.championship_wins
                      : (player.achievements && player.achievements.length > 0 
                          ? player.achievements.filter((a: any) => String(a.placement || a.tournament || a.title || '').match(/1st|gold|winner|champion|mvp/i)).length || 1
                          : (player.stats?.mvps || 5))
                  },
                  { 
                    title: 'Major Titles', 
                    desc: 'Regional division final trophies', 
                    icon: <Award className="text-yellow-400" size={36} />, 
                    count: (player.major_titles !== undefined && player.major_titles !== null && String(player.major_titles).trim() !== '')
                      ? player.major_titles
                      : (player.stats?.mvps !== undefined ? player.stats.mvps : (player.achievements?.length || 5))
                  },
                  { 
                    title: 'Int. Placements', 
                    desc: 'Global stage top 3 finishes', 
                    icon: <Medal className="text-yellow-500" size={36} />, 
                    count: (player.int_placements !== undefined && player.int_placements !== null && String(player.int_placements).trim() !== '')
                      ? player.int_placements
                      : (player.achievements && player.achievements.length > 0 ? player.achievements.length : 12)
                  },
                  { 
                    title: 'Trophy Count', 
                    desc: 'Total registered organization cups', 
                    icon: <Shield className="text-yellow-300" size={36} />, 
                    count: (player.trophy_count !== undefined && player.trophy_count !== null && String(player.trophy_count).trim() !== '')
                      ? player.trophy_count
                      : (player.achievements && player.achievements.length > 0 
                          ? player.achievements.length 
                          : (player.stats?.tournaments || 12))
                  }
                ].map((trophy, i) => (
                  <div key={i} className="flex gap-6 items-center p-6 bg-[#040E1E]/40 border border-slate-800 hover:border-[#FFC400]/40 transition-all duration-300 relative group">
                    <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFC400]/5 skew-x-[-45deg] translate-x-8 -translate-y-8" />
                    
                    <div className="w-16 h-16 shrink-0 bg-slate-900 border border-slate-800 flex items-center justify-center relative group-hover:scale-110 transition-transform duration-500">
                      {trophy.icon}
                    </div>

                    <div>
                      <h4 className="font-syncopate text-[10px] font-black text-white tracking-widest uppercase mb-1">
                        {trophy.title}
                      </h4>
                      <p className="text-slate-500 font-inter text-xs font-light mb-3">{trophy.desc}</p>
                      
                      {/* Metric tally */}
                      <span className="font-syncopate text-2xl font-black text-[#FFC400]">
                        {trophy.count}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ====================================================
                PLAYER GALLERY & MEDIA (Strictly database data)
                ==================================================== */}
            {player.media && Array.isArray(player.media) && player.media.length > 0 && (
              <section className="scroll-mt-32">
                <h2 className="font-syncopate text-xl text-white font-black tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                  <span className="text-[#FFC400] font-mono">//</span> MEDIA
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {player.media.map((item: any, i: number) => {
                    const mediaUrl = typeof item === 'string' ? item : item?.url;
                    if (!mediaUrl) return null;
                    const isVideo = item.type === 'video' || (mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') || mediaUrl.includes('twitch.tv') || mediaUrl.endsWith('.mp4'));
                    
                    if (isVideo) {
                      return (
                        <div key={i} className="aspect-video relative overflow-hidden bg-slate-950 border border-slate-800/80 group">
                          {mediaUrl.includes('youtube.com') || mediaUrl.includes('youtu.be') ? (
                            <iframe 
                              src={mediaUrl.replace('watch?v=', 'embed/')} 
                              title={item.title || `Media Video ${i + 1}`}
                              className="w-full h-full border-0"
                              allowFullScreen
                            />
                          ) : (
                            <a href={mediaUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full relative">
                              <video src={mediaUrl} className="w-full h-full object-cover" />
                              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                <div className="w-12 h-12 rounded-full bg-[#FFC400] text-black flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                                  ▶
                                </div>
                              </div>
                            </a>
                          )}
                          <div className="absolute bottom-2 left-2 font-syncopate text-[9px] text-[#FFC400] font-black tracking-widest uppercase bg-black/80 px-2 py-1">
                            VIDEO // {item.title || `CLIP_${i + 1}`}
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div key={i} className="aspect-video relative overflow-hidden bg-slate-950 border border-slate-800/80 group">
                        <img 
                          src={mediaUrl} 
                          alt={item.title || `${player.nickname} Gallery Photo ${i + 1}`} 
                          className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="absolute bottom-4 left-4 font-syncopate text-[9px] text-[#FFC400] font-black tracking-widest uppercase translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                          {item.title || `GALLERY // PIC_${i + 1}`}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar Columns */}
          <div className="lg:col-span-4 space-y-12">
            
            {/* ====================================================
                RELATED TEAM
                ==================================================== */}
            <div className="border border-slate-800 bg-[#040E1E]/40 p-8 relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
              
              <h3 className="font-syncopate text-lg font-black text-white uppercase tracking-tighter mb-6">
                OPERATIVE UNIT
              </h3>

              <div className="aspect-video w-full bg-slate-950 border border-slate-900 relative overflow-hidden mb-6">
                <img 
                  src={team.banner} 
                  alt={team.name} 
                  className="w-full h-full object-cover brightness-[0.4]" 
                />
                <div className="absolute inset-0 flex items-center justify-center text-center p-4">
                  <div>
                    <span className="bg-[#FFC400] text-black px-3 py-1 font-syncopate text-[8px] font-black tracking-widest uppercase inline-block mb-2">
                      {team.game}
                    </span>
                    <h4 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter block">{team.name}</h4>
                  </div>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-1 border-b border-slate-900 text-xs">
                  <span className="text-slate-500 font-syncopate text-[9px] tracking-wider uppercase">DIVISION</span>
                  <span className="text-white font-syncopate text-[9px] font-bold uppercase">{team.game}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-900 text-xs">
                  <span className="text-slate-500 font-syncopate text-[9px] tracking-wider uppercase">REGION</span>
                  <span className="text-[#FFC400] font-syncopate text-[9px] font-bold uppercase">{team.region || 'MENA'}</span>
                </div>
                <div className="flex justify-between py-1 text-xs">
                  <span className="text-slate-500 font-syncopate text-[9px] tracking-wider uppercase">LEAGUE</span>
                  <span className="text-white font-syncopate text-[9px] font-bold uppercase">{team.league || 'PRO LEAGUE'}</span>
                </div>
              </div>

              <Link to={`/teams?id=${team.id}`} className="block w-full">
                <ArenaButton className="w-full h-16 group relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2 font-syncopate text-[10px] font-black uppercase tracking-widest">
                    VIEW TEAM <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </ArenaButton>
              </Link>
            </div>

            {/* ====================================================
                RELATED PLAYERS (TEAMMATES)
                ==================================================== */}
            {teammates.length > 0 && (
              <div className="border border-slate-800 bg-[#040E1E]/20 p-8">
                <h3 className="font-syncopate text-lg font-black text-white uppercase tracking-tighter mb-6">
                  TEAMMATES
                </h3>

                <div className="space-y-4">
                  {teammates.map((mate) => (
                    <Link 
                      key={mate.id}
                      to={`/players/${mate.nickname.toLowerCase()}`}
                      className="flex gap-4 items-center p-3 bg-[#05142B]/40 hover:bg-[#FFC400]/10 border border-slate-900 hover:border-[#FFC400]/30 transition-all duration-300 group"
                    >
                      <div className="w-12 h-16 shrink-0 bg-slate-950 border border-slate-800 overflow-hidden relative">
                        <img 
                          src={mate.photo} 
                          alt={mate.nickname} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          onError={(e) => {
                            // Suppress broken image and show placeholder gracefully
                            (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=100&h=150';
                          }}
                        />
                      </div>
                      <div className="flex-grow">
                        <h4 className="font-syncopate text-xs font-black text-white group-hover:text-[#FFC400] transition-colors tracking-widest uppercase">
                          {mate.nickname}
                        </h4>
                        <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">{mate.role}</span>
                      </div>
                      <ChevronRight size={14} className="text-slate-600 group-hover:text-[#FFC400] group-hover:translate-x-1 transition-all" />
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ====================================================
            PLAYER NAVIGATION
            ==================================================== */}
        <div className="mt-20 pt-10 border-t border-slate-800/80 flex justify-between items-center gap-4">
          {prevPlayer && (
            <Link 
              to={`/players/${prevPlayer.nickname.toLowerCase()}`}
              className="group flex flex-col items-start gap-1 p-4 hover:bg-white/5 border border-transparent hover:border-slate-800 transition-all flex-1"
            >
              <span className="text-slate-500 font-syncopate text-[8px] tracking-[0.3em] uppercase flex items-center gap-2">
                <ChevronLeft size={12} className="group-hover:-translate-x-1 transition-transform" /> PREVIOUS MEMBER
              </span>
              <span className="font-syncopate text-base md:text-xl font-black text-white uppercase group-hover:text-[#FFC400] transition-colors tracking-tight">
                {prevPlayer.nickname}
              </span>
            </Link>
          )}

          <div className="hidden sm:block h-12 w-[1px] bg-slate-800" />

          {nextPlayer && (
            <Link 
              to={`/players/${nextPlayer.nickname.toLowerCase()}`}
              className="group flex flex-col items-end gap-1 p-4 hover:bg-white/5 border border-transparent hover:border-slate-800 transition-all flex-1 text-right"
            >
              <span className="text-slate-500 font-syncopate text-[8px] tracking-[0.3em] uppercase flex items-center gap-2">
                NEXT MEMBER <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
              </span>
              <span className="font-syncopate text-base md:text-xl font-black text-white uppercase group-hover:text-[#FFC400] transition-colors tracking-tight">
                {nextPlayer.nickname}
              </span>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}

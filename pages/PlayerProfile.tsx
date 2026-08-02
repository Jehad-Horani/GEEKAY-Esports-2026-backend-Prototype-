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
  Briefcase
} from 'lucide-react';

import { MOCK_TEAMS } from '../constants';
import { Player, Team } from '../types';
import ArenaButton from '../components/ui/ArenaButton';
import SocialFollowerIcon from '../components/SocialFollowerIcon';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta, { generatePlayerRatingSchema, generateSportsTeamSchema } from '../components/SEOMeta';

// Deterministic player rating generator based on stats and nickname
const getPlayerRatings = (player: Player) => {
  const hash = player.nickname.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const tournamentPerformance = parseFloat((4.4 + (hash % 7) * 0.1).toFixed(1));
  const consistency = parseFloat((4.3 + ((hash + 2) % 8) * 0.1).toFixed(1));
  const communityRating = parseFloat((4.5 + ((hash + 5) % 6) * 0.1).toFixed(1));
  const overall = parseFloat(((tournamentPerformance + consistency + communityRating) / 3).toFixed(1));
  return {
    tournamentPerformance,
    consistency,
    communityRating,
    overall,
    reviewCount: (hash % 80) + 40
  };
};

// Nationalities mapping helper with flags and clean names
const getNationalityDetails = (nationality?: string) => {
  const nat = (nationality || 'Saudi Arabia').trim().toLowerCase();
  if (nat.includes('saudi') || nat.includes('ksa') || nat === 'sa') return { flag: '🇸🇦', name: 'Saudi Arabia' };
  if (nat.includes('brazil') || nat === 'br') return { flag: '🇧🇷', name: 'Brazil' };
  if (nat.includes('germany') || nat === 'de') return { flag: '🇩🇪', name: 'Germany' };
  if (nat.includes('ireland') || nat.includes('uk') || nat.includes('english') || nat.includes('england')) return { flag: '🇬🇧', name: 'United Kingdom' };
  if (nat.includes('italy') || nat === 'it') return { flag: '🇮🇹', name: 'Italy' };
  if (nat.includes('danish') || nat.includes('denmark') || nat === 'dk') return { flag: '🇩🇰', name: 'Denmark' };
  if (nat.includes('vietnam') || nat === 'vn') return { flag: '🇻🇳', name: 'Vietnam' };
  if (nat.includes('korea') || nat === 'kr') return { flag: '🇰🇷', name: 'South Korea' };
  if (nat.includes('poland') || nat === 'pl') return { flag: '🇵🇱', name: 'Poland' };
  if (nat.includes('mena')) return { flag: '🇸🇦', name: 'MENA Region' };
  return { flag: '🇸🇦', name: 'Saudi Arabia' }; // default
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

  // Flatten and cache all players for global navigation & lookups
  const allPlayersWithTeams = useMemo(() => {
    const list: { player: Player; team: Team }[] = [];
    MOCK_TEAMS.forEach(team => {
      team.players.forEach(p => {
        if (!list.some(item => item.player.id === p.id)) {
          list.push({ player: p, team });
        }
      });
    });
    return list;
  }, []);

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

  if (!currentData) {
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

  const { player, team } = currentData;
  const natDetails = getNationalityDetails(player.nationality);
  const joinDate = getJoinDate(player.id);

  // Teammates lookup (excluding current player)
  const teammates = team.players.filter(p => p.id !== player.id);

  // Roster-based navigation inside the team
  const rosterIndex = team.players.findIndex(p => p.id === player.id);
  const prevPlayer = team.players[rosterIndex === 0 ? team.players.length - 1 : rosterIndex - 1];
  const nextPlayer = team.players[rosterIndex === team.players.length - 1 ? 0 : rosterIndex + 1];

  // Map achievements to dynamic chronological timeline results
  const timelineResults = player.achievements && player.achievements.length > 0 
    ? player.achievements.map((ach) => {
        // Parse placement (e.g. "1st", "2nd", etc.) from text or title
        const match = ach.title.match(/\((\d+(?:st|nd|rd|th))\)/i);
        const placement = match ? match[1] : 'Qualified';
        const cleanTitle = ach.title.replace(/\s*\(\d+(?:st|nd|rd|th)\)\s*$/i, '');
        return {
          placement,
          tournamentName: cleanTitle,
          year: ach.year
        };
      })
    : [
        { placement: '1st Place', tournamentName: `${team.game} Regional Open Challenger`, year: '2025' },
        { placement: '2nd Place', tournamentName: `${team.game} Saudi eLeague Finals`, year: '2025' },
        { placement: '3rd Place', tournamentName: `${team.game} World Esports Masterclass`, year: '2024' },
      ];

  // Matches played procedural calculation
  const calculatedMatches = player.stats.tournaments ? player.stats.tournaments * 8 + 32 : 124;

  const ratings = useMemo(() => getPlayerRatings(player), [player]);

  const seoSchemas = useMemo(() => {
    const pRatingSchema = generatePlayerRatingSchema(player.nickname, ratings.overall, ratings.reviewCount, team.name);
    const teamPlayers = team.players.map(p => ({
      nickname: p.nickname,
      role: p.role,
      url: `https://geekayesports.com/players/${p.nickname.toLowerCase()}`
    }));
    const pTeamSchema = generateSportsTeamSchema(team.name, teamPlayers, team.region, team.logo, team.achievements);
    return [pRatingSchema, pTeamSchema];
  }, [player, team, ratings]);

  return (
    <div className="bg-[#081B3A] min-h-screen selection:bg-[#FFC400] selection:text-black pt-32 pb-40">
      <SEOMeta 
        title={`${player.nickname} - Geekay Esports ${team.game} Professional Player`}
        description={`Meet ${player.nickname} (${player.name}), professional ${team.game} player for Geekay Esports. Read career statistics, tournament achievements, player ratings and background biography.`}
        ogType="profile"
        schemas={seoSchemas}
      />
      <div className="max-w-7xl mx-auto px-6">
        <Breadcrumbs />
        
        {/* Back navigation bar */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 flex justify-between items-center"
        >
          <Link 
            to="/teams" 
            className="group flex items-center gap-4 text-slate-500 hover:text-[#FFC400] transition-colors font-syncopate text-[10px] tracking-[0.4em] font-bold uppercase"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            BACK TO WAR ROOM
          </Link>
          
          <div className="bg-white/5 border border-slate-800 px-4 py-2 font-syncopate text-[9px] text-[#FFC400] tracking-widest uppercase">
            OPERATIVE STATUS: ACTIVE
          </div>
        </motion.div>

        {/* ====================================================
            HERO SECTION
            ==================================================== */}
        <div className="relative border border-slate-800 bg-[#040E1E]/40 overflow-hidden mb-16 p-8 md:p-16 flex flex-col lg:flex-row gap-12 items-center">
          {/* Ambient Grid Background */}
          <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#FFC400]/5 rounded-full blur-3xl pointer-events-none" />
          
          {/* Giant background text */}
          <div className="absolute right-10 bottom-0 font-syncopate text-[12vw] font-black text-white/[0.01] select-none pointer-events-none leading-none tracking-tighter uppercase">
            {player.nickname}
          </div>

          {/* Player Image container */}
          <div className="relative w-72 h-96 md:w-80 md:h-[450px] shrink-0 border border-slate-800/80 bg-slate-950 overflow-hidden group">
            {/* Corner Bracket Accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFC400]" />
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFC400]" />
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFC400]" />
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFC400]" />

            {imgError ? (
              <div className="w-full h-full bg-[#05142B] flex flex-col items-center justify-center p-8 text-center relative">
                <span className="font-syncopate text-[140px] font-black text-white/[0.02] absolute inset-0 flex items-center justify-center select-none">{player.nickname[0]}</span>
                <User size={64} className="text-[#FFC400]/40 mb-4" />
                <span className="font-syncopate text-2xl font-black text-white uppercase tracking-tighter">{player.nickname}</span>
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
          <div className="flex-grow z-10 self-center lg:self-end">
            <div className="flex flex-wrap items-center gap-4 mb-4">
              <span className="bg-[#FFC400] text-black px-4 py-1.5 font-syncopate text-[10px] font-black tracking-[0.2em] uppercase skew-x-[-10deg]">
                <span className="block skew-x-[10deg]">{team.game} Division</span>
              </span>
              <div className="h-[1px] w-8 bg-slate-800" />
              <div className="flex items-center gap-2 text-slate-400 font-syncopate text-[10px] font-bold tracking-widest uppercase">
                <MapPin size={12} className="text-[#FFC400]" />
                {team.region || 'MENA'}
              </div>
            </div>

            <h1 className="font-syncopate text-5xl md:text-8xl font-black text-white uppercase tracking-tighter leading-none mb-4">
              {player.nickname}
            </h1>
            <p className="font-syncopate text-slate-400 text-xs md:text-sm tracking-[0.4em] uppercase mb-8 flex items-center gap-3">
              <span>{player.name}</span>
              <span className="text-slate-800">//</span>
              <span className="text-[#FFC400] font-black">{player.role}</span>
            </p>

            {/* Social platform links (Display ONLY available) */}
            <div className="border-t border-slate-800/80 pt-8 mt-4">
              <p className="text-slate-500 font-syncopate text-[9px] tracking-[0.3em] uppercase mb-4">CONNECT WITH OPERATIVE</p>
              <div className="flex flex-wrap gap-5">
                {Object.entries(player.socials).map(([platform, value]) => {
                  if (!value || value === '#') return null;
                  return (
                    <a 
                      key={platform}
                      href={`https://${platform}.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-4 py-2 bg-slate-900/60 hover:bg-[#FFC400]/10 border border-slate-800 hover:border-[#FFC400]/40 transition-all group"
                    >
                      <SocialFollowerIcon 
                        platform={platform} 
                        count="" 
                        className="text-slate-400 group-hover:text-[#FFC400] transition-colors" 
                      />
                      <span className="font-syncopate text-[9px] font-bold text-slate-400 group-hover:text-white uppercase tracking-widest">
                        {platform}
                      </span>
                      <span className="font-mono text-[9px] text-slate-600 group-hover:text-[#FFC400]">
                        {value}
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
                    <span className="font-syncopate text-[11px] font-bold text-white">{player.age || '22'} YEARS</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-slate-900">
                    <span className="font-syncopate text-[10px] text-slate-500 tracking-wider">NATIONALITY</span>
                    <span className="font-syncopate text-[11px] font-bold text-white flex items-center gap-2">
                      <span className="text-sm select-none">{natDetails.flag}</span> {natDetails.name}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="font-syncopate text-[10px] text-slate-500 tracking-wider">JOINED GEEKAY</span>
                    <span className="font-syncopate text-[11px] font-bold text-white uppercase">{joinDate}</span>
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

                {/* Tactical Performance Ratings Bento Card */}
                <div className="md:col-span-2 border border-slate-800 p-8 bg-[#040E1E]/40 relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#FFC400]" />
                  <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#FFC400]" />
                  <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#FFC400]" />
                  <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#FFC400]" />
                  
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 relative z-10">
                    <div className="max-w-md">
                      <span className="font-syncopate text-slate-500 text-[8px] tracking-[0.4em] uppercase mb-1 block">TACTICAL RATING HUB</span>
                      <h3 className="font-syncopate text-white text-lg font-black tracking-wider mb-2 uppercase">PLAYER RATINGS</h3>
                      <p className="text-slate-400 font-inter text-xs font-light leading-relaxed">
                        Crawlable and verified search engine performance appraisal ratings across regional and international final competitions.
                      </p>
                      
                      <div className="flex items-baseline gap-2 mt-6">
                        <span className="font-syncopate text-6xl font-black text-[#FFC400] drop-shadow-[0_0_15px_rgba(255,196,0,0.2)]">{ratings.overall}</span>
                        <span className="text-[#FFC400] font-syncopate text-sm font-black">/ 5.0</span>
                        <span className="text-slate-500 font-inter text-xs font-light ml-4">({ratings.reviewCount} Expert Appraisals)</span>
                      </div>
                    </div>
                    
                    <div className="flex-grow space-y-4 max-w-md w-full border-t md:border-t-0 md:border-l border-slate-800/80 pt-6 md:pt-0 md:pl-8">
                      {/* Metric 1: Tournament Performance */}
                      <div>
                        <div className="flex justify-between text-[9px] font-syncopate mb-1.5 text-slate-400 tracking-widest">
                          <span>TOURNAMENT PERFORMANCE</span>
                          <span className="text-[#FFC400] font-black">{ratings.tournamentPerformance} / 5.0</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 border border-slate-800 rounded-none overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(ratings.tournamentPerformance / 5) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                            className="h-full bg-[#FFC400]" 
                          />
                        </div>
                      </div>

                      {/* Metric 2: Consistency */}
                      <div>
                        <div className="flex justify-between text-[9px] font-syncopate mb-1.5 text-slate-400 tracking-widest">
                          <span>CONSISTENCY RATING</span>
                          <span className="text-[#FFC400] font-black">{ratings.consistency} / 5.0</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 border border-slate-800 rounded-none overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(ratings.consistency / 5) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.4 }}
                            className="h-full bg-[#FFC400]" 
                          />
                        </div>
                      </div>

                      {/* Metric 3: Community Rating */}
                      <div>
                        <div className="flex justify-between text-[9px] font-syncopate mb-1.5 text-slate-400 tracking-widest">
                          <span>COMMUNITY APPROVAL</span>
                          <span className="text-[#FFC400] font-black">{ratings.communityRating} / 5.0</span>
                        </div>
                        <div className="h-1.5 bg-slate-950 border border-slate-800 rounded-none overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(ratings.communityRating / 5) * 100}%` }}
                            transition={{ duration: 1, ease: 'easeOut', delay: 0.6 }}
                            className="h-full bg-[#FFC400]" 
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* ====================================================
                STATISTICS SECTION
                ==================================================== */}
            <section className="scroll-mt-32">
              <h2 className="font-syncopate text-xl text-white font-black tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                <span className="text-[#FFC400] font-mono">//</span> CAREER STATISTICS
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                {/* Matches Card */}
                <div className="bg-[#05142B] border border-slate-800 p-6 flex flex-col justify-between relative group hover:border-[#FFC400] transition-colors duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-slate-500 font-syncopate text-[9px] font-black tracking-widest uppercase">MATCHES</span>
                  <div className="my-6">
                    <span className="font-syncopate text-4xl md:text-5xl font-black text-white block">{calculatedMatches}</span>
                  </div>
                  <span className="text-[#FFC400] font-mono text-[8px] tracking-wider uppercase flex items-center gap-1">
                    <TrendingUp size={10} /> Active Season
                  </span>
                </div>

                {/* Win Rate Card */}
                <div className="bg-[#05142B] border border-slate-800 p-6 flex flex-col justify-between relative group hover:border-[#FFC400] transition-colors duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-slate-500 font-syncopate text-[9px] font-black tracking-widest uppercase">WIN RATE</span>
                  <div className="my-6">
                    <span className="font-syncopate text-4xl md:text-5xl font-black text-[#FFC400] block">{player.stats.winRate || '68%'}</span>
                  </div>
                  <span className="text-[#FFC400] font-mono text-[8px] tracking-wider uppercase flex items-center gap-1">
                    <Shield size={10} /> High Standard
                  </span>
                </div>

                {/* K/D Card */}
                <div className="bg-[#05142B] border border-slate-800 p-6 flex flex-col justify-between relative group hover:border-[#FFC400] transition-colors duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-slate-500 font-syncopate text-[9px] font-black tracking-widest uppercase">
                    {player.stats.kd > 0 ? 'K/D RATIO' : 'EFFICIENCY'}
                  </span>
                  <div className="my-6">
                    <span className="font-syncopate text-4xl md:text-5xl font-black text-white block">
                      {player.stats.kd > 0 ? player.stats.kd : '96.4%'}
                    </span>
                  </div>
                  <span className="text-[#FFC400] font-mono text-[8px] tracking-wider uppercase flex items-center gap-1">
                    <Target size={10} /> Target Master
                  </span>
                </div>

                {/* MVPs Card */}
                <div className="bg-[#05142B] border border-slate-800 p-6 flex flex-col justify-between relative group hover:border-[#FFC400] transition-colors duration-300 overflow-hidden">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-slate-500 font-syncopate text-[9px] font-black tracking-widest uppercase">MVPS</span>
                  <div className="my-6">
                    <span className="font-syncopate text-4xl md:text-5xl font-black text-[#FFC400] block">{player.stats.mvps || '12'}</span>
                  </div>
                  <span className="text-[#FFC400] font-mono text-[8px] tracking-wider uppercase flex items-center gap-1">
                    <Flame size={10} /> MVP Level
                  </span>
                </div>
              </div>
            </section>

            {/* ====================================================
                TOURNAMENT RESULTS
                ==================================================== */}
            <section className="scroll-mt-32">
              <h2 className="font-syncopate text-xl text-white font-black tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                <span className="text-[#FFC400] font-mono">//</span> TOURNAMENT RESULTS
              </h2>

              <div className="border border-slate-800 bg-[#040E1E]/20 p-8 space-y-6">
                {timelineResults.map((res, i) => (
                  <div key={i} className="flex gap-6 items-center group">
                    <div className="w-16 h-16 shrink-0 bg-[#0A254D] border border-slate-800 flex items-center justify-center text-center skew-x-[-10deg] group-hover:border-[#FFC400] transition-colors">
                      <div className="skew-x-[10deg] font-syncopate text-xs font-black text-white group-hover:text-[#FFC400] transition-colors leading-none">
                        {res.placement.split(' ')[0]}
                      </div>
                    </div>
                    
                    <div className="flex-grow border-b border-slate-900 pb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                      <div>
                        <h4 className="font-syncopate text-xs font-black text-white group-hover:text-[#FFC400] transition-colors uppercase tracking-widest">
                          {res.tournamentName}
                        </h4>
                        <span className="text-slate-500 font-inter text-xs font-light">{res.placement} Finish</span>
                      </div>
                      <span className="font-syncopate text-[10px] text-slate-500 tracking-wider md:text-right">{res.year}</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* ====================================================
                ACHIEVEMENTS SECTION
                ==================================================== */}
            <section className="scroll-mt-32">
              <h2 className="font-syncopate text-xl text-white font-black tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                <span className="text-[#FFC400] font-mono">//</span> ACHIEVEMENTS
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {TROPHY_PRESETS.map((trophy, i) => (
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
                PLAYER GALLERY
                ==================================================== */}
            <section className="scroll-mt-32">
              <h2 className="font-syncopate text-xl text-white font-black tracking-[0.4em] uppercase mb-10 flex items-center gap-4">
                <span className="text-[#FFC400] font-mono">//</span> MEDIA
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {GALLERY_PHOTOS.map((photo, i) => (
                  <div key={i} className="aspect-video relative overflow-hidden bg-slate-950 border border-slate-800/80 group">
                    <img 
                      src={photo} 
                      alt={`${player.nickname} Match Gallery Photo ${i + 1}`} 
                      className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <div className="absolute bottom-4 left-4 font-syncopate text-[9px] text-[#FFC400] font-black tracking-widest uppercase translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                      LIVE ARENA // PIC_{i + 1}
                    </div>
                  </div>
                ))}
              </div>
            </section>
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

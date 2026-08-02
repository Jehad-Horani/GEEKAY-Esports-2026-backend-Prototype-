import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  ChevronLeft,
  X, 
  Trophy as TrophyIcon, 
  Twitter, 
  Twitch, 
  Instagram, 
  Youtube,
  Activity, 
  Shield,
  Layers,
  Target,
  ExternalLink,
  Award,
  Globe,
  Facebook,
  Send,
  Radio,
  Calendar,
  Flame,
  Zap,
  User,
  Image as ImageIcon,
  Users as UsersIcon
} from 'lucide-react';

import SocialFollowerIcon from '../components/SocialFollowerIcon';
import { MOCK_TEAMS, MOCK_CREATORS } from '../constants';
import { Player, Team, Trophy, Creator } from '../types';
import ArenaButton from '../components/ui/ArenaButton';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta, { generateSportsTeamSchema } from '../components/SEOMeta';

// Flag mapping helper
const getFlagEmoji = (nationality?: string) => {
  const nat = (nationality || 'Saudi Arabia').trim().toLowerCase();
  if (nat.includes('saudi') || nat.includes('ksa') || nat === 'sa') return '🇸🇦';
  if (nat.includes('brazil') || nat === 'br') return '🇧🇷';
  if (nat.includes('germany') || nat === 'de') return '🇩🇪';
  if (nat.includes('ireland') || nat.includes('uk') || nat.includes('english') || nat.includes('england')) return '🇬🇧';
  if (nat.includes('italy') || nat === 'it') return '🇮🇹';
  if (nat.includes('danish') || nat.includes('denmark') || nat === 'dk') return '🇩🇰';
  if (nat.includes('vietnam') || nat === 'vn') return '🇻🇳';
  if (nat.includes('korea') || nat === 'kr') return '🇰🇷';
  if (nat.includes('poland') || nat === 'pl') return '🇵🇱';
  return '🇸🇦';
};

// Fallback high-quality unsplash imagery for team media gallery
const TEAM_MEDIA_PHOTOS = [
  'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800&h=500',
  'https://images.unsplash.com/photo-1548685913-fe6574abf1a5?auto=format&fit=crop&q=80&w=800&h=500',
];

// --- Team Achievement Card Component ---
const TrophyCard: React.FC<{ trophy: Trophy, index: number }> = ({ trophy, index }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    whileInView={{ opacity: 1, scale: 1 }}
    transition={{ delay: index * 0.05 }}
    whileHover={{ y: -5, borderColor: '#FFC400' }}
    className="bg-[#081B3A] border border-slate-800 p-8 flex flex-col items-center text-center group transition-all duration-500 relative"
  >
    <div className="absolute top-0 right-0 w-8 h-8 bg-[#FFC400]/5 skew-x-[-45deg] translate-x-4 -translate-y-4" />
    <div className="mb-6 relative">
       <div className="absolute inset-0 bg-[#FFC400]/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
       <Award size={48} className="text-[#FFC400] relative z-10" />
    </div>
    <span className="text-slate-500 font-syncopate text-[9px] tracking-[0.4em] mb-2 uppercase">{trophy.year}</span>
    <h4 className="font-syncopate text-xs font-black text-white mb-4 tracking-tighter uppercase leading-tight py-1 flex items-center justify-center min-h-[3rem]">{trophy.title}</h4>
    <div className="bg-[#FFC400] text-black px-4 py-1 font-syncopate text-[10px] font-black skew-x-[-15deg]">
       <span className="block skew-x-[15deg]">{trophy.rank}</span>
    </div>
  </motion.div>
);

// --- Upgraded Team Detail Component ---
const TeamDetail: React.FC<{ team: Team, onBack: () => void, onSwitchTeam: (id: string) => void }> = ({ team, onBack, onSwitchTeam }) => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [team.id]);

  // Find other teams for "More Teams" section
  const moreTeams = useMemo(() => {
    return MOCK_TEAMS.filter(t => t.id !== team.id);
  }, [team.id]);

  const teamSchema = useMemo(() => {
    const teamPlayers = team.players.map(p => ({
      nickname: p.nickname,
      role: p.role,
      url: `https://geekayesports.com/players/${p.nickname.toLowerCase()}`
    }));
    return [generateSportsTeamSchema(team.name, teamPlayers, team.region, team.logo, team.achievements)];
  }, [team]);

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      exit={{ opacity: 0 }} 
      className="bg-[#081B3A] pb-32 relative"
    >
      <SEOMeta 
        title={`${team.name} - Geekay Esports Professional ${team.game} Roster`}
        description={`Official competitive roster details for the Geekay Esports ${team.name} squad. Check active players, team records, recent achievements, and championship details.`}
        ogType="website"
        schemas={teamSchema}
      />
      {/* ====================================================
          TEAM HERO SECTION
          ==================================================== */}
      <div className="relative h-[65vh] min-h-[500px] overflow-hidden">
        <motion.img 
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 10 }}
          src={team.banner} 
          alt={team.name} 
          className="w-full h-full object-cover grayscale brightness-[0.3]" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081B3A] via-[#081B3A]/40 to-transparent" />
        <div className="absolute inset-0 bg-grid opacity-10" />

        {/* Back Button */}
        <button 
          onClick={onBack}
          className="absolute top-28 left-8 md:left-12 z-50 flex items-center gap-3 text-slate-400 hover:text-[#FFC400] transition-all font-syncopate text-[10px] font-black uppercase tracking-[0.4em] group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
          <span>← BACK TO TEAMS</span>
        </button>

        {/* Hero Meta and Title */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 mt-12">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex items-center gap-3 mb-6"
          >
            <span className="bg-[#FFC400] text-black px-4 py-1.5 font-syncopate text-[10px] font-black tracking-[0.2em] uppercase skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">{team.game}</span>
            </span>
            {team.region && (
              <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 font-syncopate text-[10px] font-bold tracking-[0.2em] uppercase border border-white/10 skew-x-[-10deg]">
                <span className="block skew-x-[10deg]">{team.region}</span>
              </span>
            )}
            {team.league && (
              <span className="hidden md:inline-block bg-[#040E1E]/80 text-slate-400 px-4 py-1.5 font-syncopate text-[10px] font-bold tracking-[0.2em] uppercase border border-slate-800 skew-x-[-10deg]">
                <span className="block skew-x-[10deg]">{team.league}</span>
              </span>
            )}
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="font-syncopate text-3xl md:text-6xl font-black text-white uppercase tracking-tighter leading-none"
          >
            {team.name} <span className="text-[#FFC400]">- GEEKAY ESPORTS ROSTER</span>
          </motion.h1>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 -mt-20">
        
        {/* ====================================================
            TEAM OVERVIEW SECTION
            ==================================================== */}
        <section className="bg-[#040E1E]/60 border border-slate-800 p-8 md:p-12 mb-24 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#FFC400]" />
          <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Description Narrative */}
            <div className="lg:col-span-7 flex flex-col justify-between">
              <div>
                <span className="font-syncopate text-[#FFC400] text-[9px] tracking-[0.4em] font-black mb-4 block uppercase">TEAM OVERVIEW</span>
                <h3 className="font-syncopate text-2xl font-black text-white uppercase tracking-tighter mb-6">
                  TACTICAL INTEL & BIO
                </h3>
                <p className="text-slate-300 font-inter text-base leading-relaxed font-light">
                  {team.bio || `The competitive Geekay ${team.name} squad is built with some of the most mechanically gifted and strategically coordinated athletes in the esport landscape. Focused on absolute coordination, intense operational protocols, and aggressive gameplay, this roster consistently sets benchmarks across EMEA and global circuits.`}
                </p>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-900/60 text-slate-500 font-mono text-[9px] tracking-widest uppercase">
                ESTABLISHED: 2021 // ACTIVE STATUS // LIVE FEED
              </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 flex flex-col justify-between relative group hover:border-[#FFC400] transition-colors duration-300">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">WIN RATE</span>
                <span className="font-syncopate text-3xl font-black text-[#FFC400] mt-4">{team.stats?.winRate || '78%'}</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 flex flex-col justify-between relative group hover:border-[#FFC400] transition-colors duration-300">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">GLOBAL RANK</span>
                <span className="font-syncopate text-3xl font-black text-white mt-4">{team.stats?.rank || '#3 GLOBAL'}</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 flex flex-col justify-between relative group hover:border-[#FFC400] transition-colors duration-300">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">CHAMPIONSHIPS</span>
                <span className="font-syncopate text-3xl font-black text-white mt-4">{team.stats?.championships || '5'}</span>
              </div>
              <div className="bg-slate-900/40 border border-slate-800/80 p-6 flex flex-col justify-between relative group hover:border-[#FFC400] transition-colors duration-300">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">SEASON RECORD</span>
                <span className="font-syncopate text-3xl font-black text-[#FFC400] mt-4">{team.stats?.seasonRecord || '18-4'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            ACTIVE ROSTER SECTION
            ==================================================== */}
        <section className="mb-32">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-syncopate text-[#FFC400] text-[10px] tracking-[0.5em] font-black mb-2 block uppercase">TACTICAL PERSONNEL</span>
              <h2 className="font-syncopate text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">ACTIVE PLAYERS</h2>
            </div>
            <div className="hidden md:block h-[1px] flex-grow mx-12 bg-slate-800/80" />
            <span className="font-syncopate text-slate-500 text-xs tracking-widest uppercase">{team.players.length} OPERATIVES</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {team.players.map(player => {
              const flag = getFlagEmoji(player.nationality);
              const topAchievement = player.achievements && player.achievements.length > 0
                ? player.achievements[0].title
                : 'Pro League Contender';

              return (
                <Link 
                  key={player.id}
                  to={`/players/${player.nickname.toLowerCase()}`}
                  className="group relative aspect-[3/4] overflow-hidden bg-slate-900 border border-slate-800/80 transition-all duration-300 hover:border-[#FFC400] hover:shadow-[0_0_30px_rgba(255,196,0,0.15)] flex flex-col justify-end"
                >
                  {/* Corner brackets */}
                  <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity z-20" />
                  <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity z-20" />

                  <img 
                    src={player.photo} 
                    alt={player.nickname} 
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-700 ease-out group-hover:scale-[1.05] group-hover:grayscale-[20%]" 
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1566492031773-4f4e44671857?auto=format&fit=crop&q=80&w=400&h=500';
                    }}
                  />
                  
                  {/* Base gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040E1E] via-[#040E1E]/40 to-transparent group-hover:opacity-0 transition-opacity duration-300" />

                  {/* Standard state: Nickname & Role */}
                  <div className="relative z-10 p-6 transition-opacity duration-300 group-hover:opacity-0">
                    <span className="text-[#FFC400] font-syncopate text-[8px] tracking-[0.3em] font-black uppercase mb-1 block">{player.role}</span>
                    <h3 className="font-syncopate text-2xl font-black text-white uppercase tracking-tighter leading-none">{player.nickname}</h3>
                  </div>

                  {/* Hover overlay with extra stats & info (Country Flag, Nationality, Top Achievement) */}
                  <div className="absolute inset-0 bg-[#040E1E]/95 opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-6 z-10">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-[#FFC400]/5 skew-x-[-45deg] translate-x-12 -translate-y-12" />
                    
                    <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                      
                      {/* Flag and Nationality */}
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-lg select-none leading-none">{flag}</span>
                        <span className="text-slate-400 font-syncopate text-[9px] tracking-widest uppercase">{player.nationality || 'Saudi Arabia'}</span>
                      </div>

                      <h3 className="font-syncopate text-3xl font-black text-white uppercase tracking-tighter leading-none mb-1">{player.nickname}</h3>
                      <p className="text-[#FFC400] font-syncopate text-[9px] tracking-[0.3em] uppercase font-black mb-4">{player.role}</p>
                      
                      {/* Top Achievement display */}
                      <div className="border-t border-slate-800/80 pt-4 mb-6">
                        <span className="text-slate-500 font-syncopate text-[7px] tracking-widest block uppercase mb-1">TOP ACHIEVEMENT</span>
                        <p className="text-slate-300 font-inter text-xs font-semibold leading-tight line-clamp-2 uppercase">{topAchievement}</p>
                      </div>

                      {/* CTA */}
                      <div className="flex items-center justify-between text-[#FFC400] font-syncopate text-[8px] font-black tracking-[0.3em] uppercase pt-4 border-t border-slate-900">
                        <span>VIEW OPERATIVE PROFILE</span>
                        <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        {/* ====================================================
            TEAM ACHIEVEMENTS SECTION
            ==================================================== */}
        <section className="py-20 border-t border-slate-800/40 mb-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-syncopate text-[#FFC400] text-[10px] tracking-[0.5em] font-black mb-2 block uppercase">TROPHY HALL</span>
              <h2 className="font-syncopate text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">TEAM ACHIEVEMENTS</h2>
            </div>
            <div className="hidden md:block h-[1px] flex-grow mx-12 bg-slate-800/80" />
            <TrophyIcon size={32} className="text-slate-700" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {team.trophies?.map((trophy, idx) => (
              <TrophyCard key={trophy.id} trophy={trophy} index={idx} />
            )) || (
              <div className="col-span-full py-16 text-center border border-dashed border-slate-800 text-slate-500 font-syncopate text-xs tracking-widest">
                NO REGISTERED TROPHIES FOR THIS UNIT
              </div>
            )}
          </div>
        </section>

        {/* ====================================================
            TEAM MEDIA SECTION
            ==================================================== */}
        <section className="py-20 border-t border-slate-800/40 mb-20">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-syncopate text-[#FFC400] text-[10px] tracking-[0.5em] font-black mb-2 block uppercase">VISUAL ARCHIVES</span>
              <h2 className="font-syncopate text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">RECENT MEDIA</h2>
            </div>
            <div className="hidden md:block h-[1px] flex-grow mx-12 bg-slate-800/80" />
            <ImageIcon size={32} className="text-slate-700" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {TEAM_MEDIA_PHOTOS.map((photo, i) => (
              <div key={i} className="aspect-video relative overflow-hidden bg-slate-950 border border-slate-800/80 group">
                <img 
                  src={photo} 
                  alt={`${team.name} Team Media Photo ${i + 1}`} 
                  className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute bottom-4 left-4 font-syncopate text-[9px] text-[#FFC400] font-black tracking-widest uppercase translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  MEDIA ARCHIVE // UNIT_{team.name.toUpperCase()}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ====================================================
            RELATED TEAMS (MORE TEAMS) SECTION
            ==================================================== */}
        <section className="py-20 border-t border-slate-800/40">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="font-syncopate text-[#FFC400] text-[10px] tracking-[0.5em] font-black mb-2 block uppercase">OTHER OPERATIONS</span>
              <h2 className="font-syncopate text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">MORE TEAMS</h2>
            </div>
            <div className="hidden md:block h-[1px] flex-grow mx-12 bg-slate-800/80" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {moreTeams.map((otherTeam, idx) => (
              <div
                key={otherTeam.id}
                onClick={() => onSwitchTeam(otherTeam.id)}
                className="group relative aspect-[4/3] bg-slate-900 border border-slate-800/80 overflow-hidden cursor-pointer transition-all duration-300 hover:border-[#FFC400] hover:shadow-[0_0_20px_rgba(255,196,0,0.1)] flex flex-col justify-end p-6"
              >
                <img
                  src={otherTeam.banner}
                  alt={otherTeam.name}
                  className="absolute inset-0 w-full h-full object-cover grayscale opacity-30 group-hover:grayscale-0 group-hover:opacity-50 transition-all duration-500 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#040E1E] to-transparent" />
                
                <div className="relative z-10">
                  <span className="bg-[#FFC400] text-black px-2 py-0.5 font-syncopate text-[8px] font-black tracking-widest uppercase inline-block mb-2">
                    {otherTeam.game}
                  </span>
                  <h3 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter leading-none mb-3">
                    {otherTeam.name}
                  </h3>
                  
                  <div className="flex items-center gap-1 text-[#FFC400] font-syncopate text-[8px] font-black tracking-widest group-hover:gap-2 transition-all">
                    <span>VIEW UNIT</span>
                    <ChevronRight size={10} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </motion.div>
  );
};

// --- Main Teams Listing Component ---
const DivisionCard: React.FC<{ team: Team; onClick: () => void; index: number }> = ({ team, onClick, index }) => {
  const topAchievement = team.trophies?.[0]?.title || 'PRO CHAMPIONSHIP SERIES';
  const rosterCount = team.players?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      whileHover={{ y: -6 }}
      onClick={onClick}
      className="group relative aspect-[4/5] bg-slate-900 border border-slate-800 overflow-hidden cursor-pointer rounded-none transition-all duration-300 hover:border-[#FFC400] hover:shadow-[0_0_30px_rgba(255,196,0,0.15)]"
    >
      <img
        src={team.banner}
        alt={team.name}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:grayscale group-hover:scale-[1.03]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#040E1E] via-[#040E1E]/60 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300" />
      
      <div className="absolute top-6 left-6 flex flex-col gap-2">
        <div className="bg-[#FFC400] text-black px-3 py-1 font-syncopate text-[9px] font-black tracking-widest uppercase inline-block w-max">
          {team.game}
        </div>
        {team.region && (
          <div className="bg-white/10 backdrop-blur-sm text-white px-3 py-1 font-syncopate text-[9px] font-bold tracking-widest uppercase inline-block w-max border border-white/10">
            {team.region}
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-6 flex flex-col justify-end">
        <h3 className="font-syncopate text-2xl md:text-3xl font-black text-white uppercase tracking-tighter leading-none mb-4">
          {team.name}
        </h3>
        
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center gap-1.5 text-[#FFC400]">
            <TrophyIcon size={12} className="shrink-0" />
            <span className="font-syncopate text-[8px] tracking-wider uppercase line-clamp-1">{topAchievement}</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-400">
            <UsersIcon size={12} className="shrink-0" />
            <span className="font-syncopate text-[8px] tracking-wider uppercase">{rosterCount} ACTIVE OPERATIVES</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <div className="flex flex-col">
            <span className="text-white font-syncopate text-[9px] font-bold uppercase">{team.league || 'PRO DIVISION'}</span>
          </div>
          <div className="flex items-center gap-2 text-[#FFC400] font-syncopate text-[8px] font-black tracking-widest group-hover:gap-3 transition-all">
            <span>VIEW TEAM</span>
            <ChevronRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const CreatorCard: React.FC<{ creator: Creator; index: number }> = ({ creator, index }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.05, duration: 0.5 }}
      className="group relative aspect-[2/3] bg-slate-900 border border-slate-800 overflow-hidden cursor-pointer rounded-none transition-all duration-300 hover:border-[#FFC400] hover:shadow-[0_0_30px_rgba(255,196,0,0.15)]"
    >
      <img
        src={creator.photo}
        alt={creator.nickname}
        className="absolute inset-0 w-full h-full object-cover transition-all duration-500 ease-in-out group-hover:grayscale group-hover:scale-[1.04]"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-[#040E1E] via-[#040E1E]/40 to-transparent opacity-90 group-hover:opacity-95 transition-opacity duration-300" />
      
      <div className="absolute bottom-0 left-0 right-0 p-8">
        <h3 className="font-syncopate text-3xl font-black text-white uppercase mb-2 tracking-tighter">{creator.nickname}</h3>
        <p className="text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-6">{creator.metrics.followers} FOLLOWERS</p>
        
        <div className="flex gap-4 mb-6 relative z-20">
          {creator.platforms.map((p, i) => (
            <div key={i} className="relative group/icon">
              <a 
                href={p.url} 
                target="_blank" 
                rel="noreferrer"
                className="text-slate-500 hover:text-[#FFC400] transition-colors"
                onClick={(e) => e.stopPropagation()}
              >
                <SocialFollowerIcon 
                  platform={p.type} 
                  count={p.handle}
                  className="text-slate-500"
                />
              </a>
            </div>
          ))}
        </div>

        <div className="h-0 overflow-hidden group-hover:h-auto opacity-0 group-hover:opacity-100 transition-all duration-300 ease-out">
          <div className="pt-4 border-t border-white/10 space-y-4">
            <div>
              <p className="text-[#FFC400] font-syncopate text-sm font-black uppercase">{creator.metrics.totalReach}</p>
            </div>
            <div>
              <p className="text-white text-[10px] font-bold uppercase leading-tight">{creator.focus}</p>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const Teams = () => {
  const { teamId } = useParams<{ teamId?: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const selectedTeamId = useMemo(() => {
    return teamId || searchParams.get('id') || null;
  }, [teamId, searchParams]);

  const selectedTeam = useMemo(() => 
    MOCK_TEAMS.find(t => t.id === selectedTeamId) || null,
    [selectedTeamId]
  );

  const directorySchema = useMemo(() => {
    return MOCK_TEAMS.map(t => {
      const teamPlayers = t.players.map(p => ({
        nickname: p.nickname,
        role: p.role,
        url: `https://geekayesports.com/players/${p.nickname.toLowerCase()}`
      }));
      return generateSportsTeamSchema(t.name, teamPlayers, t.region, t.logo, t.achievements);
    });
  }, []);

  const handleSelectTeam = (id: string | null) => {
    if (id) {
      navigate(`/teams/${id}`);
    } else {
      navigate('/teams');
    }
  };

  return (
    <div className="min-h-screen bg-[#081B3A] selection:bg-[#FFC400] selection:text-black">
      <AnimatePresence mode="wait">
        {!selectedTeam ? (
          <motion.div 
            key="war-room-listing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <SEOMeta 
              title="Geekay Esports Rosters - Professional Gaming Divisions"
              description="Explore the official professional rosters of Geekay Esports. Elite multi-division teams competing in Rocket League, PUBG Mobile, Overwatch, Honor of Kings, and Fortnite."
              ogType="website"
              schemas={directorySchema}
            />
            {/* ⚔ DIVISION GRID — “ACTIVE TEAMS” */}
            <section className="py-24 md:py-32 px-6 bg-[#081B3A] relative border-b border-white/5 pt-36">
              <div className="max-w-7xl mx-auto">
                <Breadcrumbs />
                <div className="mb-16 flex items-end justify-between">
                  <div className="max-w-2xl">
                    <h2 className="font-syncopate text-[#FFC400] text-[10px] tracking-[0.5em] font-black mb-2 block uppercase">ELITE DIVISIONS</h2>
                    <h1 className="font-syncopate text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.85]">
                      GEEKAY ESPORTS <br /> <span className="text-[#FFC400]">ROSTERS</span>
                    </h1>
                  </div>
                  <div className="hidden md:block h-[1px] flex-grow mx-20 bg-slate-800" />
                </div>

                <div className="mb-8">
                  <h2 className="font-syncopate text-lg font-black text-slate-400 uppercase tracking-widest">ACTIVE ROSTERS</h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {MOCK_TEAMS.map((team, idx) => (
                    <DivisionCard 
                      key={team.id} 
                      team={team} 
                      index={idx} 
                      onClick={() => handleSelectTeam(team.id)} 
                    />
                  ))}
                </div>
              </div>
            </section>

            {/* 🎬 CONTENT CREATORS SECTION */}
            <section className="py-32 md:py-48 px-6 bg-[#081B3A] relative border-b border-white/5">
              <div className="max-w-7xl mx-auto">
                <div className="mb-24">
                  <span className="font-syncopate text-[#FFC400] text-[10px] tracking-[0.5em] font-black mb-2 block uppercase">INFLUENCERS</span>
                  <h2 className="font-syncopate text-4xl md:text-7xl font-bold uppercase tracking-tighter text-white leading-[0.85] mb-6">
                    CONTENT <br /> <span className="text-[#FFC400]">CREATORS</span>
                  </h2>
                  <p className="text-slate-400 font-inter text-xl font-light tracking-wide max-w-2xl uppercase">
                    Creators representing the Geekay brand across platforms.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {MOCK_CREATORS.map((creator, idx) => (
                    <CreatorCard key={creator.id} creator={creator} index={idx} />
                  ))}
                </div>
              </div>
            </section>
          </motion.div>
        ) : (
          <div className="relative">
            <div className="absolute top-32 left-0 right-0 z-50">
              <Breadcrumbs />
            </div>
            <TeamDetail 
              key="team-detail-view"
              team={selectedTeam} 
              onBack={() => {
                handleSelectTeam(null);
                window.scrollTo(0, 0);
              }} 
              onSwitchTeam={(id) => {
                handleSelectTeam(id);
                window.scrollTo(0, 0);
              }}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Teams;

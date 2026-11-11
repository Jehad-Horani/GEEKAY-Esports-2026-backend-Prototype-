
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { ChevronRight, ChevronDown, PlayCircle, Search, BarChart3, Globe, Shield, X, Twitter, Twitch, Cpu, Target, Layers, Zap, ArrowDown, ArrowRight, Clock, Calendar, MapPin, Trophy, Instagram, Youtube, Radio, Tv, ExternalLink } from 'lucide-react';
import SocialFollowerIcon from '../components/SocialFollowerIcon';
import ArenaButton from '../components/ui/ArenaButton';
import { MOCK_EVENTS, MOCK_TEAMS, MOCK_NEWS, MOCK_PRODUCTS } from '../constants';
import { Link } from 'react-router-dom';
import { Player, NewsItem, Product } from '../types';
import SEOMeta from '../components/SEOMeta';
import { getDynamicStatus, getMatchDynamicStatus, cleanOpponentName, getMatchResult, formatMatchLocalDateTime, detectBroadcastPlatform } from '../src/utils/dateStatus';
import { getEventSlug } from './Schedule';
import { getEventPaletteColor } from '../src/utils/eventPalette';

const safeFetchJson = async (url: string) => {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const contentType = res.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await res.json();
    }
    return null;
  } catch {
    return null;
  }
};

// --- Components ---

const ShopDropdown = ({ variant = "primary", className = "" }: { variant?: "primary" | "outline", className?: string }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileRegions, setShowMobileRegions] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(localStorage.getItem('geekay_region'));

  const regions = [
    { name: 'UAE', link: 'https://www.geekay.com/en/', sub: 'Official Store' },
    { name: 'KSA', link: 'https://www.geekay.com/saudi_en/', sub: 'Official Store' },
    { name: 'GLOBAL', link: 'https://www.geekay.com/global/', sub: 'Official Store' },
  ];

  const handleRegionSelect = (name: string, link: string) => {
    localStorage.setItem('geekay_region', name);
    setSelectedRegion(name);
    window.open(link, '_blank');
    setIsOpen(false);
    setShowMobileRegions(false);
  };

  const buttonText = 'SHOP';

  return (
    <div className={`relative ${className}`}>
      {/* Desktop Dropdown */}
      <div 
        className="hidden lg:block relative z-[50]"
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
      >
        <ArenaButton 
          variant={variant}
          className="h-12 md:h-14 min-w-[180px] md:min-w-[220px] text-xs md:text-sm px-6"
          onClick={() => setIsOpen(!isOpen)}
          icon={<ChevronDown size={16} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />}
        >
          {buttonText}
        </ArenaButton>
        
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              className="absolute top-full left-0 mt-2 w-full bg-[#0A1A31]/95 backdrop-blur-xl border border-[#FFC400]/30 z-[1000] shadow-2xl rounded-sm overflow-hidden"
            >
              <div className="p-1">
                {regions.map((region) => (
                  <button 
                    key={region.name}
                    onClick={() => handleRegionSelect(region.name, region.link)}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#FFC400]/10 text-white font-syncopate text-[10px] tracking-widest transition-all group/item border-b border-white/5 last:border-0"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold group-hover:text-[#FFC400] transition-colors">{region.name}</span>
                      <span className="text-[8px] text-white/40 tracking-normal">{region.sub}</span>
                    </div>
                    <ArrowRight size={12} className="opacity-0 group-hover:opacity-100 group-hover:text-[#FFC400] transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile Button */}
      <div className="lg:hidden">
        <ArenaButton 
          variant={variant}
          className="h-12 md:h-14 w-full min-w-[180px] text-xs md:text-sm px-6"
          onClick={() => setShowMobileRegions(true)}
          icon={<ChevronDown size={16} />}
        >
          {buttonText}
        </ArenaButton>
      </div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {showMobileRegions && (
          <div className="fixed inset-0 z-[1000] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileRegions(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="absolute bottom-0 left-0 w-full bg-[#0A1A31] border-t border-[#FFC400]/30 p-8 rounded-t-3xl"
            >
              <div className="w-12 h-1.5 bg-white/10 rounded-full mx-auto mb-8" />
              <h3 className="font-syncopate text-lg font-black text-white uppercase mb-2">SELECT REGION</h3>
              <p className="text-white/40 font-syncopate text-[10px] tracking-widest uppercase mb-8">Choose your official Geekay store</p>
              
              <div className="space-y-3">
                {regions.map((r) => (
                  <button
                    key={r.name}
                    onClick={() => handleRegionSelect(r.name, r.link)}
                    className="w-full py-5 border border-white/10 active:border-[#FFC400] active:bg-[#FFC400]/10 text-white font-syncopate text-xs tracking-widest transition-all flex items-center justify-between px-6"
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-bold">{r.name}</span>
                      <span className="text-[8px] text-white/40 tracking-normal">{r.sub}</span>
                    </div>
                    <ArrowRight size={16} className="text-[#FFC400]" />
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => setShowMobileRegions(false)}
                className="w-full mt-6 py-4 text-white/40 font-syncopate text-[10px] tracking-widest uppercase"
              >
                CANCEL
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

const RadarDots = () => {
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-20">
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
          animate={{ 
            opacity: [0, 0.5, 0],
            scale: [0.5, 1.2, 0.8],
          }}
          transition={{ 
            duration: 3 + Math.random() * 5, 
            repeat: Infinity, 
            delay: Math.random() * 5 
          }}
          className="absolute w-1 h-1 bg-[#FFC400] rounded-full"
        />
      ))}
    </div>
  );
};

const ScanLine = () => (
  <motion.div
    initial={{ top: '-10%' }}
    animate={{ top: '110%' }}
    transition={{ duration: 1.5, ease: "linear", repeat: 0 }}
    className="absolute left-0 w-full h-[2px] bg-[#FFC400]/30 z-[60] pointer-events-none blur-sm"
  />
);

const TacticalLines = () => (
  <div className="absolute inset-0 z-0 pointer-events-none opacity-10">
    <motion.div 
      animate={{ x: [-20, 20, -20] }}
      transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      className="absolute top-[20%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent" 
    />
    <motion.div 
      animate={{ x: [20, -20, 20] }}
      transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      className="absolute bottom-[30%] left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent" 
    />
  </div>
);

const Shockwave = ({ trigger }: { trigger: boolean }) => (
  <AnimatePresence>
    {trigger && (
      <motion.div
        initial={{ scale: 0.5, opacity: 1 }}
        animate={{ scale: 3, opacity: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 border-2 border-[#FFC400] rounded-full z-0"
      />
    )}
  </AnimatePresence>
);

const Hero = ({ events = [] }: { events?: any[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Mouse parallax movement
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const handleMouseMove = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    const { innerWidth, innerHeight } = window;
    const x = (clientX / innerWidth - 0.5) * 20;
    const y = (clientY / innerHeight - 0.5) * 20;
    setMousePos({ x, y });
  };

  const { upcomingMatches, pastResults, hasLiveMatch } = useMemo(() => {
    const upcomingList: any[] = [];
    const pastList: any[] = [];
    let liveFound = false;

    if (Array.isArray(events) && events.length > 0) {
      events.forEach((ev: any) => {
        const eventId = ev.id;
        const eventTitle = ev.title || 'GEEKAY TOURNAMENT';
        const eventSlug = getEventSlug(ev.title) || String(ev.id);
        const eventBroadcast = ev.broadcast || ev.broadcast_platforms || '';
        const eventLink = ev.link || '';

        let parsedMatches: any[] = [];
        if (typeof ev.matches === 'string') {
          try { parsedMatches = JSON.parse(ev.matches); } catch {}
        } else if (Array.isArray(ev.matches)) {
          parsedMatches = ev.matches;
        }

        const eventColor = getEventPaletteColor(ev.title || ev.id);

        if (parsedMatches.length > 0) {
          parsedMatches.forEach((m: any) => {
            const mDate = m.date || ev.start_date || '';
            const mTime = m.time || ev.time || '';
            const dynStatus = getMatchDynamicStatus(m, ev.start_date);
            const dt = formatMatchLocalDateTime(mDate, mTime, m.timezone || ev.timezone);
            const broadcastInfo = detectBroadcastPlatform(m.broadcast || eventBroadcast, m.stream_url || m.link || eventLink);

            if (dynStatus === 'live' || dynStatus === 'upcoming') {
              if (dynStatus === 'live') liveFound = true;
              upcomingList.push({
                eventId,
                eventSlug,
                eventTitle,
                eventColor,
                game: String(ev.game || 'ESPORTS').toUpperCase(),
                opp: cleanOpponentName(m.teams || ev.title),
                rawDate: mDate,
                rawTime: mTime,
                localDate: dt.formattedDate,
                localTime: dt.formattedTime,
                fullDisplay: dt.fullDisplay,
                timestamp: dt.timestamp,
                status: dynStatus,
                broadcast: broadcastInfo,
                sortKey: mDate || '9999-99-99'
              });
            } else {
              const res = getMatchResult(m);
              pastList.push({
                eventId,
                eventSlug,
                eventTitle,
                eventColor,
                game: String(ev.game || 'ESPORTS').toUpperCase(),
                opp: cleanOpponentName(m.teams || ev.title),
                res: res.resText,
                score: res.score,
                date: dt.formattedDate || mDate,
                timestamp: dt.timestamp,
                sortKey: mDate || '0000-00-00'
              });
            }
          });
        } else {
          const evDate = ev.start_date || '';
          const evTime = ev.time || '';
          const dynStatus = getDynamicStatus(evDate, ev.end_date, evTime, ev.status);
          const dt = formatMatchLocalDateTime(evDate, evTime, ev.timezone);
          const broadcastInfo = detectBroadcastPlatform(eventBroadcast, eventLink);

          if (dynStatus === 'live' || dynStatus === 'upcoming') {
            if (dynStatus === 'live') liveFound = true;
            upcomingList.push({
              eventId,
              eventSlug,
              eventTitle,
              eventColor,
              game: String(ev.game || 'ESPORTS').toUpperCase(),
              opp: cleanOpponentName(ev.title || ev.organizer),
              rawDate: evDate,
              rawTime: evTime,
              localDate: dt.formattedDate,
              localTime: dt.formattedTime,
              fullDisplay: dt.fullDisplay,
              timestamp: dt.timestamp,
              status: dynStatus,
              broadcast: broadcastInfo,
              sortKey: evDate || '9999-99-99'
            });
          } else {
            let resObj: any = {};
            if (typeof ev.results === 'string') {
              try { resObj = JSON.parse(ev.results); } catch {}
            } else if (typeof ev.results === 'object' && ev.results) {
              resObj = ev.results;
            }
            const res = getMatchResult(resObj);
            pastList.push({
              eventId,
              eventSlug,
              eventTitle,
              eventColor,
              game: String(ev.game || 'ESPORTS').toUpperCase(),
              opp: cleanOpponentName(ev.title || 'REGIONAL FINALS'),
              res: res.resText,
              score: res.score,
              date: dt.formattedDate || evDate,
              timestamp: dt.timestamp,
              sortKey: evDate || '0000-00-00'
            });
          }
        }
      });
    }

    // Sort upcoming: live matches first, then chronological order (nearest/earliest date & time first)
    upcomingList.sort((a, b) => {
      if (a.status === 'live' && b.status !== 'live') return -1;
      if (b.status === 'live' && a.status !== 'live') return 1;
      if (a.timestamp && b.timestamp && a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }
      return a.sortKey.localeCompare(b.sortKey);
    });

    // Sort past results: reverse chronological order (most recently completed match first)
    pastList.sort((a, b) => {
      if (a.timestamp && b.timestamp && a.timestamp !== b.timestamp) {
        return b.timestamp - a.timestamp;
      }
      return b.sortKey.localeCompare(a.sortKey);
    });

    // Display all upcoming matches (including Osaka event)
    const finalPastResults = pastList.slice(0, 5);
    const finalUpcomingMatches = upcomingList;

    return {
      upcomingMatches: finalUpcomingMatches,
      pastResults: finalPastResults,
      hasLiveMatch: liveFound
    };
  }, [events]);

  return (
    <section 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="relative min-h-[280px] md:min-h-[320px] flex items-center justify-center bg-[#0B1C2D] z-40 pt-[100px] pb-[40px] md:pt-[120px] md:pb-[60px] border-t border-white/5 border-b-2 border-[#FFC400]/10 overflow-visible"
    >
      <RadarDots />
      
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid opacity-[0.05] z-0 pointer-events-none" />
      
      {/* Ambient Gradient Glow */}
      <motion.div 
        animate={{ 
          opacity: [0.2, 0.3, 0.2],
          scale: [1, 1.05, 1] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#FFC400]/5 rounded-full blur-[120px] z-0" 
      />

      <motion.div 
        className="container mx-auto px-[20px] md:px-[60px] lg:px-[100px] relative z-[60]"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 items-center gap-8 lg:gap-24">
          
          {/* LEFT: COMPACT HEADLINE */}
          <div className="flex flex-col items-start text-left">
            <div className="relative mb-4 lg:mb-6">
              <div className="flex flex-col gap-1">
                {/* #GeekayWeGame */}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                >
                  <h1 className="font-syncopate text-2xl md:text-3xl lg:text-4xl font-black text-white uppercase tracking-tighter leading-none mb-2">
                    Geekay <span className="text-[#FFC400]">Esports</span>
                  </h1>
                  <h2 className="font-syncopate text-[10px] md:text-xs font-black text-white/50 tracking-[0.3em] uppercase block">
                    Professional Esports Organization
                  </h2>
                </motion.div>
 
                {/* EST 2021 */}
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                  className="flex items-center gap-3 mt-4"
                >
                  <div className="w-6 h-[1px] bg-[#FFC400]/60" />
                  <span className="font-syncopate text-[9px] font-bold text-[#FFC400] tracking-[0.3em] uppercase">
                    EST 2021 // #WEGAME
                  </span>
                </motion.div>
              </div>
            </div>
 
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className="flex flex-col sm:flex-row gap-3"
            >
              <ShopDropdown />
 
              <Link to="/events">
                <ArenaButton variant="outline" className="h-10 md:h-12 min-w-[150px] md:min-w-[180px] text-[10px] md:text-xs px-4" icon={<Calendar size={14} />}>
                  EVENTS
                </ArenaButton>
              </Link>
            </motion.div>
          </div>

          {/* RIGHT: Compact Match Panel (Only displayed when there is real data in the database) */}
          {(upcomingMatches.length > 0 || pastResults.length > 0) && (
            <div className="hidden lg:flex items-center justify-center relative z-10">
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="w-full max-w-md space-y-4"
              >
                {/* Upcoming / Live Matches - Interactive & Clickable with Local Time & Broadcast */}
                {upcomingMatches.length > 0 && (
                  <div className="bg-[#0A1A31]/60 backdrop-blur-md border border-[#FFC400]/20 p-4 relative overflow-hidden group">
                    <div className="absolute top-0 left-0 w-1 h-full bg-[#FFC400]/50" />
                    <h3 className="font-syncopate text-[8px] font-black text-[#FFC400] tracking-[0.4em] uppercase mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className={`w-1.5 h-1.5 rounded-full ${hasLiveMatch ? 'bg-red-500 animate-ping' : 'bg-[#FFC400] animate-pulse'}`} />
                        <span>{hasLiveMatch ? 'LIVE & UPCOMING MATCHES' : 'UPCOMING MATCHES'}</span>
                      </div>
                      {hasLiveMatch && (
                        <span className="px-1.5 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 text-[7px] font-bold rounded animate-pulse">
                          ● LIVE NOW
                        </span>
                      )}
                    </h3>
                    
                    <div className="space-y-2">
                      {upcomingMatches.map((match, i) => (
                        <Link 
                          key={i} 
                          to={`/events/${match.eventSlug || match.eventId}`}
                          title={`View details for ${match.eventTitle || match.game}`}
                          className="group/item flex items-center justify-between border-b border-white/5 py-2 px-1.5 -mx-1.5 rounded hover:bg-white/[0.04] transition-all cursor-pointer last:border-0 last:pb-0 block"
                        >
                          <div className="min-w-0 pr-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span 
                                style={{ 
                                  color: match.eventColor?.hex || '#FFC400',
                                  borderColor: match.eventColor ? `${match.eventColor.hex}40` : 'rgba(255, 196, 0, 0.3)',
                                  backgroundColor: match.eventColor ? `${match.eventColor.hex}15` : 'rgba(255, 196, 0, 0.08)'
                                }}
                                className="font-syncopate text-[7px] font-bold tracking-widest px-1.5 py-0.5 rounded border transition-colors"
                              >
                                {match.game}
                              </span>
                              {match.status === 'live' && (
                                <span className="inline-flex items-center gap-1 px-1 py-0.2 bg-red-500/20 text-red-400 font-mono text-[6px] font-bold rounded">
                                  <span className="w-1 h-1 bg-red-500 rounded-full animate-ping" />
                                  LIVE
                                </span>
                              )}
                              {/* Broadcast Platform Icon & Direct Stream Link */}
                              {match.broadcast && match.broadcast.platform !== 'none' && (
                                match.broadcast.url ? (
                                  <span
                                    role="button"
                                    tabIndex={0}
                                    onClick={(e) => {
                                      e.preventDefault();
                                      e.stopPropagation();
                                      window.open(match.broadcast.url, '_blank', 'noopener,noreferrer');
                                    }}
                                    title={`Watch live stream on ${match.broadcast.label}`}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 hover:bg-[#FFC400]/20 text-slate-300 hover:text-[#FFC400] border border-white/10 hover:border-[#FFC400]/40 text-[6px] font-mono font-bold transition-all shrink-0 cursor-pointer"
                                  >
                                    {match.broadcast.platform === 'twitch' && <Twitch size={8} className="text-[#9146FF]" />}
                                    {match.broadcast.platform === 'youtube' && <Youtube size={8} className="text-[#FF0000]" />}
                                    {match.broadcast.platform === 'kick' && <Radio size={8} className="text-[#53FC18]" />}
                                    {match.broadcast.platform === 'stream' && <Tv size={8} className="text-[#FFC400]" />}
                                    <span className="hidden sm:inline uppercase">{match.broadcast.label}</span>
                                    <ExternalLink size={6} className="opacity-70" />
                                  </span>
                                ) : (
                                  <span
                                    title={`Broadcast on ${match.broadcast.label}`}
                                    className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/5 text-slate-400 border border-white/10 text-[6px] font-mono font-bold shrink-0"
                                  >
                                    {match.broadcast.platform === 'twitch' && <Twitch size={8} className="text-[#9146FF]" />}
                                    {match.broadcast.platform === 'youtube' && <Youtube size={8} className="text-[#FF0000]" />}
                                    {match.broadcast.platform === 'kick' && <Radio size={8} className="text-[#53FC18]" />}
                                    {match.broadcast.platform === 'stream' && <Tv size={8} className="text-[#FFC400]" />}
                                    <span className="hidden sm:inline uppercase">{match.broadcast.label}</span>
                                  </span>
                                )
                              )}
                            </div>
                            <div className="text-white font-syncopate text-[10px] font-black tracking-tight truncate group-hover/item:text-[#FFC400] transition-colors mt-0.5">
                              {match.opp}
                            </div>
                          </div>

                          {/* Local Time & Unambiguous Date */}
                          <div 
                            className="text-right shrink-0 flex flex-col items-end pl-2"
                            title={`Local Time: ${match.fullDisplay}`}
                          >
                            <div className="text-white/80 font-syncopate text-[8px] tracking-wider font-bold group-hover/item:text-white transition-colors">
                              {match.localDate}
                            </div>
                            <div className="text-[#FFC400]/90 font-mono text-[7px] tracking-tight flex items-center gap-1 mt-0.5">
                              <Clock size={7} className="text-[#FFC400]/70 shrink-0" />
                              <span>{match.localTime}</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Past Results - Clickable to View Tournament Details */}
                {pastResults.length > 0 && (
                  <div className="bg-[#0A1A31]/60 backdrop-blur-md border border-white/10 p-4 relative overflow-hidden group">
                    <h3 className="font-syncopate text-[8px] font-black text-white/40 tracking-[0.4em] uppercase mb-3 flex items-center justify-between">
                      <span>PAST RESULTS</span>
                      <span className="text-[7px] font-mono text-slate-500">COMPLETED</span>
                    </h3>
                    
                    <div className="space-y-2">
                      {pastResults.map((result, i) => (
                        <Link 
                          key={i} 
                          to={`/events/${result.eventSlug || result.eventId}`}
                          title={`View details for ${result.eventTitle || result.game}`}
                          className="group/item flex items-center justify-between border-b border-white/5 py-2 px-1.5 -mx-1.5 rounded hover:bg-white/[0.04] transition-all cursor-pointer last:border-0 last:pb-0 block"
                        >
                          <div>
                            <div className="flex items-center gap-2">
                              <span 
                                style={{ 
                                  color: result.eventColor?.hex || '#94A3B8',
                                  borderColor: result.eventColor ? `${result.eventColor.hex}40` : 'rgba(255, 255, 255, 0.1)',
                                  backgroundColor: result.eventColor ? `${result.eventColor.hex}15` : 'transparent'
                                }}
                                className="font-syncopate text-[7px] font-bold tracking-widest px-1.5 py-0.5 rounded border transition-colors"
                              >
                                {result.game}
                              </span>
                              {result.date && <span className="text-slate-500 text-[7px] font-mono">{result.date}</span>}
                            </div>
                            <div className="text-white/80 font-syncopate text-[10px] font-black tracking-tight group-hover/item:text-white transition-colors">
                              {result.opp}
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <div className="text-white font-syncopate text-[10px] font-black">{result.score}</div>
                            <div className={`font-syncopate text-[8px] font-black px-1.5 py-0.5 ${result.res === 'WIN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                              {result.res}
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tactical Decor */}
                <div className="absolute -top-2 -right-2 w-12 h-12 border-t border-r border-[#FFC400]/10 pointer-events-none" />
                <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b border-l border-[#FFC400]/10 pointer-events-none" />
              </motion.div>
            </div>
          )}

        </div>
      </motion.div>
      
      {/* Scroll Indicator */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 1, repeat: Infinity, repeatType: "reverse" }}
        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[70] flex flex-col items-center gap-2"
      >
        <span className="font-syncopate text-[8px] text-white/20 tracking-[0.3em] uppercase">Scroll</span>
        <div className="w-[1px] h-6 bg-gradient-to-b from-[#FFC400] to-transparent" />
      </motion.div>
    </section>
  );
};

// Helper to get formatted product price in USD
const getProductDisplayPrice = (product: Product) => {
  if (product.price) {
    return product.price.startsWith('$') ? product.price : `$${product.price}`;
  }
  return '$0.00';
};

// --- ProductCard Component ---
const ProductCard = ({ 
  product, 
  onOpenDetails 
}: { 
  product: Product; 
  onOpenDetails: (product: Product) => void;
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const displayPrice = getProductDisplayPrice(product);

  const handleBuyDirect = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.open(product.link, '_blank');
  };

  return (
    <motion.div
      className="group relative bg-[#0A1A31]/40 border border-slate-800 hover:border-[#FFC400]/40 transition-all duration-500 overflow-hidden cursor-pointer flex flex-col justify-between"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => onOpenDetails(product)}
    >
      {/* Product Image */}
      <div className="aspect-square overflow-hidden relative bg-[#061428]/60 flex items-center justify-center p-3">
        <motion.img
          src={product.image}
          alt={product.name}
          referrerPolicy="no-referrer"
          animate={{ scale: isHovered ? 1.08 : 1 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)] transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = '/assets/jersey.png';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#081B3A]/80 via-transparent to-transparent opacity-40 pointer-events-none" />
        
        {/* Quick View & Buy Overlay (Desktop) */}
        <AnimatePresence>
          {isHovered && window.innerWidth >= 1024 && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 15 }}
              className="absolute inset-0 flex flex-col items-center justify-center bg-[#081B3A]/95 backdrop-blur-md z-[50] p-4 space-y-2.5"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={handleBuyDirect}
                className="w-full py-2.5 bg-[#FFC400] text-black font-syncopate text-[9px] font-black tracking-widest transition-all uppercase flex items-center justify-center gap-2 hover:bg-yellow-400 shadow-[0_0_15px_rgba(255,196,0,0.3)]"
              >
                <span>BUY NOW ({displayPrice})</span>
                <ExternalLink size={12} />
              </button>
              <button
                type="button"
                onClick={() => onOpenDetails(product)}
                className="w-full py-2 border border-white/20 hover:border-[#FFC400] text-white/80 hover:text-[#FFC400] font-syncopate text-[8px] font-black tracking-widest transition-all uppercase"
              >
                VIEW DETAILS
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Product Info */}
      <div className="p-6 flex flex-col justify-between flex-1">
        <div>
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#FFC400] font-syncopate text-[8px] font-black tracking-widest uppercase">{product.category}</span>
            <span className="text-white/30 font-syncopate text-[7px] tracking-widest uppercase">OFFICIAL STORE</span>
          </div>
          <h4 className="font-syncopate text-sm font-bold text-white uppercase mb-4 line-clamp-2 group-hover:text-[#FFC400] transition-colors leading-snug">
            {product.name}
          </h4>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <span className="font-syncopate text-lg font-black text-white">
            {displayPrice}
          </span>
          <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#FFC400] group-hover:bg-[#FFC400]/10 transition-all">
            <ArrowRight size={14} className="text-white group-hover:text-[#FFC400]" />
          </div>
        </div>
      </div>

      {/* Corner Markers */}
      <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#FFC400]/10 group-hover:border-[#FFC400]/40 transition-colors pointer-events-none" />
    </motion.div>
  );
};

// --- ProductDetailModal ---
const ProductDetailModal: React.FC<{ 
  product: Product; 
  onClose: () => void;
}> = ({ product, onClose }) => {
  const displayPrice = getProductDisplayPrice(product);

  const handleBuy = () => {
    window.open(product.link, '_blank');
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-6 bg-[#081B3A]/95 backdrop-blur-xl"
      onClick={onClose}
    >
      <motion.div 
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.92, y: 30 }}
        className="bg-[#040E1E] border border-slate-800 w-full max-w-4xl relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.7)]"
        onClick={e => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 z-20 text-white/70 hover:text-[#FFC400] transition-colors p-2"
          aria-label="Close product details"
        >
          <X size={28} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* Product Image Section */}
          <div className="bg-[#061428] relative p-8 md:p-12 flex items-center justify-center border-b md:border-b-0 md:border-r border-slate-800/80">
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FFC400]/5 via-transparent to-transparent pointer-events-none" />
            <img 
              src={product.image} 
              alt={product.name} 
              className="max-h-[340px] w-auto object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.6)]"
              onError={(e) => {
                (e.target as HTMLImageElement).src = '/assets/jersey.png';
              }}
            />
            <div className="absolute bottom-4 left-6">
              <span className="text-[#FFC400] font-syncopate text-[9px] font-black tracking-[0.2em] uppercase">
                {product.category || 'OFFICIAL MERCHANDISE'}
              </span>
            </div>
          </div>

          {/* Product Info Section */}
          <div className="p-8 md:p-10 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-[#FFC400]/10 border border-[#FFC400]/30 text-[#FFC400] font-syncopate text-[8px] font-black tracking-widest uppercase">
                  OFFICIAL GEAR
                </span>
                <span className="text-white/40 font-syncopate text-[8px] tracking-widest uppercase">
                  CURRENCY: USD
                </span>
              </div>

              <h3 className="font-syncopate text-xl md:text-2xl font-black text-white uppercase mb-4 leading-tight">
                {product.name}
              </h3>

              {/* Price display */}
              <div className="mb-6 p-4 bg-[#081B3A]/40 border border-white/5 flex items-baseline justify-between">
                <div>
                  <span className="text-white/40 font-syncopate text-[8px] tracking-widest uppercase block mb-1">
                    PRICE (USD)
                  </span>
                  <span className="font-syncopate text-3xl font-black text-[#FFC400] tracking-tight">
                    {displayPrice}
                  </span>
                </div>
                <span className="text-white/40 font-syncopate text-[9px] tracking-wider uppercase">
                  GLOBAL PRICING
                </span>
              </div>

              {product.description && (
                <p className="text-slate-300 font-inter text-xs leading-relaxed mb-6 font-light">
                  {product.description}
                </p>
              )}
            </div>

            <div>
              <button
                type="button"
                onClick={handleBuy}
                className="w-full py-4 bg-[#FFC400] text-black font-syncopate text-xs font-black tracking-widest uppercase hover:bg-yellow-400 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(255,196,0,0.3)] group"
              >
                <span>BUY ON OFFICIAL STORE</span>
                <ExternalLink size={16} className="group-hover:translate-x-1 group-hover:-translate-y-0.5 transition-transform" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

const ShopSection = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#030C1A] border-b border-slate-900 relative z-50 overflow-visible">
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto overflow-visible relative">
        <div className="mb-12 sm:mb-20 flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-syncopate text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-4 sm:mb-6 break-words"
          >
            SHOP THE <span className="text-[#FFC400]">GEEKAY COLLECTION</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.8 }}
            viewport={{ once: true }}
            className="text-slate-300 font-syncopate text-[9px] sm:text-xs md:text-sm tracking-wider sm:tracking-[0.4em] uppercase font-light"
          >
            Official Gear. Built for Performance.
          </motion.p>
          <motion.div 
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "circOut", delay: 0.5 }}
            className="w-24 h-[2px] bg-[#FFC400] mt-8"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
          {MOCK_PRODUCTS.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
            >
              <ProductCard 
                product={product} 
                onOpenDetails={(p) => setSelectedProduct(p)}
              />
            </motion.div>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <ShopDropdown variant="outline" />
        </div>
      </div>

      {/* Product Detail Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            onClose={() => setSelectedProduct(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

// --- PlayerDetailModal ---
const PlayerDetailModal: React.FC<{ player: Player; onClose: () => void }> = ({ player, onClose }) => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-[#081B3A]/95 backdrop-blur-xl"
    onClick={onClose}
  >
    <motion.div 
      initial={{ scale: 0.9, y: 30 }}
      animate={{ scale: 1, y: 0 }}
      exit={{ scale: 0.9, y: 30 }}
      className="bg-[#040E1E] border border-slate-800 w-full max-w-5xl relative overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)]"
      onClick={e => e.stopPropagation()}
    >
      <button onClick={onClose} className="absolute top-6 right-6 z-20 text-white hover:text-[#FFC400] transition-colors">
        <X size={32} />
      </button>
      
      <div className="grid grid-cols-1 lg:grid-cols-2">
        <div className="h-[300px] lg:h-[600px] relative overflow-hidden">
          <img src={player.photo} alt={player.nickname} className="w-full h-full object-cover grayscale" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#040E1E] via-transparent to-transparent" />
          <div className="absolute bottom-6 sm:bottom-10 left-6 sm:left-10 right-6">
            <span className="text-[#FFC400] font-syncopate text-[9px] sm:text-[10px] tracking-[0.25em] sm:tracking-[0.4em] font-bold block mb-2 uppercase">{player.role}</span>
            <h2 className="font-syncopate text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black leading-none text-white break-words">{player.nickname}</h2>
          </div>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="flex gap-5 mb-10">
            {Object.entries(player.socials).map(([platform, count]) => {
              if (!count || count === '#') return null;
              const strVal = String(count);
              const href = strVal.startsWith('http') 
                ? strVal 
                : strVal.startsWith('@') 
                ? `https://${platform.toLowerCase()}.com/${strVal.replace('@', '')}`
                : `https://${platform.toLowerCase()}.com`;
              return (
                <a
                  key={platform}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover-glitch transition-transform hover:scale-110"
                >
                  <SocialFollowerIcon 
                    platform={platform} 
                    count={strVal}
                    size={24}
                    className="text-slate-400 hover:text-[#FFC400]"
                  />
                </a>
              );
            })}
          </div>

          <p className="text-slate-400 text-lg mb-12 leading-relaxed font-light">{player.bio}</p>

          <div className="grid grid-cols-2 gap-10">
            <div>
              <span className="text-slate-500 font-syncopate text-[9px] tracking-widest block mb-2 uppercase">K/D RATIO</span>
              <span className="text-4xl font-syncopate font-bold text-white">{player.stats.kd}</span>
              <div className="h-1 w-12 bg-[#FFC400] mt-3" />
            </div>
            <div>
              <span className="text-slate-500 font-syncopate text-[9px] tracking-widest block mb-2 uppercase">WIN RATE</span>
              <span className="text-4xl font-syncopate font-bold text-[#FFC400]">{player.stats.winRate}</span>
              <div className="h-1 w-12 bg-white mt-3" />
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

const AnimatedNumber: React.FC<{ value: string; className?: string }> = ({ value, className }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const targetValue = parseFloat(value.replace(/[^0-9.]/g, '')) || 0;
  const isFloat = value.includes('.');
  const suffix = value.replace(/[0-9.]/g, '');
  const nodeRef = useRef(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (isInView) {
      const duration = 1000; // 1s duration as requested
      const startTime = performance.now();

      const update = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function for smoother count-up
        const easeOutQuad = (t: number) => t * (2 - t);
        const easedProgress = easeOutQuad(progress);
        
        const current = easedProgress * targetValue;
        
        setDisplayValue(current);

        if (progress < 1) {
          requestAnimationFrame(update);
        }
      };

      requestAnimationFrame(update);
    }
  }, [isInView, targetValue]);

  return (
    <motion.span
      ref={nodeRef}
      initial={{ opacity: 0, y: 10 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      className={className || "font-syncopate text-5xl md:text-6xl lg:text-7xl font-bold text-white block tracking-tighter"}
    >
      {isFloat ? displayValue.toFixed(1) : Math.floor(displayValue)}{suffix}
    </motion.span>
  );
};

const NewsAnnouncements = ({ newsList = [] }: { newsList?: any[] }) => {
  const news = useMemo(() => {
    if (Array.isArray(newsList) && newsList.length > 0) {
      return newsList.slice(0, 3).map((item: any, idx: number) => ({
        id: item.id || `news-${idx}`,
        title: item.title,
        category: String(item.category || 'ANNOUNCEMENT').toUpperCase(),
        excerpt: item.excerpt || item.summary || (item.content ? item.content.replace(/<[^>]+>/g, '').slice(0, 140) + '...' : 'Latest update from Geekay Esports.'),
        date: item.date || item.created_at?.split('T')[0] || 'FEB 2026',
        readTime: item.read_time || '4 MIN READ',
        image: item.image || item.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
        slug: item.slug || item.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-')
      }));
    }
    return [];
  }, [newsList]);

  if (news.length === 0) return null;

  const featured = news[0]; // International Qualifications / Primary
  const others = news.slice(1); // Secondary news

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#081B3A] relative z-10 overflow-hidden border-t border-white/5 border-b border-slate-800/50">
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 sm:gap-8 mb-10 sm:mb-16">
          <div className="space-y-3 sm:space-y-4">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-[#FFC400] rounded-full inline-block" />
              <span className="font-syncopate text-[9px] sm:text-[10px] tracking-[0.25em] font-bold text-[#FFC400] uppercase">
                INTELLIGENCE FEED
              </span>
            </div>
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-syncopate text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight relative inline-block break-words"
            >
              LATEST <span className="text-[#FFC400]">NEWS</span>
              <motion.div 
                initial={{ scaleX: 0 }}
                whileInView={{ scaleX: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 1, delay: 0.5, ease: "circOut" }}
                className="absolute -bottom-2 left-0 w-full h-[2px] bg-[#FFC400] origin-left"
              />
            </motion.h2>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
          >
            <Link to="/news" className="group flex items-center gap-4 font-syncopate text-[10px] font-bold text-slate-400 hover:text-[#FFC400] transition-colors tracking-[0.2em]">
              VIEW ALL NEWS <ArrowRight size={16} className="group-hover:translate-x-2 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* News Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Featured Card (International Qualifications) */}
          <motion.div 
            initial={{ opacity: 0, y: 30, clipPath: 'inset(0 100% 0 0)' }}
            whileInView={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0 0)' }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: "circOut" }}
            className="lg:col-span-8 group relative bg-[#0A1A31] border border-slate-800 hover:border-[#FFC400]/40 transition-all duration-500 overflow-hidden h-[500px] md:h-[600px]"
          >
            <div className="absolute inset-0 overflow-hidden">
              <motion.img 
                src={featured.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'} 
                alt={featured.title} 
                onError={(e: any) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
                }}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.6 }}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#081B3A] via-[#081B3A]/60 to-transparent" />
            </div>
            
            <div className="absolute inset-0 p-8 md:p-16 flex flex-col justify-end">
              <div className="mb-6">
                <span className="bg-[#FFC400] text-black px-4 py-1 font-syncopate text-[9px] font-black tracking-widest uppercase inline-block">
                  {featured.category}
                </span>
              </div>
              
              <h3 className="font-syncopate text-3xl md:text-5xl font-bold text-white uppercase mb-6 leading-tight relative inline-block w-fit">
                {featured.title}
                <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FFC400] group-hover:w-full transition-all duration-500" />
              </h3>
              
              <p className="text-slate-300 text-sm md:text-lg mb-8 line-clamp-2 font-light max-w-2xl uppercase tracking-wide">
                {featured.excerpt}
              </p>
              
              <div className="flex items-center justify-between pt-8 border-t border-white/10">
                <div className="flex items-center gap-6 text-slate-500 font-syncopate text-[9px] tracking-widest">
                  <span>{featured.date}</span>
                  <div className="w-1 h-1 bg-slate-700 rounded-full" />
                  <span>{featured.readTime}</span>
                </div>
                <Link to={`/news/${featured.slug}`} className="flex items-center gap-3 text-[#FFC400] font-syncopate text-[9px] font-black tracking-[0.3em] uppercase group/link">
                  READ UPDATE <ArrowRight size={14} className="group-hover/link:translate-x-2 transition-transform" />
                </Link>
              </div>
            </div>

            {/* Corner Markers */}
            <div className="absolute top-0 right-0 w-12 h-12 border-t border-r border-[#FFC400]/20 group-hover:border-[#FFC400]/50 transition-colors" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b border-l border-[#FFC400]/20 group-hover:border-[#FFC400]/50 transition-colors" />
          </motion.div>

          {/* Secondary Cards */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            {others.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 30, clipPath: 'inset(0 0 0 100%)' }}
                whileInView={{ opacity: 1, x: 0, clipPath: 'inset(0 0 0 0)' }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 + (idx * 0.1), duration: 0.6, ease: "circOut" }}
                className="group relative flex flex-col bg-[#0A1A31] border border-slate-800 hover:border-[#FFC400]/40 transition-all duration-500 overflow-hidden h-[241px] md:h-[291px]"
              >
                <div className="absolute inset-0 overflow-hidden">
                  <motion.img 
                    src={item.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80'} 
                    alt={item.title} 
                    onError={(e: any) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&w=1200&q=80';
                    }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.6 }}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#081B3A] via-[#081B3A]/80 to-transparent" />
                </div>
                
                <div className="absolute inset-0 p-8 flex flex-col justify-end">
                  <div className="mb-4">
                    <span className="bg-[#FFC400] text-black px-3 py-1 font-syncopate text-[8px] font-black tracking-widest uppercase inline-block">
                      {item.category}
                    </span>
                  </div>
                  
                  <h4 className="font-syncopate text-base md:text-lg font-bold text-white uppercase mb-4 group-hover:text-[#FFC400] transition-colors line-clamp-2 relative inline-block w-fit">
                    {item.title}
                    <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FFC400] group-hover:w-full transition-all duration-500" />
                  </h4>
                  
                  <p className="text-slate-400 text-[10px] md:text-xs mb-6 line-clamp-2 font-light uppercase tracking-wide">
                    {item.excerpt}
                  </p>
                  
                  <div className="flex justify-between items-center pt-4 border-t border-white/10">
                    <span className="text-slate-500 font-syncopate text-[8px] tracking-widest">{item.date}</span>
                    <Link to={`/news/${item.slug}`} className="text-[#FFC400] font-syncopate text-[8px] font-black tracking-widest flex items-center gap-2 group/btn">
                      READ <ArrowRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>
                
                {/* Corner Markers */}
                <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#FFC400]/20 group-hover:border-[#FFC400]/50 transition-colors" />
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

const AboutSnapshot = ({ statsObj = null, teams = [] }: { statsObj?: any; teams?: any[] }) => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const leftY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const rightY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  const teamsCount = teams?.length || statsObj?.teams || 12;
  const totalChampionships = useMemo(() => {
    if (Array.isArray(teams) && teams.length > 0) {
      const sum = teams.reduce((acc, t) => acc + (Number(t.championships) || 0), 0);
      return sum > 0 ? sum : 32;
    }
    return 32;
  }, [teams]);

  const stats = [
    { label: 'GLOBAL COMMUNITY', value: '24.1M', sub: 'Active network' },
    { label: 'MAJOR WINS', value: String(totalChampionships), sub: 'S and A tier first place finishes' },
    { label: 'WIN RATE', value: '68%', sub: 'Last 100 matches' },
    { label: 'ACTIVE TEAMS', value: String(teamsCount), sub: 'Elite divisions' },
  ];

  return (
    <section ref={sectionRef} className="py-40 px-6 bg-[#081B3A] relative z-10 overflow-hidden border-t border-slate-800/50">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />
      
      {/* Animated Scanning Line */}
      <motion.div
        animate={{ top: ['-10%', '110%'] }}
        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
        className="absolute left-0 w-full h-[1px] bg-[#FFC400]/10 z-0 pointer-events-none"
      />

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[0.4fr_0.6fr] gap-16 lg:gap-24 items-center relative z-10">
        
        {/* Left Side: Content */}
        <motion.div
          style={{ y: leftY }}
          className="flex flex-col items-start"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="w-1.5 h-1.5 bg-[#FFC400] rounded-full inline-block" />
            <span className="font-syncopate text-[9px] sm:text-[10px] tracking-[0.25em] font-bold text-[#FFC400] uppercase">
              ABOUT THE FRANCHISE
            </span>
          </div>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-syncopate text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight leading-tight sm:leading-[1.1] mb-6 sm:mb-8 break-words"
          >
            WHO IS <span className="text-[#FFC400]">GEEKAY ESPORTS?</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-300 text-sm sm:text-base md:text-lg font-light leading-relaxed mb-8 sm:mb-10 max-w-md"
          >
            A premier multi-division organization dedicated to competitive excellence, 
            maintaining a relentless focus on regional dominance and international prestige.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="font-syncopate text-lg md:text-xl font-bold text-white uppercase tracking-[0.15em] border-l-4 border-[#FFC400] pl-8 py-2 bg-white/5"
          >
            “FORGED IN MENA.<br />BUILT FOR GLOBAL STAGES.”
          </motion.div>
        </motion.div>

        {/* Right Side: Stats Grid */}
        <motion.div 
          style={{ y: rightY }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full"
        >
          {/* Top 4 Boxes */}
          {stats.map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + (i * 0.1), duration: 0.6 }}
              whileHover={{ 
                y: -8, 
                backgroundColor: 'rgba(10, 26, 49, 0.9)',
                boxShadow: '0 0 30px rgba(255, 196, 0, 0.15)'
              }}
              className="bg-[#0A1A31]/40 border border-slate-800 p-10 group transition-all duration-300 relative overflow-hidden"
            >
              {/* Subtle Edge Glow on Hover */}
              <div className="absolute inset-0 border border-[#FFC400]/0 group-hover:border-[#FFC400]/20 transition-colors pointer-events-none" />
              
              <div className="mb-8">
                 <AnimatedNumber value={stat.value} />
                 <motion.div 
                    initial={{ width: 0 }}
                    whileInView={{ width: '100%' }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 1 + (i * 0.1) }}
                    className="h-[1px] bg-[#FFC400] mt-4 opacity-50"
                  />
              </div>
              
              <div className="space-y-2">
                <div className="font-syncopate text-[11px] text-white tracking-[0.3em] uppercase font-black group-hover:text-[#FFC400] transition-colors">
                  {stat.label}
                </div>
                <p className="text-slate-500 font-syncopate text-[9px] tracking-widest uppercase">
                  {stat.sub}
                </p>
              </div>

              {/* Tactical Corner Marker */}
              <div className="absolute top-0 right-0 w-6 h-6 border-t border-r border-[#FFC400]/10 group-hover:border-[#FFC400]/30 transition-colors" />
            </motion.div>
          ))}

         
        </motion.div>

      </div>
    </section>
  );
};

const LiveOperationsHighlight = ({ events = [] }: { events?: any[] }) => {
  const upcomingMatches = useMemo(() => {
    if (Array.isArray(events) && events.length > 0) {
      const matchesList: any[] = [];
      events.forEach((ev: any) => {
        const evSlug = getEventSlug(ev.title) || String(ev.id);
        let parsedMatches: any[] = [];
        const eventColor = getEventPaletteColor(ev.title || ev.id);

        if (typeof ev.matches === 'string') {
          try { parsedMatches = JSON.parse(ev.matches); } catch {}
        } else if (Array.isArray(ev.matches)) {
          parsedMatches = ev.matches;
        }

        if (parsedMatches.length > 0) {
          parsedMatches.forEach((m: any) => {
            const mDate = m.date || ev.start_date || '';
            const mTime = m.time || ev.time || '';
            const mLink = m.link || m.url || ev.stream_url || ev.link || '';
            const dynStatus = getMatchDynamicStatus(m, ev.start_date);
            const dt = formatMatchLocalDateTime(mDate, mTime, m.timezone || ev.timezone);

            if (dynStatus === 'upcoming' || dynStatus === 'live') {
              matchesList.push({
                id: `${ev.id}-${m.teams || mDate}-${mTime}`,
                game: String(ev.game || 'ESPORTS').toUpperCase(),
                title: ev.title,
                eventSlug: evSlug,
                opponent: cleanOpponentName(m.teams || ev.organizer || 'GLOBAL CONTENDERS'),
                date: dt.formattedDate || mDate || 'TBD',
                time: dt.formattedTime || mTime,
                link: mLink,
                region: ev.region || 'GLOBAL',
                status: dynStatus,
                countdown: dynStatus === 'live' ? 'LIVE NOW' : 'UPCOMING',
                sortKey: mDate || '9999-99-99',
                timestamp: dt.timestamp,
                eventColor
              });
            }
          });
        } else {
          const evDate = ev.start_date || '';
          const evTime = ev.time || '';
          const evLink = ev.stream_url || ev.link || '';
          const dynStatus = getDynamicStatus(evDate, ev.end_date, evTime, ev.status, ev.matches);
          const dt = formatMatchLocalDateTime(evDate, evTime, ev.timezone);

          if (dynStatus === 'upcoming' || dynStatus === 'live') {
            matchesList.push({
              id: ev.id,
              game: String(ev.game || 'ESPORTS').toUpperCase(),
              title: ev.title,
              eventSlug: evSlug,
              opponent: cleanOpponentName(ev.organizer || 'GLOBAL CONTENDERS'),
              date: dt.formattedDate || evDate || 'TBD',
              time: dt.formattedTime || evTime,
              link: evLink,
              region: ev.region || 'GLOBAL',
              status: dynStatus,
              countdown: dynStatus === 'live' ? 'LIVE NOW' : 'UPCOMING',
              sortKey: evDate || '9999-99-99',
              timestamp: dt.timestamp,
              eventColor
            });
          }
        }
      });

      // Sort upcoming matches chronologically: nearest match first
      matchesList.sort((a, b) => {
        if (a.status === 'live' && b.status !== 'live') return -1;
        if (b.status === 'live' && a.status !== 'live') return 1;
        if (a.timestamp && b.timestamp && a.timestamp !== b.timestamp) {
          return a.timestamp - b.timestamp;
        }
        return a.sortKey.localeCompare(b.sortKey);
      });

      // Return all upcoming matches without artificial truncation
      return matchesList;
    }
    return [];
  }, [events]);

  const featuredTournament = useMemo(() => {
    if (Array.isArray(events) && events.length > 0) {
      // 1. First priority: Event explicitly marked as featured by admin
      let feat = events.find((e: any) => Number(e.featured) === 1 || e.featured === true || e.featured === '1');
      
      // 2. Intelligent fallback if no event is explicitly featured: Live -> Upcoming -> First Available
      if (!feat) {
        feat = events.find((e: any) => {
          const s = getDynamicStatus(e.start_date, e.end_date, e.time, e.status, e.matches);
          return s === 'live';
        }) || events.find((e: any) => {
          const s = getDynamicStatus(e.start_date, e.end_date, e.time, e.status, e.matches);
          return s === 'upcoming';
        }) || events[0];
      }

      if (!feat) return null;

      const featStatus = getDynamicStatus(feat.start_date, feat.end_date, feat.time, feat.status, feat.matches);
      return {
        id: feat.id,
        slug: getEventSlug(feat.title) || String(feat.id),
        title: feat.title,
        game: String(feat.game || 'ESPORTS').toUpperCase(),
        dynStatus: featStatus,
        statusText: featStatus === 'completed' ? 'FINISHED' : (featStatus === 'live' ? 'LIVE NOW' : 'UPCOMING'),
        date: feat.start_date || '2026-11-05',
        location: feat.region || feat.organizer || 'GLOBAL',
        prizePool: feat.prize_pool || '$18,000,000',
        image: feat.banner || feat.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600'
      };
    }
    return null;
  }, [events]);

  if (upcomingMatches.length === 0 && !featuredTournament) return null;

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#081B3A] relative z-10 overflow-hidden border-t border-slate-800/50">
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-10 sm:mb-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-[#FFC400] rounded-full inline-block" />
            <span className="font-syncopate text-[9px] sm:text-[10px] tracking-[0.25em] font-bold text-[#FFC400] uppercase">
              COMPETITIVE CALENDAR
            </span>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-syncopate text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-3 sm:mb-4 break-words"
          >
            UPCOMING <span className="text-[#FFC400]">MATCHES</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.8 }}
            viewport={{ once: true }}
            className="text-slate-300 font-syncopate text-[9px] sm:text-[10px] tracking-wider sm:tracking-[0.2em] uppercase"
          >
            Upcoming matches and featured tournaments.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Upcoming Matches */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-syncopate text-xs font-bold text-white/40 tracking-[0.3em] uppercase mb-8">UPCOMING MATCHES</h3>
            {upcomingMatches.map((match, idx) => {
              const colorHex = match.eventColor?.hex || '#FFC400';
              const badgeBg = match.eventColor?.badgeBg || 'rgba(255,196,0,0.15)';
              const colorGlow = match.eventColor?.glow || 'rgba(255,196,0,0.2)';

              return (
                <motion.div
                  key={match.id}
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.05 }}
                  whileHover={{ y: -4, borderColor: colorHex }}
                  onClick={() => {
                    if (match.link) {
                      window.open(match.link, '_blank', 'noopener,noreferrer');
                    }
                  }}
                  style={{
                    borderColor: `${colorHex}40`,
                    boxShadow: `0 0 15px ${colorGlow}`
                  }}
                  className={`group relative bg-[#0A1A31]/60 border p-4 sm:p-6 md:p-7 transition-all overflow-hidden ${
                    match.link ? 'cursor-pointer hover:bg-[#0A2045]/60' : ''
                  }`}
                >
                  {/* Left tournament color accent bar */}
                  <div 
                    className="absolute top-0 left-0 w-1.5 h-full"
                    style={{ backgroundColor: colorHex }}
                  />

                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6 pl-2">
                    <div className="space-y-2 sm:space-y-3 flex-1 min-w-0 w-full sm:w-auto">
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-syncopate text-[9px] font-black tracking-widest uppercase px-2 py-0.5 border"
                          style={{
                            color: colorHex,
                            backgroundColor: badgeBg,
                            borderColor: `${colorHex}40`
                          }}
                        >
                          {match.game}
                        </span>
                        {match.status === 'live' && (
                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-500/20 text-red-400 border border-red-500/30 font-syncopate text-[7px] font-bold rounded">
                            <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-ping" />
                            LIVE
                          </span>
                        )}
                      </div>
                      <div className="space-y-1">
                        <h4 className="font-syncopate text-sm sm:text-base md:text-lg font-black text-white uppercase break-words leading-snug">
                          {match.title}
                        </h4>
                        <p className="text-slate-400 font-syncopate text-[10px] sm:text-[11px] font-bold tracking-wider uppercase break-words">
                          {match.opponent}
                        </p>
                      </div>
                    </div>
                    
                    <div className="w-full sm:w-auto flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800/40">
                      <div className="flex items-center gap-2 text-white font-syncopate text-[10px] sm:text-xs font-black tracking-wider bg-[#040E1E] border border-slate-800 px-3 py-1.5 whitespace-nowrap">
                        <Calendar size={13} style={{ color: colorHex }} className="shrink-0" />
                        <span className="whitespace-nowrap">{match.date}</span>
                      </div>
                      {match.time ? (
                        <div className="flex items-center gap-1.5 sm:gap-2 text-slate-400 font-syncopate text-[8px] sm:text-[9px] tracking-wider sm:tracking-widest uppercase whitespace-nowrap">
                          <Clock size={12} className="text-slate-500 shrink-0" />
                          <span>{match.time}</span>
                          {match.region && <span>// {match.region.toUpperCase()}</span>}
                        </div>
                      ) : (
                        match.region && (
                          <div className="flex items-center gap-1.5 text-slate-400 font-syncopate text-[8px] sm:text-[9px] tracking-wider sm:tracking-widest uppercase whitespace-nowrap">
                            <MapPin size={11} className="text-slate-500 shrink-0" />
                            <span className="uppercase">{match.region}</span>
                          </div>
                        )
                      )}
                    </div>
                  </div>

                  <div className="mt-4 sm:mt-6 pt-4 sm:pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 pl-2">
                    <div className="flex items-center gap-2">
                      <span 
                        className="px-2.5 py-1 font-syncopate text-[8px] sm:text-[9px] font-bold tracking-widest uppercase border"
                        style={match.status === 'live' 
                          ? { backgroundColor: 'rgba(239,68,68,0.2)', color: '#F87171', borderColor: 'rgba(239,68,68,0.3)' }
                          : { backgroundColor: badgeBg, color: colorHex, borderColor: `${colorHex}40` }
                        }
                      >
                        {match.status === 'live' ? '● LIVE OPERATION' : 'CONFIRMED SCHEDULE'}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
                      {match.link && (
                        <a
                          href={match.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          style={{ backgroundColor: colorHex }}
                          className="flex items-center gap-1.5 px-3 py-1.5 hover:bg-white text-black font-syncopate text-[8px] sm:text-[9px] font-black tracking-wider uppercase transition-all shadow-md shrink-0"
                        >
                          <span>WATCH STREAM</span>
                          <ExternalLink size={11} />
                        </a>
                      )}
                      <Link 
                        to={`/events/${match.eventSlug || getEventSlug(match.title)}`}
                        onClick={(e) => e.stopPropagation()} 
                        style={{ color: colorHex }}
                        className="group/link inline-flex items-center gap-1.5 sm:gap-2 font-syncopate text-[8px] sm:text-[9px] font-black tracking-wider sm:tracking-[0.2em] uppercase hover:text-white transition-colors shrink-0 py-1"
                      >
                        <span>VIEW DETAILS</span> 
                        <ArrowRight size={13} className="group-hover/link:translate-x-1 transition-transform shrink-0" />
                      </Link>
                    </div>
                  </div>

                  {/* Hover Border Animation */}
                  <div 
                    className="absolute top-0 right-0 w-0 h-[1px] group-hover:w-full transition-all duration-500" 
                    style={{ backgroundColor: colorHex }}
                  />
                  <div 
                    className="absolute bottom-0 left-0 w-0 h-[1px] group-hover:w-full transition-all duration-500" 
                    style={{ backgroundColor: colorHex }}
                  />
                </motion.div>
              );
            })}
          </div>

          {/* Right Column: Featured Tournament */}
          {featuredTournament && (
            <div className="lg:col-span-5">
              <h3 className="font-syncopate text-xs font-bold text-white/40 tracking-[0.3em] uppercase mb-8">FEATURED TOURNAMENT</h3>
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                whileHover={{ y: -8 }}
                className="group relative bg-[#0A1A31] border border-slate-800 hover:border-[#FFC400]/40 transition-all duration-500 overflow-hidden h-full flex flex-col"
              >
                <div className="relative aspect-video overflow-hidden">
                  <img 
                    src={featuredTournament.image} 
                    alt={featuredTournament.title} 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0A1A31] via-[#0A1A31]/40 to-transparent" />
                  <div className="absolute top-4 sm:top-6 right-4 sm:right-6">
                    <span className={`px-3 sm:px-4 py-1 font-syncopate text-[9px] sm:text-[10px] font-black tracking-widest uppercase ${
                      featuredTournament.dynStatus === 'live' 
                        ? 'bg-red-500 text-white animate-pulse' 
                        : featuredTournament.dynStatus === 'completed'
                        ? 'bg-slate-800 text-slate-300 border border-slate-700'
                        : 'bg-[#FFC400] text-black'
                    }`}>
                      {featuredTournament.statusText}
                    </span>
                  </div>
                </div>

                <div className="p-5 sm:p-8 md:p-12 flex-grow flex flex-col">
                  <div className="mb-4 sm:mb-6">
                    <span className="text-[#FFC400] font-syncopate text-[9px] sm:text-[10px] font-black tracking-widest uppercase">{featuredTournament.game}</span>
                    <h4 className="font-syncopate text-xl sm:text-2xl md:text-4xl font-bold text-white uppercase mt-2 leading-tight break-words">{featuredTournament.title}</h4>
                  </div>

                  <div className="space-y-4 sm:space-y-6 mb-8 sm:mb-12">
                    <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
                      <Calendar size={18} className="text-[#FFC400] shrink-0" />
                      <span className="font-syncopate text-xs tracking-widest uppercase">{featuredTournament.date}</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
                      <MapPin size={18} className="text-[#FFC400] shrink-0" />
                      <span className="font-syncopate text-xs tracking-widest uppercase">{featuredTournament.location}</span>
                    </div>
                    <div className="flex items-center gap-3 sm:gap-4 text-slate-300">
                      <Trophy size={18} className="text-[#FFC400] shrink-0" />
                      <span className="font-syncopate text-xs tracking-widest uppercase">PRIZE POOL: {featuredTournament.prizePool}</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Link to={`/events/${featuredTournament.slug}`}>
                      <ArenaButton className="w-full" icon={<ArrowRight size={18} />}>
                        VIEW TOURNAMENT
                      </ArenaButton>
                    </Link>
                  </div>
                </div>

                {/* Corner Markers */}
                <div className="absolute top-0 left-0 w-12 h-12 border-t border-l border-[#FFC400]/20 group-hover:border-[#FFC400]/50 transition-colors" />
                <div className="absolute bottom-0 right-0 w-12 h-12 border-b border-r border-[#FFC400]/20 group-hover:border-[#FFC400]/50 transition-colors" />
              </motion.div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

const ActiveTeamsSection = ({ teams = [] }: { teams?: any[] }) => {
  const displayTeams = useMemo(() => {
    if (Array.isArray(teams) && teams.length > 0) {
      return teams.slice(0, 4).map((t: any) => ({
        id: t.id,
        name: t.name,
        game: t.game ? String(t.game).toUpperCase() : 'ESPORTS',
        bio: t.bio || t.tagline || `Our professional ${t.game || 'esports'} squad competing in top divisions.`
      }));
    }
    return [];
  }, [teams]);

  if (displayTeams.length === 0) return null;

  return (
    <section className="py-16 sm:py-24 md:py-32 px-4 sm:px-6 md:px-12 bg-[#030C1A] relative z-10 overflow-hidden border-t border-slate-900">
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-10 sm:mb-16">
          <div className="flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 bg-[#FFC400] rounded-full inline-block" />
            <span className="font-syncopate text-[9px] sm:text-[10px] tracking-[0.25em] font-bold text-[#FFC400] uppercase">
              ELITE ROSTERS
            </span>
          </div>
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-syncopate text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tight mb-3 sm:mb-4 break-words"
          >
            ACTIVE <span className="text-[#FFC400]">TEAMS</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.8 }}
            viewport={{ once: true }}
            className="text-slate-300 font-syncopate text-[9px] sm:text-[10px] tracking-wider sm:tracking-[0.2em] uppercase"
          >
            Our elite multi-gaming professional divisions.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTeams.map((team, idx) => (
            <motion.div
              key={team.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              whileHover={{ y: -8 }}
              className="group relative bg-[#0A1A31]/40 border border-slate-800 p-8 hover:border-[#FFC400]/30 transition-all overflow-hidden flex flex-col justify-between min-h-[250px]"
            >
              <div className="absolute top-0 right-0 w-16 h-16 bg-[#FFC400]/5 skew-x-[-45deg] translate-x-8 -translate-y-8" />
              <div>
                <span className="text-[#FFC400] font-syncopate text-[9px] font-black tracking-widest uppercase mb-2 block">{team.game}</span>
                <div className="min-h-[2.5rem] flex items-center mb-3">
                  <h3 className={`font-syncopate font-black text-white uppercase tracking-tight leading-tight group-hover:text-[#FFC400] transition-colors ${
                    team.name.length > 15 
                      ? 'text-sm sm:text-base' 
                      : team.name.length > 10 
                        ? 'text-base sm:text-lg' 
                        : 'text-lg sm:text-xl'
                  }`}>
                    {team.name}
                  </h3>
                </div>
                <p className="text-slate-500 font-inter text-xs font-light leading-relaxed mb-6">{team.bio}</p>
              </div>

              <Link to={`/teams/${(team.name || team.game).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`} className="group/btn flex items-center gap-2 font-syncopate text-[9px] font-black text-[#FFC400] tracking-widest uppercase mt-4">
                VIEW ROSTER <ArrowRight size={14} className="group-hover/btn:translate-x-1.5 transition-transform" />
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

const Home = () => {
  const [dbNews, setDbNews] = useState<any[]>([]);
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [dbTeams, setDbTeams] = useState<any[]>([]);
  const [dbStats, setDbStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchHomeData = async () => {
      try {
        const [newsData, eventsData, teamsData, statsData] = await Promise.all([
          safeFetchJson('/api/news'),
          safeFetchJson('/api/events'),
          safeFetchJson('/api/teams'),
          safeFetchJson('/api/stats')
        ]);

        if (isMounted) {
          if (Array.isArray(newsData)) setDbNews(newsData);
          if (Array.isArray(eventsData)) setDbEvents(eventsData);
          if (Array.isArray(teamsData)) setDbTeams(teamsData);
          if (statsData) setDbStats(statsData);
        }
      } catch (err) {
        console.error('Failed to fetch home database content:', err);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchHomeData();

    // Listen for schedule and match updates from Admin Panel
    const handleEventsUpdated = async () => {
      try {
        const refreshedEvents = await safeFetchJson('/api/events');
        if (isMounted && Array.isArray(refreshedEvents)) {
          setDbEvents(refreshedEvents);
        }
      } catch (err) {
        console.error('Failed to sync events update:', err);
      }
    };

    window.addEventListener('geekay:events_updated', handleEventsUpdated);
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'geekay_events_updated_at') {
        handleEventsUpdated();
      }
    };
    window.addEventListener('storage', handleStorage);
    window.addEventListener('focus', handleEventsUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener('geekay:events_updated', handleEventsUpdated);
      window.removeEventListener('storage', handleStorage);
      window.removeEventListener('focus', handleEventsUpdated);
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030C1A] flex flex-col items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="relative w-20 h-20 flex items-center justify-center">
            <div className="absolute inset-0 border-4 border-[#FFC400]/20 border-t-[#FFC400] rounded-full animate-spin" />
            <div className="w-10 h-10 bg-[#FFC400]/10 rounded-full flex items-center justify-center border border-[#FFC400]/40 animate-pulse">
              <span className="font-syncopate text-[#FFC400] text-xs font-black">GK</span>
            </div>
          </div>
          <div className="flex flex-col items-center gap-2 text-center">
            <span className="font-syncopate text-[#FFC400] text-sm font-black tracking-[0.3em] uppercase animate-pulse">
              GEEKAY ESPORTS
            </span>
            <span className="font-syncopate text-slate-400 text-[10px] tracking-widest uppercase">
              LOADING SYSTEM DATA...
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="relative"
    >
      <SEOMeta 
        title="Geekay Esports - Leading Professional Esports Organization"
        description="Official portal of Geekay Esports. Dominate the virtual arenas with our elite rosters in Rocket League, PUBG Mobile, Overwatch, Honor of Kings, and Fortnite."
        ogType="website"
      />
      <Hero events={dbEvents} />
      <NewsAnnouncements newsList={dbNews} />
      <AboutSnapshot statsObj={dbStats} teams={dbTeams} />
      <ActiveTeamsSection teams={dbTeams} />
      <LiveOperationsHighlight events={dbEvents} />
      <ShopSection />
    </motion.div>
  );
};

export default Home;

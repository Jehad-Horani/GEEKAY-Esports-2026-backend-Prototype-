import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronDown, 
  MapPin, 
  Trophy, 
  ChevronRight, 
  ChevronLeft, 
  Search, 
  PlayCircle, 
  Info, 
  Calendar, 
  Radio, 
  Crosshair, 
  Clock, 
  Globe, 
  Shield,
  Swords,
  ExternalLink,
  X,
  Tv,
  Layers,
  Sparkles,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import ArenaButton from '../components/ui/ArenaButton';
import { Event } from '../types';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';
import { safeJsonParse } from '../src/utils/json';
import { getDynamicStatus, getMatchDynamicStatus, parseStandardDate } from '../src/utils/dateStatus';
import { formatMatchDateTimeForVisitor } from '../src/utils/timezone';

export const getEventSlug = (title: string | null | undefined) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// High-tech, distinct esports color palette for events and their linked matches
export interface EventPaletteColor {
  hex: string;
  name: string;
  border: string;
  text: string;
  bg: string;
  badgeBg: string;
  glow: string;
  shadow: string;
}

export const EVENT_COLOR_PALETTE: EventPaletteColor[] = [
  { 
    name: 'GEEKAY GOLD', 
    hex: '#FFC400', 
    border: 'border-[#FFC400]', 
    text: 'text-[#FFC400]', 
    bg: 'bg-[#FFC400]', 
    badgeBg: 'bg-[#FFC400]/15',
    glow: 'rgba(255, 196, 0, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(255,196,0,0.25)]'
  },
  { 
    name: 'CYBER CYAN', 
    hex: '#00E5FF', 
    border: 'border-[#00E5FF]', 
    text: 'text-[#00E5FF]', 
    bg: 'bg-[#00E5FF]', 
    badgeBg: 'bg-[#00E5FF]/15',
    glow: 'rgba(0, 229, 255, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(0,229,255,0.25)]'
  },
  { 
    name: 'ELECTRIC PURPLE', 
    hex: '#A855F7', 
    border: 'border-[#A855F7]', 
    text: 'text-[#A855F7]', 
    bg: 'bg-[#A855F7]', 
    badgeBg: 'bg-[#A855F7]/15',
    glow: 'rgba(168, 85, 247, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(168,85,247,0.25)]'
  },
  { 
    name: 'NEON EMERALD', 
    hex: '#10B981', 
    border: 'border-[#10B981]', 
    text: 'text-[#10B981]', 
    bg: 'bg-[#10B981]', 
    badgeBg: 'bg-[#10B981]/15',
    glow: 'rgba(16, 185, 129, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(16,185,129,0.25)]'
  },
  { 
    name: 'HOT CRIMSON', 
    hex: '#F43F5E', 
    border: 'border-[#F43F5E]', 
    text: 'text-[#F43F5E]', 
    bg: 'bg-[#F43F5E]', 
    badgeBg: 'bg-[#F43F5E]/15',
    glow: 'rgba(244, 63, 94, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(244,63,94,0.25)]'
  },
  { 
    name: 'VIBRANT ORANGE', 
    hex: '#F97316', 
    border: 'border-[#F97316]', 
    text: 'text-[#F97316]', 
    bg: 'bg-[#F97316]', 
    badgeBg: 'bg-[#F97316]/15',
    glow: 'rgba(249, 115, 22, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(249,115,22,0.25)]'
  },
  { 
    name: 'COBALT BLUE', 
    hex: '#3B82F6', 
    border: 'border-[#3B82F6]', 
    text: 'text-[#3B82F6]', 
    bg: 'bg-[#3B82F6]', 
    badgeBg: 'bg-[#3B82F6]/15',
    glow: 'rgba(59, 130, 246, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(59,130,246,0.25)]'
  },
  { 
    name: 'NEON PINK', 
    hex: '#EC4899', 
    border: 'border-[#EC4899]', 
    text: 'text-[#EC4899]', 
    bg: 'bg-[#EC4899]', 
    badgeBg: 'bg-[#EC4899]/15',
    glow: 'rgba(236, 72, 153, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(236,72,153,0.25)]'
  },
  { 
    name: 'CYBER AMBER', 
    hex: '#EAB308', 
    border: 'border-[#EAB308]', 
    text: 'text-[#EAB308]', 
    bg: 'bg-[#EAB308]', 
    badgeBg: 'bg-[#EAB308]/15',
    glow: 'rgba(234, 179, 8, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(234,179,8,0.25)]'
  },
  { 
    name: 'NEON TEAL', 
    hex: '#14B8A6', 
    border: 'border-[#14B8A6]', 
    text: 'text-[#14B8A6]', 
    bg: 'bg-[#14B8A6]', 
    badgeBg: 'bg-[#14B8A6]/15',
    glow: 'rgba(20, 184, 166, 0.3)',
    shadow: 'shadow-[0_0_15px_rgba(20,184,166,0.25)]'
  }
];

export type CalendarItemType = 'EVENT' | 'MATCH';

export interface CalendarItem {
  id: string;
  type: CalendarItemType;
  dateStr: string;
  timeStr: string;
  title: string;
  game: string;
  status: 'LIVE' | 'UPCOMING' | 'FINISHED';
  score?: string;
  link?: string;
  eventColor: EventPaletteColor;
  parentEvent: {
    id: string;
    title: string;
    game: string;
    slug: string;
    date: string;
    endDate?: string;
    location?: string;
    venue?: string;
    banner?: string;
    organizer?: string;
    broadcast?: string;
  };
  rawMatch?: any;
  rawEvent?: Event;
}

const BlueprintBackground = () => (
  <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
    <div className="absolute inset-0 bg-grid opacity-10 animate-pulse" style={{ animationDuration: '8s' }} />
    <motion.div 
      animate={{ 
        x: [-20, 20, -20],
        y: [-20, 20, -20],
        rotate: [0, 0.5, 0]
      }}
      transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%] bg-grid opacity-[0.03]" 
    />
    <div className="absolute inset-0 bg-scanline opacity-20" />
  </div>
);

const CalendarInterface = () => {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [gameFilter, setGameFilter] = useState('ALL');
  const [selectedEventIdFilter, setSelectedEventIdFilter] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [dbEvents, setDbEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbGameTitles, setDbGameTitles] = useState<string[]>([]);
  const [mobileSelectedDay, setMobileSelectedDay] = useState<number>(() => {
    return new Date().getDate();
  });

  // Interactive Modal States
  const [selectedMatch, setSelectedMatch] = useState<CalendarItem | null>(null);
  const [inspectDayData, setInspectDayData] = useState<{ day: number; dateStr: string; items: CalendarItem[] } | null>(null);

  useEffect(() => {
    let isMounted = true;
    Promise.all([
      fetch('/api/game-titles').then(res => res.ok ? res.json() : []).catch(() => []),
      fetch('/api/events').then(res => res.ok ? res.json() : []).catch(() => [])
    ]).then(([gtData, evData]) => {
      if (isMounted) {
        if (Array.isArray(gtData)) {
          setDbGameTitles(gtData.map((gt: any) => String(gt.name).trim().toUpperCase()));
        }
        if (Array.isArray(evData)) {
          const mapped: Event[] = evData.map((e: any) => {
            const evDate = e.start_date || e.date || new Date().toISOString().split('T')[0];
            const dynStatus = getDynamicStatus(evDate, e.end_date, e.time, e.status);
            return {
              id: String(e.id),
              title: e.title,
              game: e.game,
              type: e.type || 'TOURNAMENT',
              date: evDate,
              time: e.time || '',
              location: e.venue || e.location || e.region || 'RIYADH, KSA',
              prizePool: e.prize_pool || e.prizePool || '$50,000',
              status: (dynStatus === 'completed' ? 'FINISHED' : (dynStatus === 'live' ? 'LIVE' : 'UPCOMING')) as 'LIVE' | 'UPCOMING' | 'FINISHED',
              image: e.banner || e.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=500',
              description: e.description || '',
              organizer: e.organizer || 'GEEKAY ESPORTS',
              teams: safeJsonParse(e.teams, []),
              matches: safeJsonParse(e.matches, []),
              results: safeJsonParse(e.results, []),
              media: safeJsonParse(e.media, []),
              social: safeJsonParse(e.social, {}),
              broadcast: e.broadcast || e.broadcast_platforms || '',
              venue: e.venue || e.location || 'EMEA CENTER',
              end_date: e.end_date || ''
            } as any;
          });
          setDbEvents(mapped);
        }
        setLoading(false);
      }
    });

    return () => { isMounted = false; };
  }, []);

  // 1. Build Unified Items List and Event Color Mapping
  const { allItems, eventColorMap, activeEventsList } = useMemo(() => {
    const colorMap = new Map<string, EventPaletteColor>();
    const items: CalendarItem[] = [];
    const eventsList: { event: Event; color: EventPaletteColor; matchCount: number }[] = [];

    dbEvents.forEach((event, idx) => {
      // Deterministic color assignment per event
      const color = EVENT_COLOR_PALETTE[idx % EVENT_COLOR_PALETTE.length];
      colorMap.set(event.id, color);

      const eventDate = parseStandardDate(event.date) || event.date;
      const eventSlug = getEventSlug(event.title);

      const parentInfo = {
        id: event.id,
        title: event.title,
        game: event.game,
        slug: eventSlug,
        date: eventDate,
        endDate: (event as any).end_date,
        location: event.location,
        venue: (event as any).venue || event.location,
        banner: event.image,
        organizer: (event as any).organizer,
        broadcast: (event as any).broadcast
      };

      // 1. Add Main Event starting on its start date
      items.push({
        id: `event-${event.id}`,
        type: 'EVENT',
        dateStr: eventDate,
        timeStr: event.time || '',
        title: event.title,
        game: event.game,
        status: event.status,
        eventColor: color,
        link: (event as any).link || '',
        parentEvent: parentInfo,
        rawEvent: event
      });

      // 2. Add individual matches belonging to this event on their actual fixture date & time
      const rawMatches = Array.isArray((event as any).matches) ? (event as any).matches : [];
      let matchCount = 0;

      rawMatches.forEach((match: any, mIdx: number) => {
        if (!match) return;
        matchCount++;
        const converted = formatMatchDateTimeForVisitor(match.date || eventDate, match.time || event.time, match.timezone || (event as any).timezone);
        const matchDateStr = parseStandardDate(converted.rawDate) || eventDate;
        const matchTime = converted.formattedTime;
        const dynStatus = getMatchDynamicStatus(match, eventDate);
        const mappedStatus: 'LIVE' | 'UPCOMING' | 'FINISHED' = 
          dynStatus === 'live' ? 'LIVE' : (dynStatus === 'completed' ? 'FINISHED' : 'UPCOMING');

        items.push({
          id: `match-${event.id}-${mIdx}`,
          type: 'MATCH',
          dateStr: matchDateStr,
          timeStr: matchTime,
          title: match.teams || match.title || `${event.title} Match #${mIdx + 1}`,
          game: event.game,
          status: mappedStatus,
          score: match.score,
          link: match.link || match.url || (event as any).link || '',
          eventColor: color, // MUST match parent Event's color
          parentEvent: parentInfo,
          rawMatch: match,
          rawEvent: event
        });
      });

      // Filter legend chips: display ONLY events marked as live or upcoming to avoid clutter
      const dynStatus = getDynamicStatus(eventDate, (event as any).end_date, event.time, event.status, (event as any).matches);
      const isLiveOrUpcoming = dynStatus === 'live' || dynStatus === 'upcoming' || 
                               String(event.status || '').toLowerCase() === 'live' || 
                               String(event.status || '').toLowerCase() === 'upcoming';
      if (isLiveOrUpcoming) {
        eventsList.push({
          event,
          color,
          matchCount
        });
      }
    });

    return { allItems: items, eventColorMap: colorMap, activeEventsList: eventsList };
  }, [dbEvents]);

  // Dynamic game filters
  const games = useMemo(() => {
    const dynamicSet = new Set<string>();
    dbGameTitles.forEach(g => {
      if (g) dynamicSet.add(g);
    });
    dbEvents.forEach(e => {
      if (e.game && String(e.game).trim()) {
        dynamicSet.add(String(e.game).trim().toUpperCase());
      }
    });
    return ['ALL', ...Array.from(dynamicSet)];
  }, [dbEvents, dbGameTitles]);

  // Calendar dates computation
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Mon-Sun format
  };

  const monthName = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const year = currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(prev => {
      const next = new Date(prev.getFullYear(), prev.getMonth() - 1, 1);
      const isCur = next.getMonth() === new Date().getMonth() && next.getFullYear() === new Date().getFullYear();
      setMobileSelectedDay(isCur ? new Date().getDate() : 1);
      return next;
    });
  };

  const nextMonth = () => {
    setCurrentDate(prev => {
      const next = new Date(prev.getFullYear(), prev.getMonth() + 1, 1);
      const isCur = next.getMonth() === new Date().getMonth() && next.getFullYear() === new Date().getFullYear();
      setMobileSelectedDay(isCur ? new Date().getDate() : 1);
      return next;
    });
  };

  // Filtered items based on game filter, event filter, and search query
  const filteredItems = useMemo(() => {
    return allItems.filter(item => {
      const matchesGame = gameFilter === 'ALL' || 
        (item.game && (item.game.toUpperCase().includes(gameFilter.toUpperCase()) || gameFilter.toUpperCase().includes(item.game.toUpperCase())));

      const matchesEventFilter = !selectedEventIdFilter || item.parentEvent.id === selectedEventIdFilter;

      const query = searchQuery.toLowerCase().trim();
      const matchesSearch = !query || 
        item.title.toLowerCase().includes(query) ||
        item.parentEvent.title.toLowerCase().includes(query) ||
        item.game.toLowerCase().includes(query);

      return matchesGame && matchesEventFilter && matchesSearch;
    });
  }, [allItems, gameFilter, selectedEventIdFilter, searchQuery]);

  const getItemsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredItems.filter(item => item.dateStr === dateStr);
  };

  const weekDays = ['MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT', 'SUN'];
  const totalDays = daysInMonth(currentDate.getFullYear(), currentDate.getMonth());
  const startOffset = firstDayOfMonth(currentDate.getFullYear(), currentDate.getMonth());
  
  const today = new Date();
  const isToday = (day: number) => {
    return today.getDate() === day && 
           today.getMonth() === currentDate.getMonth() && 
           today.getFullYear() === currentDate.getFullYear();
  };

  // Click handlers
  const handleEventClick = (e: React.MouseEvent, slug: string) => {
    e.stopPropagation();
    navigate(`/events/${slug}`);
  };

  const handleMatchClick = (e: React.MouseEvent, item: CalendarItem) => {
    e.stopPropagation();
    setSelectedMatch(item);
  };

  if (loading) {
    return (
      <div className="min-h-[600px] flex flex-col items-center justify-center relative">
        <div className="w-12 h-12 border-4 border-[#FFC400]/20 border-t-[#FFC400] rounded-full animate-spin mb-4" />
        <span className="font-syncopate text-[#FFC400] text-xs font-bold tracking-widest uppercase animate-pulse">
          LOADING SCHEDULE DATA...
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full"
    >
      {/* ====================================================
          1) FILTER BAR & SEARCH
          ==================================================== */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-6 mb-8">
        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
          {/* Game Dropdown */}
          <div className="relative w-full sm:w-64 z-40">
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#081B3A] border border-slate-800 px-6 py-4 flex items-center justify-between font-syncopate text-[10px] font-black tracking-widest text-white hover:border-[#FFC400] transition-colors"
            >
              <span>FILTER: {gameFilter}</span>
              <ChevronDown size={16} className={`transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute top-full left-0 right-0 mt-2 bg-[#0B1C2D] border border-slate-800 shadow-2xl overflow-hidden max-h-72 overflow-y-auto z-50"
                >
                  {games.map(tag => (
                    <button
                      key={tag}
                      onClick={() => {
                        setGameFilter(tag);
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full px-6 py-3.5 text-left font-syncopate text-[10px] font-black tracking-widest transition-all flex items-center justify-between
                        ${gameFilter === tag 
                          ? 'bg-[#FFC400] text-black' 
                          : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                    >
                      <span>{tag}</span>
                      {gameFilter === tag && <CheckCircle2 size={12} />}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Reset Event Filter Button if active */}
          {selectedEventIdFilter && (
            <button
              onClick={() => setSelectedEventIdFilter(null)}
              className="px-4 py-4 bg-white/5 hover:bg-white/10 text-[#FFC400] border border-[#FFC400]/40 font-syncopate text-[9px] font-black tracking-wider uppercase flex items-center gap-2 transition-all"
            >
              <X size={14} />
              <span>CLEAR EVENT FILTER</span>
            </button>
          )}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="SEARCH EVENTS OR MATCHES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#081B3A] border border-slate-800 py-4 pl-12 pr-6 font-syncopate text-[10px] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FFC400] transition-colors"
          />
        </div>
      </div>

      {/* ====================================================
          2) EVENT COLOR CODING LEGEND (REQUIREMENT 7)
          ==================================================== */}
      {/* ====================================================
          2) EVENT COLOR CODING LEGEND (REQUIREMENT 7)
          ==================================================== */}
      <div className="bg-[#081B3A]/80 border border-slate-800 p-3.5 sm:p-5 md:p-6 mb-8 backdrop-blur-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 mb-4 pb-3 border-b border-white/5">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#FFC400] animate-pulse" />
            <h3 className="font-syncopate text-[10px] sm:text-xs font-black text-white uppercase tracking-widest flex items-center gap-2">
              <Layers size={14} className="text-[#FFC400]" />
              <span>EVENT COLOR CODING // LEGEND</span>
            </h3>
          </div>
          <div className="flex items-center justify-between sm:justify-end gap-3 flex-wrap">
            <span className="text-slate-400 font-inter text-[9px] uppercase tracking-wider">
              Matches inherit the distinct color of their tournament
            </span>
            {selectedEventIdFilter && (
              <button
                onClick={() => setSelectedEventIdFilter(null)}
                className="font-syncopate text-[8px] sm:text-[9px] text-[#FFC400] hover:text-white uppercase tracking-wider underline transition-colors"
              >
                SHOW ALL [RESET]
              </button>
            )}
          </div>
        </div>

        {/* Legend Chips List - Responsive Grid on Mobile/Tablet and Flex on Desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-wrap gap-2 sm:gap-2.5">
          {activeEventsList.map(({ event, color, matchCount }) => {
            const isSelected = selectedEventIdFilter === event.id;
            return (
              <button
                key={event.id}
                onClick={() => setSelectedEventIdFilter(isSelected ? null : event.id)}
                className={`w-full lg:w-auto flex items-center justify-between gap-2.5 sm:gap-3 px-3 py-2.5 border transition-all text-left group min-w-0 ${
                  isSelected 
                    ? 'border-white bg-white/10 shadow-[0_0_15px_rgba(255,255,255,0.2)] ring-1 ring-white/50' 
                    : 'border-slate-800 hover:border-slate-600 bg-[#040E1E]/70'}`}
                title={`Click to filter calendar by ${event.title}`}
              >
                {/* Left: Indicator + Event Title */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  <div 
                    className="w-3 h-3 rounded-none shrink-0 border border-white/30"
                    style={{ 
                      backgroundColor: color.hex,
                      boxShadow: `0 0 10px ${color.glow}`
                    }} 
                  />
                  
                  <span className="font-syncopate text-[9px] sm:text-[10px] font-black text-white uppercase tracking-wider group-hover:text-yellow-400 transition-colors truncate">
                    {event.title}
                  </span>
                </div>

                {/* Right: Game Badge + Match Count */}
                <div className="flex items-center gap-2 shrink-0 ml-2">
                  <span 
                    className="font-syncopate text-[7px] sm:text-[8px] font-black uppercase px-2 py-0.5 rounded-none border border-white/10 whitespace-nowrap"
                    style={{ color: color.hex, backgroundColor: color.badgeBg }}
                  >
                    {event.game}
                  </span>

                  <span className="font-mono text-[8px] sm:text-[9px] text-slate-400 font-semibold whitespace-nowrap">
                    {matchCount} {matchCount === 1 ? 'match' : 'matches'}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ====================================================
          3) CALENDAR HEADER & MONTH NAVIGATOR (RESPONSIVE)
          ==================================================== */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6 bg-[#081B3A] border border-slate-800 p-4 sm:p-6 shadow-lg">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-1.5 h-1.5 bg-[#FFC400] rounded-full inline-block" />
            <h2 className="font-syncopate text-xs sm:text-base md:text-lg font-black text-white uppercase tracking-wider">
              OPERATIONS SCHEDULE
            </h2>
          </div>
          <span className="text-slate-400 font-inter text-[8px] sm:text-[10px] uppercase flex flex-wrap items-center gap-2">
            <span>Main Events & Matches</span>
            <span className="text-slate-600">•</span>
            <span className="text-[#FFC400] font-mono">{filteredItems.length} Total Items</span>
          </span>
        </div>
        
        {/* Month Stepper */}
        <div className="flex items-center justify-between sm:justify-end gap-2 bg-[#040E1E] p-1 border border-slate-800">
          <button 
            onClick={prevMonth} 
            className="p-2 bg-slate-900/60 hover:bg-[#FFC400] hover:text-black border border-slate-800 transition-all text-slate-300"
            aria-label="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          
          <span className="font-syncopate text-xs sm:text-sm font-black text-[#FFC400] tracking-tight px-3 text-center min-w-[130px]">
            {monthName} <span className="text-white">{year}</span>
          </span>
          
          <button 
            onClick={nextMonth} 
            className="p-2 bg-slate-900/60 hover:bg-[#FFC400] hover:text-black border border-slate-800 transition-all text-slate-300"
            aria-label="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* ====================================================
          4A) COMPACT MOBILE CALENDAR GRID & DAY FIXTURES (block md:hidden)
          ==================================================== */}
      <div className="block md:hidden mb-8">
        <div className="flex items-center gap-1.5 text-[8px] font-syncopate text-[#FFC400] mb-2 px-1">
          <Sparkles size={10} />
          <span>TAP ANY DAY TO VIEW MATCHES</span>
        </div>

          <div className="grid grid-cols-7 border-t border-l border-slate-800 bg-[#05142B]/70 shadow-md">
            {/* Weekday Headers */}
            {weekDays.map(day => (
              <div key={day} className="border-r border-b border-slate-800 bg-[#081B3A]/90 py-2 text-center">
                <span className="font-syncopate text-[8px] font-black tracking-wider text-slate-400">{day}</span>
              </div>
            ))}

            {/* Empty cells for start offset */}
            {[...Array(startOffset)].map((_, i) => (
              <div key={`m-empty-${i}`} className="border-r border-b border-slate-800/80 h-14 bg-[#040E1E]/40" />
            ))}

            {/* Mobile Day cells */}
            {[...Array(totalDays)].map((_, i) => {
              const day = i + 1;
              const items = getItemsForDay(day);
              const hasItems = items.length > 0;
              const isCurrent = isToday(day);
              const isSelected = mobileSelectedDay === day;

              return (
                <button
                  key={`m-day-${day}`}
                  type="button"
                  onClick={() => setMobileSelectedDay(day)}
                  className={`border-r border-b border-slate-800/90 h-14 p-1 relative flex flex-col items-center justify-between transition-all ${
                    isSelected 
                      ? 'bg-[#FFC400]/25 ring-2 ring-[#FFC400] z-10' 
                      : isCurrent 
                        ? 'bg-white/5 ring-1 ring-white/30' 
                        : 'hover:bg-white/[0.04] bg-[#040E1E]/50'
                  }`}
                >
                  {/* Day number */}
                  <span className={`font-syncopate text-[10px] font-black ${
                    isSelected 
                      ? 'text-[#FFC400]' 
                      : isCurrent 
                        ? 'text-white' 
                        : 'text-slate-400'
                  }`}>
                    {String(day).padStart(2, '0')}
                  </span>

                  {/* Colored Indicators for Events / Matches */}
                  {hasItems ? (
                    <div className="flex flex-col items-center gap-0.5 w-full">
                      <div className="flex items-center justify-center gap-1 flex-wrap max-w-[28px]">
                        {items.slice(0, 3).map((it, dotIdx) => (
                          <span 
                            key={dotIdx} 
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ 
                              backgroundColor: it.eventColor.hex,
                              boxShadow: `0 0 5px ${it.eventColor.glow}`
                            }}
                          />
                        ))}
                      </div>
                      {items.length > 3 && (
                        <span className="font-mono text-[7px] text-slate-400 font-bold leading-none">
                          +{items.length - 3}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="h-2" />
                  )}
                </button>
              );
            })}

            {/* Empty cells for end padding */}
            {[...Array((7 - ((startOffset + totalDays) % 7)) % 7)].map((_, i) => (
              <div key={`m-empty-end-${i}`} className="border-r border-b border-slate-800/80 h-14 bg-[#040E1E]/40" />
            ))}
          </div>

          {/* Selected Day Fixtures Panel on Mobile */}
          <div className="mt-4 bg-[#081B3A] border border-slate-800 p-4 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-[2px] bg-[#FFC400]" />
            
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <Calendar size={14} className="text-[#FFC400]" />
                <div>
                  <span className="font-syncopate text-[7px] text-slate-400 font-bold tracking-widest uppercase block">
                    SELECTED DATE FIXTURES
                  </span>
                  <h3 className="font-syncopate text-xs font-black text-white uppercase tracking-tight">
                    {monthName} {String(mobileSelectedDay).padStart(2, '0')}, {year}
                  </h3>
                </div>
              </div>

              <span className="font-syncopate text-[8px] font-black text-[#FFC400] bg-black/60 px-2.5 py-1 border border-slate-800">
                {getItemsForDay(mobileSelectedDay).length} {getItemsForDay(mobileSelectedDay).length === 1 ? 'ITEM' : 'ITEMS'}
              </span>
            </div>

            {/* Fixture cards for the selected day */}
            {getItemsForDay(mobileSelectedDay).length === 0 ? (
              <div className="py-8 text-center px-4 bg-[#040E1E]/80 border border-slate-900">
                <Crosshair size={22} className="text-slate-600 mx-auto mb-2" />
                <p className="font-syncopate text-[9px] text-slate-400 uppercase tracking-wider">
                  No fixtures scheduled for this date
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {getItemsForDay(mobileSelectedDay).map((item) => {
                  const isEvent = item.type === 'EVENT';
                  const color = item.eventColor;

                  return (
                    <div
                      key={item.id}
                      onClick={(e) => {
                        if (isEvent) {
                          handleEventClick(e, item.parentEvent.slug);
                        } else {
                          handleMatchClick(e, item);
                        }
                      }}
                      className={`p-3.5 bg-[#040E1E] border hover:border-white/50 cursor-pointer transition-all flex flex-col gap-2.5 group relative overflow-hidden ${
                        isEvent ? 'shadow-[0_0_15px_rgba(255,196,0,0.05)]' : ''
                      }`}
                      style={{
                        borderLeftWidth: '4px',
                        borderLeftColor: color.hex,
                        borderColor: `${color.hex}40`
                      }}
                    >
                      {/* Top Row: Type, Game, Status/Score */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                          <span 
                            className="font-syncopate text-[7px] font-black uppercase px-2 py-0.5 flex items-center gap-1 shrink-0"
                            style={{ color: color.hex, backgroundColor: color.badgeBg }}
                          >
                            {isEvent ? <Trophy size={9} /> : <Swords size={9} />}
                            <span>{isEvent ? 'TOURNAMENT' : 'MATCH'}</span>
                          </span>

                          <span className="bg-white/5 text-slate-300 px-1.5 py-0.5 font-syncopate text-[7px] font-bold tracking-wider uppercase border border-white/5 shrink-0">
                            {item.game}
                          </span>

                          <span className="font-syncopate text-[7px] text-slate-400 truncate max-w-[130px]">
                            • {item.parentEvent.title}
                          </span>
                        </div>

                        {/* Status / Score */}
                        <div className="shrink-0">
                          {item.status === 'LIVE' ? (
                            <span className="font-syncopate text-[7px] font-black text-red-400 bg-red-950/80 px-2 py-0.5 border border-red-500/40 animate-pulse">
                              ● LIVE
                            </span>
                          ) : item.score ? (
                            <span className="font-syncopate text-[8px] font-black text-[#FFC400] font-mono bg-black/60 px-2 py-0.5 border border-slate-800">
                              {item.score}
                            </span>
                          ) : item.timeStr ? (
                            <span className="font-mono text-[8px] text-slate-300 font-bold bg-white/5 px-2 py-0.5 border border-white/5">
                              {item.timeStr}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      {/* Middle: Title */}
                      <div>
                        <h4 className="font-syncopate text-xs font-black text-white uppercase tracking-tight group-hover:text-yellow-400 transition-colors leading-snug">
                          {item.title}
                        </h4>
                      </div>

                      {/* Bottom: Action buttons */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[8px] font-syncopate text-slate-400">
                        <span className="flex items-center gap-1 text-[#FFC400]">
                          <span>{isEvent ? 'VIEW TOURNAMENT' : 'VIEW MATCH'}</span>
                          <ChevronRight size={12} className="group-hover:translate-x-1 transition-transform" />
                        </span>

                        {item.link && (
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              window.open(item.link, '_blank', 'noopener,noreferrer');
                            }}
                            className="px-2.5 py-1 bg-[#FFC400] text-black font-syncopate text-[7px] font-black uppercase tracking-wider flex items-center gap-1 hover:bg-yellow-400 transition-colors shrink-0"
                          >
                            <span>STREAM</span>
                            <ExternalLink size={10} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

      {/* ====================================================
          4B) EXPANSIVE DESKTOP CALENDAR GRID (hidden md:grid)
          ==================================================== */}
      <div className="hidden md:grid grid-cols-7 border-t border-l border-slate-800 bg-[#05142B]/40 mb-8">
        {/* Weekday Headers */}
        {weekDays.map(day => (
          <div key={day} className="border-r border-b border-slate-800 bg-[#081B3A]/70 py-3.5 text-center">
            <span className="font-syncopate text-[9px] font-black tracking-widest text-slate-400">{day}</span>
          </div>
        ))}

        {/* Empty cells for start offset */}
        {[...Array(startOffset)].map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-slate-800/80 aspect-square md:aspect-auto md:min-h-[160px] bg-[#040E1E]/40" />
        ))}

        {/* Day cells */}
        {[...Array(totalDays)].map((_, i) => {
          const day = i + 1;
          const items = getItemsForDay(day);
          const hasItems = items.length > 0;
          const isCurrent = isToday(day);
          const isExpanded = expandedDay === day;
          const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

          return (
            <div 
              key={day} 
              className={`border-r border-b border-slate-800/90 p-2 sm:p-3 min-h-[130px] md:min-h-[175px] relative group transition-colors flex flex-col justify-between
                ${isCurrent ? 'bg-[#FFC400]/5 ring-1 ring-[#FFC400]/30' : 'hover:bg-white/[0.02]'}`}
            >
              {/* Day Header */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className={`font-syncopate text-xs sm:text-sm font-black 
                    ${isCurrent ? 'text-[#FFC400]' : 'text-slate-500 group-hover:text-slate-300'}`}>
                    {String(day).padStart(2, '0')}
                  </span>

                  {hasItems && (
                    <span className="font-syncopate text-[7px] font-bold text-slate-400 bg-black/40 px-1.5 py-0.5 border border-slate-800">
                      {items.length} {items.length === 1 ? 'ITEM' : 'ITEMS'}
                    </span>
                  )}
                </div>

                {/* Items Container for this Day */}
                <div className="space-y-2">
                  <AnimatePresence>
                    {(isExpanded ? items : items.slice(0, 2)).map((item, idx) => {
                      const isEvent = item.type === 'EVENT';
                      const color = item.eventColor;

                      return (
                        <motion.div
                          key={item.id}
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.04 }}
                          onClick={(e) => {
                            if (isEvent) {
                              handleEventClick(e, item.parentEvent.slug);
                            } else {
                              handleMatchClick(e, item);
                            }
                          }}
                          className={`border p-2 rounded-none cursor-pointer transition-all relative overflow-hidden group/item
                            ${isEvent 
                              ? 'bg-[#06152B] hover:bg-[#0A2040] shadow-sm' 
                              : 'bg-[#040D1E] hover:bg-[#071730]'}`}
                          style={{
                            borderLeftWidth: isEvent ? '4px' : '3px',
                            borderLeftColor: color.hex,
                            borderColor: `${color.hex}40`
                          }}
                          role="button"
                          tabIndex={0}
                          aria-label={`${isEvent ? 'Event' : 'Match'}: ${item.title}`}
                        >
                          {/* Header row with badges */}
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <div className="flex items-center gap-1.5 overflow-hidden">
                              {isEvent ? (
                                <span 
                                  className="font-syncopate text-[6px] sm:text-[7px] font-black uppercase px-1.5 py-0.5 flex items-center gap-1"
                                  style={{ color: color.hex, backgroundColor: color.badgeBg }}
                                >
                                  <Trophy size={9} />
                                  <span>{Number((item as any).rawEvent?.featured) === 1 ? '★ FEATURED' : 'EVENT'}</span>
                                </span>
                              ) : (
                                <span 
                                  className="font-syncopate text-[6px] sm:text-[7px] font-black uppercase px-1.5 py-0.5 flex items-center gap-1"
                                  style={{ color: color.hex, backgroundColor: color.badgeBg }}
                                >
                                  <Swords size={9} />
                                  <span>MATCH</span>
                                </span>
                              )}

                              <span className="font-syncopate text-[6px] sm:text-[7px] font-bold text-slate-400 truncate">
                                {item.game}
                              </span>
                            </div>

                            {/* Status or Time Badge */}
                            {item.status === 'LIVE' ? (
                              <span className="font-syncopate text-[6px] font-black text-red-400 bg-red-950/80 px-1 py-0.5 border border-red-500/40 animate-pulse">
                                LIVE
                              </span>
                            ) : item.score ? (
                              <span className="font-syncopate text-[6px] font-black text-[#FFC400] bg-black/60 px-1 py-0.5 border border-slate-800 font-mono">
                                {item.score}
                              </span>
                            ) : item.timeStr ? (
                              <span className="font-mono text-[7px] text-slate-400 font-semibold">
                                {item.timeStr}
                              </span>
                            ) : null}
                          </div>

                          {/* Title */}
                          <h4 className="font-syncopate text-[8px] sm:text-[9px] font-black text-white uppercase truncate leading-tight group-hover/item:text-yellow-400 transition-colors">
                            {item.title}
                          </h4>

                          {/* Visual connection to Parent Event for Matches */}
                          {!isEvent && (
                            <div className="mt-1 flex items-center justify-between gap-1 text-[7px] font-syncopate text-slate-500">
                              <span className="truncate flex items-center gap-1" style={{ color: `${color.hex}cc` }}>
                                <span>↳</span>
                                <span className="truncate">{item.parentEvent.title}</span>
                              </span>

                              {item.link && (
                                <button
                                  type="button"
                                  onClick={(ev) => {
                                    ev.stopPropagation();
                                    window.open(item.link, '_blank', 'noopener,noreferrer');
                                  }}
                                  className="shrink-0 p-0.5 text-slate-400 hover:text-white"
                                  title="Open match direct link"
                                  aria-label="Open match link"
                                >
                                  <ExternalLink size={10} />
                                </button>
                              )}
                            </div>
                          )}

                          {isEvent && (
                            <div className="mt-1 flex items-center justify-between text-[7px] font-syncopate text-slate-500">
                              <span className="truncate text-slate-400">STARTS TODAY</span>
                              <ChevronRight size={10} className="text-slate-500 group-hover/item:translate-x-0.5 group-hover/item:text-white transition-all" />
                            </div>
                          )}
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              </div>

              {/* Day expansion / Inspect button if multiple items */}
              {items.length > 2 && (
                <div className="mt-2 pt-1 border-t border-white/5 flex gap-1">
                  {!isExpanded ? (
                    <button 
                      onClick={() => setExpandedDay(day)}
                      className="w-full py-1 bg-white/5 hover:bg-white/10 font-syncopate text-[7px] font-black text-[#FFC400] hover:text-white transition-colors uppercase tracking-widest text-center"
                    >
                      +{items.length - 2} MORE
                    </button>
                  ) : (
                    <button 
                      onClick={() => setExpandedDay(null)}
                      className="w-full py-1 bg-white/5 hover:bg-white/10 font-syncopate text-[7px] font-black text-slate-400 hover:text-white transition-colors uppercase tracking-widest text-center"
                    >
                      COLLAPSE
                    </button>
                  )}

                  <button
                    onClick={() => setInspectDayData({ day, dateStr, items })}
                    title="View all fixtures for this date"
                    className="px-2 py-1 bg-[#FFC400]/10 hover:bg-[#FFC400] hover:text-black font-syncopate text-[7px] text-[#FFC400] transition-colors uppercase tracking-widest"
                  >
                    VIEW
                  </button>
                </div>
              )}
            </div>
          );
        })}

        {/* Empty cells for end padding to keep grid alignment consistent */}
        {[...Array((7 - ((startOffset + totalDays) % 7)) % 7)].map((_, i) => (
          <div key={`empty-end-${i}`} className="border-r border-b border-slate-800/80 aspect-square md:aspect-auto md:min-h-[160px] bg-[#040E1E]/40" />
        ))}
      </div>

      {/* ====================================================
          5) MATCH DETAILS MODAL (REQUIREMENT 4)
          ==================================================== */}
      <AnimatePresence>
        {selectedMatch && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedMatch(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-lg w-full bg-[#081B3A] border shadow-2xl overflow-hidden p-6 sm:p-8"
              style={{
                borderColor: selectedMatch.eventColor.hex
              }}
            >
              {/* Close Button */}
              <button
                type="button"
                onClick={() => setSelectedMatch(null)}
                className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close match dialog"
              >
                <X size={20} />
              </button>

              {/* Event Badge with Assigned Event Color */}
              <div className="flex items-center gap-2 mb-4">
                <span 
                  className="font-syncopate text-[8px] font-black uppercase px-2.5 py-1 border"
                  style={{
                    color: selectedMatch.eventColor.hex,
                    backgroundColor: selectedMatch.eventColor.badgeBg,
                    borderColor: `${selectedMatch.eventColor.hex}60`
                  }}
                >
                  {selectedMatch.parentEvent.title}
                </span>

                <span className="font-syncopate text-[8px] font-bold text-slate-400">
                  {selectedMatch.game}
                </span>
              </div>

              {/* Match Title */}
              <h3 className="font-syncopate text-xl sm:text-2xl font-black text-white uppercase tracking-tight mb-4">
                {selectedMatch.title}
              </h3>

              {/* Intel Grid */}
              <div className="grid grid-cols-2 gap-4 bg-[#040E1E] border border-slate-800 p-4 mb-6 text-xs">
                <div>
                  <span className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                    DATE & TIME
                  </span>
                  <p className="font-syncopate text-white text-[10px] font-black uppercase flex items-center gap-1.5">
                    <Calendar size={12} className="text-[#FFC400]" />
                    <span>{selectedMatch.dateStr} {selectedMatch.timeStr ? `// ${selectedMatch.timeStr}` : ''}</span>
                  </p>
                </div>

                <div>
                  <span className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                    STATUS / SCORE
                  </span>
                  <p className="font-syncopate text-white text-[10px] font-black uppercase flex items-center gap-1.5">
                    {selectedMatch.status === 'LIVE' ? (
                      <span className="text-red-400 animate-pulse flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> LIVE NOW
                      </span>
                    ) : selectedMatch.score ? (
                      <span className="text-[#FFC400] font-mono font-bold">SCORE: {selectedMatch.score}</span>
                    ) : (
                      <span className="text-emerald-400">UPCOMING</span>
                    )}
                  </p>
                </div>

                <div className="col-span-2 pt-2 border-t border-slate-800/80">
                  <span className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest block mb-1">
                    TOURNAMENT VENUE & REGION
                  </span>
                  <p className="font-syncopate text-white text-[10px] font-black uppercase flex items-center gap-1.5">
                    <MapPin size={12} className="text-[#FFC400]" />
                    <span>{selectedMatch.parentEvent.venue || selectedMatch.parentEvent.location || 'EMEA CENTER'}</span>
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {selectedMatch.link && (
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedMatch.link) {
                        window.open(selectedMatch.link, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className="flex-1 py-3 px-4 bg-[#FFC400] text-black font-syncopate text-[10px] font-black tracking-widest uppercase hover:bg-yellow-400 transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(255,196,0,0.3)]"
                  >
                    <span>OPEN MATCH LINK</span>
                    <ExternalLink size={14} />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    navigate(`/events/${selectedMatch.parentEvent.slug}`);
                    setSelectedMatch(null);
                  }}
                  className="flex-1 py-3 px-4 bg-slate-800 hover:bg-white hover:text-black text-white font-syncopate text-[10px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 border border-slate-700"
                >
                  <span>VIEW EVENT DETAILS</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ====================================================
          6) DAY FIXTURES INSPECTION MODAL (FOR MULTI-MATCH DAYS)
          ==================================================== */}
      <AnimatePresence>
        {inspectDayData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setInspectDayData(null)}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-w-2xl w-full bg-[#081B3A] border border-slate-700 shadow-2xl overflow-hidden p-6 sm:p-8 max-h-[85vh] flex flex-col"
            >
              <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-6">
                <div>
                  <span className="font-syncopate text-[#FFC400] text-[9px] font-black tracking-widest uppercase block mb-1">
                    OPERATIONAL TIMELINE
                  </span>
                  <h3 className="font-syncopate text-xl sm:text-2xl font-black text-white uppercase tracking-tight">
                    FIXTURES ON {inspectDayData.dateStr}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setInspectDayData(null)}
                  className="p-2 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                  aria-label="Close day fixtures"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Items List */}
              <div className="space-y-3 overflow-y-auto pr-2 flex-grow">
                {inspectDayData.items.map((item) => {
                  const isEvent = item.type === 'EVENT';
                  const color = item.eventColor;

                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (isEvent) {
                          navigate(`/events/${item.parentEvent.slug}`);
                          setInspectDayData(null);
                        } else {
                          setSelectedMatch(item);
                        }
                      }}
                      className="p-4 bg-[#040E1E] border hover:border-white/50 cursor-pointer transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                      style={{
                        borderLeftWidth: isEvent ? '5px' : '4px',
                        borderLeftColor: color.hex,
                        borderColor: `${color.hex}40`
                      }}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1.5">
                          <span 
                            className="font-syncopate text-[7px] font-black uppercase px-2 py-0.5"
                            style={{ color: color.hex, backgroundColor: color.badgeBg }}
                          >
                            {isEvent ? 'TOURNAMENT' : 'MATCH'}
                          </span>
                          <span className="font-syncopate text-[8px] font-bold text-slate-400">
                            {item.game}
                          </span>
                          <span className="text-slate-500 text-[8px] font-mono">
                            • {item.parentEvent.title}
                          </span>
                        </div>

                        <h4 className="font-syncopate text-sm font-black text-white uppercase tracking-tight group-hover:text-yellow-400 transition-colors">
                          {item.title}
                        </h4>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        {item.status === 'LIVE' ? (
                          <span className="font-syncopate text-[8px] font-black text-red-400 bg-red-950/80 px-2 py-1 border border-red-500/40 animate-pulse">
                            LIVE NOW
                          </span>
                        ) : item.score ? (
                          <span className="font-syncopate text-[9px] font-black text-[#FFC400] font-mono bg-black/60 px-2 py-1 border border-slate-800">
                            {item.score}
                          </span>
                        ) : item.timeStr ? (
                          <span className="font-mono text-xs text-slate-300 font-bold">
                            {item.timeStr}
                          </span>
                        ) : null}

                        {item.link && (
                          <button
                            type="button"
                            onClick={(ev) => {
                              ev.stopPropagation();
                              window.open(item.link, '_blank', 'noopener,noreferrer');
                            }}
                            className="p-2 bg-[#FFC400] text-black hover:bg-yellow-400 transition-colors"
                            title="Open direct link"
                          >
                            <ExternalLink size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const Schedule = () => {
  const containerRef = useRef(null);

  const scheduleSchemas = useMemo(() => {
    return [];
  }, []);

  return (
    <div className="bg-[#0B1C2D] min-h-screen selection:bg-[#FFC400] selection:text-black pt-24 sm:pt-32 overflow-x-hidden" ref={containerRef}>
      <BlueprintBackground />
      <SEOMeta 
        title="Geekay Esports Schedule - Match Calendar & Events"
        description="Official match calendar and schedule for Geekay Esports. Track tournament brackets, upcoming events, and professional rosters in real-time."
        ogType="website"
        schemas={scheduleSchemas}
      />
      
      {/* 🧩 MAIN OPERATIONS LAYOUT — CALENDAR INTERFACE */}
      <section className="py-12 sm:py-16 md:py-24 px-4 sm:px-6 md:px-12 bg-[#0B1C2D] relative">
        <div className="max-w-screen-2xl mx-auto">
          <Breadcrumbs />
          <div className="mb-12 sm:mb-16 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1.5 h-1.5 bg-[#FFC400] rounded-full inline-block" />
                <span className="font-syncopate text-[9px] sm:text-[10px] tracking-[0.25em] font-bold text-[#FFC400] uppercase">
                  OPERATIONAL CALENDAR
                </span>
              </div>
              <h1 className="font-syncopate text-3xl sm:text-4xl md:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-tight sm:leading-[0.95] mb-4 sm:mb-6 break-words">
                GEEKAY ESPORTS <br /> <span className="text-[#FFC400]">SCHEDULE</span>
              </h1>
              <p className="text-slate-300 font-inter text-sm sm:text-base font-light tracking-wide max-w-2xl uppercase">
                Track our global operations, tournaments, and individual matches in real-time.
              </p>
            </div>
            
            <div className="flex gap-3 sm:gap-4">
              <div className="border border-slate-800 p-3 sm:p-4 bg-[#081B3A]/40">
                <h2 className="font-syncopate text-[10px] sm:text-xs font-black text-[#FFC400] tracking-wider uppercase mb-1">{new Date().getFullYear()} SCHEDULE</h2>
                <span className="text-slate-400 font-inter text-[9px] sm:text-[10px] uppercase">Active Season</span>
              </div>
              <div className="border border-slate-900 p-3 sm:p-4 bg-[#081B3A]/20 opacity-80">
                <h2 className="font-syncopate text-[10px] sm:text-xs font-black text-slate-300 tracking-wider uppercase mb-1">{new Date().getFullYear() - 1} SCHEDULE</h2>
                <span className="text-slate-400 font-inter text-[9px] sm:text-[10px] uppercase">Archived</span>
              </div>
            </div>
          </div>
          
          <CalendarInterface />

        </div>
      </section>

      <style>{`
        .border-text {
          -webkit-text-stroke: 1px rgba(255, 196, 0, 0.3);
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 60s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default Schedule;


import React, { useState, useRef, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useScroll, useTransform } from 'framer-motion';
import { ChevronDown, MapPin, Trophy, ChevronRight, ChevronLeft, Search, PlayCircle, Info, History, Activity, Target, Calendar, Radio, Crosshair, Clock, Globe, Shield } from 'lucide-react';
import { MOCK_EVENTS } from '../constants';
import ArenaButton from '../components/ui/ArenaButton';
import { Event } from '../types';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta, { generateEventSchema } from '../components/SEOMeta';

export const getEventSlug = (title: string | null | undefined) => {
  if (!title) return '';
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// --- Sub-components ---

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
  const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1)); // FEB 2026
  const [gameFilter, setGameFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedDay, setExpandedDay] = useState<number | null>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const games = ['ALL', 'RL', 'HOK', 'PUBG', 'VAL', 'CS2'];

  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => {
    const day = new Date(year, month, 1).getDay();
    return day === 0 ? 6 : day - 1; // Adjust to Mon-Sun
  };

  const monthName = currentDate.toLocaleString('default', { month: 'short' }).toUpperCase();
  const year = currentDate.getFullYear();

  const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));

  const filteredEvents = useMemo(() => {
    return MOCK_EVENTS.filter(event => {
      const matchesGame = gameFilter === 'ALL' || event.game.includes(gameFilter);
      const matchesSearch = event.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                           event.game.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesGame && matchesSearch;
    });
  }, [gameFilter, searchQuery]);

  const getEventsForDay = (day: number) => {
    const dateStr = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return filteredEvents.filter(e => e.date === dateStr);
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

  const navigate = useNavigate();

  const handleEventClick = (title: string) => {
    navigate(`/events/${getEventSlug(title)}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="w-full"
    >
      {/* 🛠 FILTER BAR */}
      <div className="flex flex-col lg:flex-row justify-between items-center gap-8 mb-16">
        <div className="relative w-full lg:w-64 z-50">
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
                className="absolute top-full left-0 right-0 mt-2 bg-[#0B1C2D] border border-slate-800 shadow-2xl overflow-hidden"
              >
                {games.map(tag => (
                  <button
                    key={tag}
                    onClick={() => {
                      setGameFilter(tag);
                      setIsDropdownOpen(false);
                    }}
                    className={`w-full px-6 py-4 text-left font-syncopate text-[10px] font-black tracking-widest transition-all
                      ${gameFilter === tag 
                        ? 'bg-[#FFC400] text-black' 
                        : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    {tag}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="relative w-full max-w-md">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text"
            placeholder="SEARCH EVENTS..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#081B3A] border border-slate-800 py-4 pl-12 pr-6 font-syncopate text-[10px] text-white placeholder:text-slate-600 focus:outline-none focus:border-[#FFC400] transition-colors"
          />
        </div>
      </div>

      {/* 📅 CALENDAR HEADER */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-6 mb-12 bg-[#081B3A] border border-slate-800 p-8">
        <div>
          <h2 className="font-syncopate text-lg md:text-xl font-black text-white uppercase tracking-widest mb-1">UPCOMING MATCHES</h2>
          <span className="text-slate-500 font-inter text-xs uppercase">Live Operations Feed</span>
        </div>
        <div className="flex items-center gap-6">
          <button onClick={prevMonth} className="p-2 hover:text-[#FFC400] transition-colors text-slate-500">
            <ChevronLeft size={24} />
          </button>
          <span className="font-syncopate text-xl md:text-2xl font-black text-[#FFC400] tracking-tighter">
            {monthName} <span className="text-white">{year}</span>
          </span>
          <button onClick={nextMonth} className="p-2 hover:text-[#FFC400] transition-colors text-slate-500">
            <ChevronRight size={24} />
          </button>
        </div>
      </div>

      {/* 🗓 CALENDAR GRID */}
      <div className="grid grid-cols-7 border-t border-l border-slate-800">
        {/* Weekday Headers */}
        {weekDays.map(day => (
          <div key={day} className="border-r border-b border-slate-800 bg-[#081B3A]/50 py-4 text-center">
            <span className="font-syncopate text-[9px] font-black tracking-widest text-slate-500">{day}</span>
          </div>
        ))}

        {/* Empty cells for start offset */}
        {[...Array(startOffset)].map((_, i) => (
          <div key={`empty-${i}`} className="border-r border-b border-slate-800 aspect-square md:aspect-video bg-[#040E1E]/30" />
        ))}

        {/* Day cells */}
        {[...Array(totalDays)].map((_, i) => {
          const day = i + 1;
          const events = getEventsForDay(day);
          const hasEvents = events.length > 0;
          const isCurrent = isToday(day);
          const isExpanded = expandedDay === day;

          return (
            <div 
              key={day} 
              className={`border-r border-b border-slate-800 p-2 md:p-4 min-h-[120px] md:min-h-[160px] relative group transition-colors
                ${isCurrent ? 'bg-[#FFC400]/5' : 'hover:bg-white/[0.02]'}`}
            >
              {isCurrent && (
                <div className="absolute inset-0 border border-[#FFC400]/30 pointer-events-none" />
              )}
              
              <div className="flex justify-between items-start mb-4">
                <span className={`font-syncopate text-xs md:text-sm font-black 
                  ${isCurrent ? 'text-[#FFC400]' : 'text-slate-600 group-hover:text-slate-400'}`}>
                  {String(day).padStart(2, '0')}
                </span>
              </div>

              <div className="space-y-2">
                <AnimatePresence>
                  {(isExpanded ? events : events.slice(0, 2)).map((event, idx) => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.05 }}
                      onClick={() => handleEventClick(event.title)}
                      className="bg-[#081B3A] border border-slate-800 p-2 rounded-sm cursor-pointer hover:border-[#FFC400] transition-all group/chip relative overflow-hidden"
                    >
                      <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FFC400]" />
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-syncopate text-[7px] font-black text-[#FFC400] tracking-tighter">{event.game}</span>
                        <span className="font-syncopate text-[6px] text-slate-500 font-bold">{event.time}</span>
                      </div>
                      <h4 className="font-syncopate text-[8px] font-bold text-white uppercase truncate leading-tight">{event.title}</h4>
                      <div className="mt-1 flex items-center gap-1">
                        <div className={`w-1 h-1 rounded-full ${event.type === 'TOURNAMENT' ? 'bg-purple-500' : 'bg-blue-500'}`} />
                        <span className="font-syncopate text-[6px] text-slate-600 font-bold uppercase">{event.type}</span>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>

                {events.length > 2 && !isExpanded && (
                  <button 
                    onClick={() => setExpandedDay(day)}
                    className="w-full py-1 font-syncopate text-[8px] font-black text-[#FFC400] hover:text-white transition-colors uppercase tracking-widest"
                  >
                    +{events.length - 2} MORE
                  </button>
                )}
                
                {isExpanded && (
                  <button 
                    onClick={() => setExpandedDay(null)}
                    className="w-full py-1 font-syncopate text-[8px] font-black text-slate-500 hover:text-white transition-colors uppercase tracking-widest"
                  >
                    COLLAPSE
                  </button>
                )}
              </div>
            </div>
          );
        })}

        {/* Empty cells for end padding to keep grid consistent */}
        {[...Array((7 - ((startOffset + totalDays) % 7)) % 7)].map((_, i) => (
          <div key={`empty-end-${i}`} className="border-r border-b border-slate-800 aspect-square md:aspect-video bg-[#040E1E]/30" />
        ))}
      </div>
    </motion.div>
  );
};

const Schedule = () => {
  const containerRef = useRef(null);

  const scheduleSchemas = useMemo(() => {
    return MOCK_EVENTS.map(ev => 
      generateEventSchema(
        ev.title,
        ev.date,
        ev.location || 'Online Arena',
        'UPCOMING',
        'TBD'
      )
    );
  }, []);

  return (
    <div className="bg-[#0B1C2D] min-h-screen selection:bg-[#FFC400] selection:text-black pt-32 overflow-x-hidden" ref={containerRef}>
      <BlueprintBackground />
      <SEOMeta 
        title="Geekay Esports Schedule - Match Calendar & Events"
        description="Official match calendar and schedule for Geekay Esports. Track tournament brackets, upcoming events, and professional rosters in real-time."
        ogType="website"
        schemas={scheduleSchemas}
      />
      
      {/* 🧩 MAIN OPERATIONS LAYOUT — CALENDAR INTERFACE */}
      <section className="py-24 px-6 bg-[#0B1C2D] relative">
        <div className="max-w-screen-2xl mx-auto">
          <Breadcrumbs />
          <div className="mb-24 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h1 className="font-syncopate text-4xl md:text-7xl font-black uppercase tracking-tighter text-white leading-[0.85] mb-6">
                GEEKAY ESPORTS <br /> <span className="text-[#FFC400]">SCHEDULE</span>
              </h1>
              <p className="text-slate-400 font-inter text-base font-light tracking-wide max-w-2xl uppercase">
                Track our global operations and upcoming tournament appearances.
              </p>
            </div>
            
            <div className="flex gap-4">
              <div className="border border-slate-800 p-4 bg-[#081B3A]/40">
                <h2 className="font-syncopate text-xs font-black text-[#FFC400] tracking-wider uppercase mb-1">2026 SCHEDULE</h2>
                <span className="text-slate-500 font-inter text-[10px] uppercase">Active Season</span>
              </div>
              <div className="border border-slate-900 p-4 bg-[#081B3A]/20 opacity-60">
                <h2 className="font-syncopate text-xs font-black text-slate-400 tracking-wider uppercase mb-1">2025 SCHEDULE</h2>
                <span className="text-slate-500 font-inter text-[10px] uppercase">Archived</span>
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

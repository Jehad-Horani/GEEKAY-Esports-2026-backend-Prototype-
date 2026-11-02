import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Gamepad2, Award, Users, Trophy, ExternalLink, ShieldAlert,
  Clock, Tv, Tag, Radio, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Twitter, Instagram, PlayCircle, Star, ArrowRight, Sparkles, Swords, Globe, Shield, CheckCircle2
} from 'lucide-react';
import { getEventSlug } from './Schedule';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';
import { getDynamicStatus, getMatchDynamicStatus } from '../src/utils/dateStatus';

const CountdownTimer: React.FC<{ targetDate: string }> = ({ targetDate }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    const calculate = () => {
      const difference = +new Date(targetDate) - +new Date();
      if (difference <= 0) {
        setIsFinished(true);
        return;
      }
      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      });
    };

    calculate();
    const interval = setInterval(calculate, 1000);
    return () => clearInterval(interval);
  }, [targetDate]);

  if (isFinished) return null;

  return (
    <div className="bg-[#040E1E]/90 border border-[#FFC400]/30 p-3 sm:p-5 md:p-6 flex flex-col items-center justify-center max-w-[280px] sm:max-w-xs md:max-w-sm w-full mx-auto backdrop-blur-md shadow-xl">
      <span className="font-syncopate text-[#FFC400] text-[7px] sm:text-[8px] font-black tracking-[0.3em] sm:tracking-[0.4em] mb-2.5 sm:mb-4 uppercase text-center">
        DEPLOYMENT COUNTDOWN
      </span>
      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center w-full">
        <div>
          <span className="font-syncopate text-lg sm:text-2xl font-black text-white">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="block font-syncopate text-[6px] sm:text-[7px] text-slate-500 font-bold tracking-widest uppercase">DAYS</span>
        </div>
        <div>
          <span className="font-syncopate text-lg sm:text-2xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="block font-syncopate text-[6px] sm:text-[7px] text-slate-500 font-bold tracking-widest uppercase">HRS</span>
        </div>
        <div>
          <span className="font-syncopate text-lg sm:text-2xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="block font-syncopate text-[6px] sm:text-[7px] text-slate-500 font-bold tracking-widest uppercase">MIN</span>
        </div>
        <div>
          <span className="font-syncopate text-lg sm:text-2xl font-black text-[#FFC400]">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="block font-syncopate text-[6px] sm:text-[7px] text-[#FFC400]/70 font-bold tracking-widest uppercase">SEC</span>
        </div>
      </div>
    </div>
  );
};

const EventDetail = () => {
  const { eventName } = useParams<{ eventName: string }>();
  const navigate = useNavigate();
  const [dbEvents, setDbEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [eventName]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    const fetchEvents = async () => {
      try {
        const res = await fetch('/api/events', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (isMounted && Array.isArray(data)) {
            setDbEvents(data);
          } else if (isMounted) {
            console.warn('API returned non-array data for events:', data);
          }
        }
      } catch (err: any) {
        if (isMounted && err.name !== 'AbortError') {
          console.warn('Failed to fetch events from API:', err);
        }
      } finally {
        clearTimeout(timeoutId);
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    fetchEvents();
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
      controller.abort();
    };
  }, []);

  // Normalization logic to select matched event from database
  const matchedEvent = useMemo(() => {
    const normalized = (Array.isArray(dbEvents) ? dbEvents : []).map(e => {
      const dynStatus = getDynamicStatus(e.start_date, e.end_date, e.time, e.status);
      return {
        ...e,
        title: e.title || '',
        status: dynStatus,
        start_date: e.start_date || '',
        banner: e.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
        overview_title: e.overview_title || 'TACTICAL INTELLIGENCE',
        prize_pool: e.prize_pool || e.prizePool || '$100,000',
        total_teams: e.total_teams || '16',
        broadcast: e.broadcast || 'TWITCH / YOUTUBE',
        purpose: e.purpose || 'CHAMPIONSHIP VICTORY',
        format: e.format || 'DOUBLE ELIMINATION BRACKET (BO5/BO7)',
        timeline: e.timeline || '',
        venue: e.venue || e.location || 'EMEA CENTER',
        location: e.location || e.venue || 'EMEA CENTER',
        broadcast_platforms: e.broadcast_platforms || 'LIVE TWITCH.TV/GEEKAY'
      };
    });

    return normalized.find(e => 
      (e.title && getEventSlug(e.title) === eventName) || 
      String(e.id) === eventName ||
      (eventName && e.title && getEventSlug(e.title).includes(eventName.toLowerCase()))
    );
  }, [dbEvents, eventName]);

  // Fallbacks for richer rendering of elements
  const fallbackDetails = useMemo(() => {
    if (!matchedEvent) return null;

    // Parse structures
    const safeParse = (str: any, fallback: any) => {
      if (str === null || str === undefined || str === '') return fallback;
      if (typeof str === 'object') return str;
      try {
        return JSON.parse(str);
      } catch (err) {
        return fallback;
      }
    };

    const teams = safeParse(matchedEvent.teams, []);
    const matches = safeParse(matchedEvent.matches, []);
    const results = safeParse(matchedEvent.results, {});
    const media = safeParse(matchedEvent.media, []);
    const social = safeParse(matchedEvent.social, []);

    return { teams, matches, results, media, social };
  }, [matchedEvent]);

  // Related events calculation - strictly from database
  const relatedEvents = useMemo(() => {
    if (!matchedEvent) return [];
    
    const dbList = (Array.isArray(dbEvents) ? dbEvents : [])
      .filter(e => e.title && getEventSlug(e.title) !== eventName)
      .map(e => {
        const dynStatus = getDynamicStatus(e.start_date, e.end_date, e.time, e.status);
        return {
          ...e,
          title: e.title || '',
          status: dynStatus,
          start_date: e.start_date || '',
          banner: e.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
        };
      });

    return dbList.slice(0, 3);
  }, [dbEvents, matchedEvent, eventName]);

  if (loading) {
    return (
      <div className="bg-[#0B1C2D] min-h-screen text-center flex items-center justify-center">
        <div className="space-y-4">
          <div className="w-12 h-12 border-4 border-[#FFC400] border-t-transparent rounded-full animate-spin mx-auto" />
          <span className="font-syncopate text-xs tracking-widest text-slate-500 uppercase block">LOADING INTEL...</span>
        </div>
      </div>
    );
  }

  if (!matchedEvent || !fallbackDetails) {
    return (
      <div className="bg-[#0B1C2D] min-h-screen text-center flex flex-col items-center justify-center px-6">
        <ShieldAlert size={64} className="text-red-500 mb-6" />
        <h2 className="font-syncopate text-3xl font-black text-white uppercase tracking-tighter mb-4">EVENT NOT FOUND</h2>
        <p className="text-slate-400 font-inter text-sm max-w-md uppercase mb-8">
          The operation you are attempting to locate is outside current clearance parameters or has been archived.
        </p>
        <Link to="/events" className="bg-[#FFC400] text-black px-8 py-4 font-syncopate text-xs font-black tracking-widest uppercase hover:bg-white transition-colors">
          RETURN TO EVENTS
        </Link>
      </div>
    );
  }

  const { teams, matches, results, media, social } = fallbackDetails;
  const isUpcoming = matchedEvent.status.toLowerCase() === 'upcoming';
  const isLive = matchedEvent.status.toLowerCase() === 'live';
  const isCompleted = matchedEvent.status.toLowerCase() === 'finished' || matchedEvent.status.toLowerCase() === 'completed';

  return (
    <div className="bg-[#0B1C2D] min-h-screen selection:bg-[#FFC400] selection:text-black">
      <SEOMeta 
        title={`${matchedEvent.title} - Match & Tournament Details`}
        description={matchedEvent.description || `Live professional esports match details featuring Geekay Esports in the ${matchedEvent.game} division.`}
        ogImage={matchedEvent.banner}
        ogType="article"
      />
      
      {/* ====================================================
          1) EVENT HERO SECTION (FULLY RESPONSIVE)
          ==================================================== */}
      <div className="relative min-h-[500px] sm:min-h-[560px] md:min-h-[640px] pt-24 sm:pt-28 md:pt-32 pb-14 sm:pb-20 flex flex-col justify-between overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={matchedEvent.banner} 
            alt={matchedEvent.title} 
            className="w-full h-full object-cover grayscale brightness-[0.2]" 
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2D] via-[#0B1C2D]/60 to-transparent" />
          <div className="absolute inset-0 bg-grid opacity-10" />
        </div>

        {/* Back navigation and Breadcrumbs */}
        <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 md:px-12 relative z-20 mb-6 sm:mb-8">
          <div className="flex flex-col gap-2.5 sm:gap-3">
            <Breadcrumbs />
            <Link 
              to="/events" 
              className="inline-flex items-center gap-2 sm:gap-3 text-slate-400 hover:text-[#FFC400] transition-all font-syncopate text-[8px] sm:text-[10px] font-black uppercase tracking-wider sm:tracking-[0.3em] group w-fit"
            >
              <ChevronLeft size={16} className="group-hover:-translate-x-1.5 transition-transform" />
              <span>← BACK TO EVENTS</span>
            </Link>
          </div>
        </div>

        {/* Hero content */}
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 flex flex-col items-center justify-center text-center relative z-10 my-auto">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-5"
          >
            <span className="bg-[#FFC400] text-black px-2.5 sm:px-4 py-1 sm:py-1.5 font-syncopate text-[8px] sm:text-[9px] font-black tracking-wider sm:tracking-[0.2em] uppercase">
              <span>{matchedEvent.game}</span>
            </span>
            <span className="bg-white/10 backdrop-blur-sm text-white px-2.5 sm:px-4 py-1 sm:py-1.5 font-syncopate text-[8px] sm:text-[9px] font-bold tracking-wider sm:tracking-[0.2em] uppercase border border-white/10">
              <span>{matchedEvent.region || 'GLOBAL'}</span>
            </span>
            <span className={`px-2.5 sm:px-4 py-1 sm:py-1.5 font-syncopate text-[8px] sm:text-[9px] font-black tracking-wider sm:tracking-[0.2em] uppercase border ${
              isLive ? 'bg-red-500 text-white border-red-500 animate-pulse' :
              isUpcoming ? 'bg-[#FFC400]/10 text-[#FFC400] border-[#FFC400]' :
              'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <span>{matchedEvent.status}</span>
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-syncopate text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white uppercase tracking-tight leading-[1.15] sm:leading-[1.1] max-w-4xl mb-4 sm:mb-6 break-words"
          >
            {matchedEvent.title}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 md:gap-8 text-slate-300 font-syncopate text-[8px] sm:text-[10px] tracking-wider sm:tracking-widest uppercase mb-6 sm:mb-10"
          >
            <div className="flex items-center gap-1.5 sm:gap-2">
              <Calendar size={14} className="text-[#FFC400] shrink-0" />
              <span>{matchedEvent.start_date} {matchedEvent.end_date && ` - ${matchedEvent.end_date}`}</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <MapPin size={14} className="text-[#FFC400] shrink-0" />
              <span>{matchedEvent.venue || matchedEvent.location || 'EMEA CENTER'}</span>
            </div>
            {matchedEvent.organizer && (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <Users size={14} className="text-[#FFC400] shrink-0" />
                <span>ORG: {matchedEvent.organizer}</span>
              </div>
            )}
          </motion.div>

          {/* Dynamic Countdown for upcoming events */}
          {isUpcoming && <CountdownTimer targetDate={matchedEvent.start_date} />}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-12 relative z-10 -mt-6 sm:-mt-10 md:-mt-12 pb-20 sm:pb-32">

        {/* ====================================================
            2) EVENT INFORMATION OVERVIEW
            ==================================================== */}
        <section className="bg-[#081B3A]/90 border border-slate-800 p-5 sm:p-8 md:p-12 mb-12 sm:mb-16 relative backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#FFC400]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            <div className="lg:col-span-7">
              <span className="font-syncopate text-[#FFC400] text-[8px] sm:text-[9px] tracking-[0.3em] sm:tracking-[0.4em] font-black mb-3 sm:mb-4 block uppercase">EVENT OVERVIEW</span>
              <h2 className="font-syncopate text-xl sm:text-2xl font-black text-white uppercase tracking-tighter mb-4 sm:mb-6">{matchedEvent.overview_title || 'TACTICAL INTELLIGENCE'}</h2>
              <p className="text-slate-300 font-inter text-sm sm:text-base leading-relaxed font-light mb-6 sm:mb-8">
                {matchedEvent.description || `Geekay Esports deploys their tactical division for the highly anticipated ${matchedEvent.title}. This operation demands peak coordination, dynamic tactical flexibility, and top mechanical skill. Watch us make history.`}
              </p>
              
              <div className="border-t border-slate-900 pt-5 sm:pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block mb-1">ORGANIZER</span>
                  <p className="text-white font-syncopate text-xs font-bold uppercase">{matchedEvent.organizer || 'GEEKAY ESPORTS'}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block mb-1">VENUE & REGION</span>
                  <p className="text-[#FFC400] font-syncopate text-xs font-bold uppercase">{matchedEvent.venue || matchedEvent.location || 'EMEA CENTER'}</p>
                </div>
              </div>
            </div>

            {/* Side summary details card */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 sm:gap-4">
              <div className="bg-[#040E1E] border border-slate-900 p-4 sm:p-6 flex flex-col justify-between">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">PRIZE POOL</span>
                <span className="font-syncopate text-base sm:text-xl md:text-2xl font-black text-[#FFC400] mt-3 sm:mt-4 break-words">{matchedEvent.prize_pool || matchedEvent.prizePool || '$100,000'}</span>
              </div>
              <div className="bg-[#040E1E] border border-slate-900 p-4 sm:p-6 flex flex-col justify-between">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">TOTAL TEAMS</span>
                <div className="mt-3 sm:mt-4">
                  <span className="font-syncopate text-2xl sm:text-3xl font-black text-white block leading-none">{matchedEvent.total_teams || (teams.length ? String(teams.length) : '16')}</span>
                  <span className="font-syncopate text-[8px] sm:text-[9px] text-slate-400 font-bold tracking-wider block mt-1">CONTENDERS</span>
                </div>
              </div>
              <div className="bg-[#040E1E] border border-slate-900 p-4 sm:p-6 flex flex-col justify-between">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">REGION</span>
                <span className="font-syncopate text-base sm:text-xl md:text-2xl font-black text-white mt-3 sm:mt-4">{matchedEvent.region || 'EMEA'}</span>
              </div>
              <div className="bg-[#040E1E] border border-slate-900 p-4 sm:p-6 flex flex-col justify-between">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">BROADCAST</span>
                <span className="font-syncopate text-[10px] sm:text-xs md:text-sm font-black text-[#FFC400] mt-3 sm:mt-4 leading-normal break-words">{matchedEvent.broadcast || 'TWITCH / YOUTUBE'}</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            3) EVENT DETAILS SECTION
            ==================================================== */}
        <section className="mb-14 sm:mb-20">
          <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <h2 className="font-syncopate text-base sm:text-lg font-black text-white tracking-widest uppercase">EVENT DETAILS</h2>
            <div className="h-[1px] flex-grow bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-[#081B3A] border border-slate-800 p-4 sm:p-6 relative group hover:border-[#FFC400] transition-all">
              <Clock size={20} className="text-[#FFC400] mb-3 sm:mb-4" />
              <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">TIMELINE</span>
              <p className="text-white font-syncopate text-[9px] sm:text-[10px] font-black uppercase break-words">{matchedEvent.timeline || `${matchedEvent.start_date}${matchedEvent.time ? ` | ${matchedEvent.time}` : ''}`}</p>
            </div>

            <div className="bg-[#081B3A] border border-slate-800 p-4 sm:p-6 relative group hover:border-[#FFC400] transition-all">
              <MapPin size={20} className="text-[#FFC400] mb-3 sm:mb-4" />
              <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">VENUE</span>
              <p className="text-white font-syncopate text-[9px] sm:text-[10px] font-black uppercase break-words">{matchedEvent.venue || matchedEvent.location || 'EMEA CENTER'}</p>
            </div>

            <div className="bg-[#081B3A] border border-slate-800 p-4 sm:p-6 relative group hover:border-[#FFC400] transition-all">
              <Tv size={20} className="text-[#FFC400] mb-3 sm:mb-4" />
              <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">BROADCAST PLATFORMS</span>
              <p className="text-white font-syncopate text-[9px] sm:text-[10px] font-black uppercase break-words">{matchedEvent.broadcast_platforms || 'LIVE TWITCH.TV/GEEKAY'}</p>
            </div>

            <div className="bg-[#081B3A] border border-slate-800 p-4 sm:p-6 relative group hover:border-[#FFC400] transition-all">
              <Radio size={20} className="text-[#FFC400] mb-3 sm:mb-4" />
              <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">OFFICIAL LINKS</span>
              <a 
                href={matchedEvent.link || 'https://x.com/geekay_esports'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#FFC400] hover:text-white font-syncopate text-[9px] sm:text-[10px] font-black uppercase flex items-center gap-1.5"
              >
                <span>OPEN LOGS CHANNEL</span>
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </section>

        {/* ====================================================
            4) PARTICIPATING TEAMS
            ==================================================== */}
        {teams && teams.length > 0 && (
          <section className="mb-14 sm:mb-20">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h2 className="font-syncopate text-base sm:text-lg font-black text-white tracking-widest uppercase">PARTICIPATING TEAMS</h2>
              <div className="h-[1px] flex-grow bg-slate-800" />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
              {teams.map((team: any, i: number) => (
                <Link 
                  key={i} 
                  to={`/teams`}
                  className="bg-[#081B3A] border border-slate-800 p-4 sm:p-6 flex flex-col items-center text-center group hover:border-[#FFC400] hover:shadow-[0_0_20px_rgba(255,196,0,0.1)] transition-all relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 skew-x-[-45deg] translate-x-4 -translate-y-4" />
                  
                  <img 
                    src={team.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100'} 
                    alt={team.name} 
                    className="w-12 h-12 sm:w-16 sm:h-16 object-contain mb-3 sm:mb-4 grayscale group-hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100';
                    }}
                  />
                  
                  <h4 className="font-syncopate text-[10px] sm:text-xs font-black text-white uppercase tracking-tighter mb-1 line-clamp-1">{team.name}</h4>
                  <span className="text-slate-500 font-syncopate text-[7px] sm:text-[8px] tracking-widest uppercase">{team.region || 'EMEA'}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* ====================================================
            5) TACTICAL SCHEDULE & MATCHES (REDESIGNED)
            ==================================================== */}
        {matches && matches.length > 0 && (
          <section className="mb-14 sm:mb-20">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#FFC400] animate-pulse" />
                <h2 className="font-syncopate text-base sm:text-lg font-black text-white tracking-widest uppercase">
                  TACTICAL SCHEDULE & MATCHES
                </h2>
              </div>
              <div className="h-[1px] flex-grow bg-slate-800" />
              <span className="font-syncopate text-[8px] sm:text-[9px] text-[#FFC400] font-black uppercase tracking-wider hidden sm:inline-block">
                {matches.length} {matches.length === 1 ? 'FIXTURE' : 'FIXTURES'}
              </span>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {matches.map((match: any, i: number) => {
                const dynStatus = getMatchDynamicStatus(match, matchedEvent.start_date);
                const matchIsLive = dynStatus === 'live';
                const matchIsCompleted = dynStatus === 'completed';
                const matchLink = match.link || match.url || '';

                // Helper to cleanly extract teams
                const rawTeamsStr = String(match.teams || 'Geekay Esports vs Opponent').trim();
                const parts = rawTeamsStr.split(/\s+(?:vs\.?|VS\.?|vs|VS|v\.?)\s+/i);
                const team1Name = parts[0]?.trim() || 'Geekay Esports';
                const team2Name = parts.length > 1 ? parts[1].trim() : '';

                // Logo lookups from participating teams if present
                const findLogo = (name: string) => {
                  if (!name || !Array.isArray(teams)) return null;
                  const found = teams.find((t: any) => 
                    t && t.name && (t.name.toLowerCase().includes(name.toLowerCase()) || name.toLowerCase().includes(t.name.toLowerCase()))
                  );
                  return found?.logo || null;
                };

                const team1Logo = findLogo(team1Name);
                const team2Logo = findLogo(team2Name);

                // Date and time formatting
                const rawDate = match.date || matchedEvent.start_date || '';
                let formattedDate = 'TBD';
                if (rawDate) {
                  const cleanDate = rawDate.split('T')[0].split(' ')[0];
                  try {
                    const parsed = new Date(cleanDate);
                    if (!isNaN(parsed.getTime())) {
                      formattedDate = parsed.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
                    } else {
                      formattedDate = cleanDate;
                    }
                  } catch (e) {
                    formattedDate = cleanDate;
                  }
                }

                // Time extraction
                let matchTime = match.time ? String(match.time).trim() : '';
                if (!matchTime && rawDate.includes(' ')) {
                  matchTime = rawDate.split(' ')[1] || '';
                }
                if (!matchTime) {
                  matchTime = matchedEvent.time || '18:00';
                }

                // Timezone label
                let timezoneLabel = 'AST (UTC+3)';
                try {
                  const resolvedTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
                  if (resolvedTz) {
                    const city = resolvedTz.split('/').pop()?.replace(/_/g, ' ');
                    timezoneLabel = `${city?.toUpperCase() || 'LOCAL'}`;
                  }
                } catch (e) {}

                // Score validation
                const rawScore = String(match.score || '').trim();
                const hasValidScore = Boolean(
                  rawScore && 
                  rawScore.toLowerCase() !== 'upcoming' && 
                  rawScore.toLowerCase() !== 'tbd' && 
                  rawScore !== '0-0' && 
                  rawScore !== '0 - 0' &&
                  !rawScore.toLowerCase().includes('vs')
                );

                return (
                  <div 
                    key={i} 
                    onClick={() => {
                      if (matchLink) {
                        window.open(matchLink, '_blank', 'noopener,noreferrer');
                      }
                    }}
                    className={`bg-[#081B3A]/90 hover:bg-[#0A2045] border transition-all duration-300 relative overflow-hidden group shadow-lg ${
                      matchLink ? 'cursor-pointer hover:border-[#FFC400]' : 'border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {/* Top Cyber Accent Line */}
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FFC400]/40 to-transparent group-hover:via-[#FFC400] transition-all" />

                    {/* 1. Header Bar: Tournament/Game Tag, Date, Start Time & Timezone */}
                    <div className="p-3 sm:p-4 border-b border-slate-800/80 bg-[#040E1E]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 text-xs">
                      {/* Left: Game & Tournament Name */}
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="bg-[#FFC400] text-black font-syncopate text-[7px] sm:text-[8px] font-black px-2 py-0.5 tracking-wider uppercase shrink-0">
                          {matchedEvent.game}
                        </span>
                        <span className="font-syncopate text-[8px] sm:text-[9px] font-bold text-slate-300 tracking-wider uppercase truncate">
                          {matchedEvent.title}
                        </span>
                      </div>

                      {/* Right: Date, Time & Timezone */}
                      <div className="flex flex-wrap items-center gap-2.5 sm:gap-4 font-syncopate text-[8px] sm:text-[9px] tracking-wider text-slate-400">
                        <div className="flex items-center gap-1.5 text-slate-300">
                          <Calendar size={12} className="text-[#FFC400] shrink-0" />
                          <span>{formattedDate}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-white font-bold">
                          <Clock size={12} className="text-[#FFC400] shrink-0" />
                          <span>{matchTime}</span>
                        </div>
                        <div className="flex items-center gap-1 text-[7px] sm:text-[8px] text-slate-400 bg-white/5 px-1.5 sm:px-2 py-0.5 border border-white/5">
                          <Globe size={10} className="text-[#FFC400] shrink-0" />
                          <span>{timezoneLabel}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Main Body: Team 1 VS Team 2 & Dynamic Center Result */}
                    <div className="p-4 sm:p-6 md:p-8">
                      <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 sm:gap-6 md:gap-4">
                        
                        {/* Team 1 (Left / Geekay Esports) */}
                        <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-3 sm:gap-4 order-1 text-left md:text-right">
                          <div className="overflow-hidden min-w-0 flex-1 md:flex-initial">
                            <span className="text-[#FFC400] font-syncopate text-[7px] sm:text-[8px] font-bold tracking-widest uppercase block mb-0.5 sm:mb-1">
                              {team1Name.toLowerCase().includes('geekay') ? 'GEEKAY ESPORTS' : 'TEAM 1'}
                            </span>
                            <h3 className="font-syncopate text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-tight truncate">
                              {team1Name}
                            </h3>
                          </div>
                          
                          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-[#040E1E] border border-slate-800 p-2 flex items-center justify-center shrink-0 group-hover:border-[#FFC400]/50 transition-colors">
                            {team1Logo ? (
                              <img src={team1Logo} alt={team1Name} className="w-full h-full object-contain" />
                            ) : (
                              <Shield size={22} className="text-[#FFC400]" />
                            )}
                          </div>
                        </div>

                        {/* Center: Dynamic Result or VS / Start Time */}
                        <div className="md:col-span-2 flex flex-col items-center justify-center order-2 py-1 sm:py-2">
                          {matchIsCompleted ? (
                            <div className="flex flex-col items-center">
                              <span className="text-slate-500 font-syncopate text-[6px] sm:text-[7px] font-black tracking-widest uppercase mb-1">
                                FINAL RESULT
                              </span>
                              <div className="bg-[#040E1E] border-2 border-[#FFC400] px-4 sm:px-5 py-1.5 sm:py-2 min-w-[80px] sm:min-w-[90px] text-center shadow-[0_0_15px_rgba(255,196,0,0.2)]">
                                <span className="font-syncopate text-lg sm:text-2xl font-black text-[#FFC400] tracking-wider font-mono block">
                                  {hasValidScore ? rawScore : 'FINAL'}
                                </span>
                              </div>
                              <span className="text-slate-400 font-syncopate text-[7px] font-black uppercase mt-1.5 flex items-center gap-1">
                                <CheckCircle2 size={10} className="text-emerald-400 shrink-0" />
                                <span>COMPLETED</span>
                              </span>
                            </div>
                          ) : matchIsLive ? (
                            <div className="flex flex-col items-center">
                              <span className="bg-red-600 text-white font-syncopate text-[7px] sm:text-[8px] font-black tracking-widest uppercase px-2.5 sm:px-3 py-1 animate-pulse mb-1.5 shadow-[0_0_12px_rgba(220,38,38,0.5)]">
                                ● LIVE NOW
                              </span>
                              {hasValidScore ? (
                                <div className="bg-[#040E1E] border border-red-500/80 px-3.5 sm:px-4 py-1.5 text-center min-w-[75px] sm:min-w-[80px]">
                                  <span className="font-syncopate text-base sm:text-xl font-black text-white tracking-widest font-mono">
                                    {rawScore}
                                  </span>
                                </div>
                              ) : (
                                <span className="font-syncopate text-[7px] sm:text-[8px] text-red-400 font-bold uppercase tracking-wider text-center">
                                  BROADCAST ACTIVE
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="flex flex-col items-center">
                              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#040E1E] border border-slate-700 flex items-center justify-center mb-1 group-hover:border-[#FFC400] transition-colors">
                                <span className="font-syncopate text-[11px] sm:text-xs font-black text-[#FFC400]">VS</span>
                              </div>
                              <span className="text-emerald-400 font-syncopate text-[6px] sm:text-[7px] font-black tracking-widest uppercase bg-emerald-500/10 px-2 py-0.5 border border-emerald-500/20">
                                UPCOMING
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Team 2 (Right / Opponent) */}
                        <div className="md:col-span-5 flex items-center justify-start gap-3 sm:gap-4 order-3 text-left">
                          <div className="w-11 h-11 sm:w-14 sm:h-14 bg-[#040E1E] border border-slate-800 p-2 flex items-center justify-center shrink-0 group-hover:border-[#FFC400]/50 transition-colors">
                            {team2Logo ? (
                              <img src={team2Logo} alt={team2Name || 'Opponent'} className="w-full h-full object-contain" />
                            ) : (
                              <Swords size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                            )}
                          </div>
                          
                          <div className="overflow-hidden min-w-0 flex-1 md:flex-initial">
                            <span className="text-slate-400 font-syncopate text-[7px] sm:text-[8px] font-bold tracking-widest uppercase block mb-0.5 sm:mb-1">
                              {team2Name ? 'CHALLENGER' : 'OPPONENT'}
                            </span>
                            <h3 className="font-syncopate text-sm sm:text-lg md:text-xl lg:text-2xl font-black text-white uppercase tracking-tight truncate">
                              {team2Name || 'OPPONENT TBD'}
                            </h3>
                          </div>
                        </div>

                      </div>
                    </div>

                    {/* 3. Footer Bar: Status indicator & Live Stream Action Link */}
                    <div className="px-4 sm:px-6 py-3 bg-[#040E1E]/80 border-t border-slate-800/80 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs">
                      <div className="flex items-center gap-2.5 sm:gap-3">
                        <span className={`px-2.5 py-1 font-syncopate text-[7px] sm:text-[8px] font-black tracking-widest uppercase ${
                          matchIsLive ? 'bg-red-500 text-white animate-pulse' :
                          matchIsCompleted ? 'bg-slate-800 text-slate-300 border border-slate-700' :
                          'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {matchIsLive ? 'LIVE' : (matchIsCompleted ? 'COMPLETED' : 'SCHEDULED')}
                        </span>

                        <span className="text-slate-500 font-syncopate text-[7px] sm:text-[8px] tracking-wider uppercase truncate">
                          {matchIsCompleted 
                            ? 'Official Match Result Recorded' 
                            : (matchIsLive 
                              ? 'Live broadcast currently streaming' 
                              : `Scheduled for ${formattedDate} at ${matchTime}`)}
                        </span>
                      </div>

                      {matchLink && (
                        <a
                          href={matchLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          title="Open match stream"
                          className="px-3.5 sm:px-4 py-2 bg-[#FFC400] hover:bg-yellow-400 text-black font-syncopate text-[8px] sm:text-[9px] font-black tracking-widest uppercase transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,196,0,0.2)] w-full sm:w-auto"
                        >
                          <span>{matchIsLive ? 'WATCH LIVE STREAM' : (matchIsCompleted ? 'WATCH VOD / REPLAY' : 'WATCH MATCH')}</span>
                          <ExternalLink size={12} className="shrink-0" />
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* ====================================================
            6) RESULTS SECTION
            ==================================================== */}
        {isCompleted && results && results.winner && (
          <section className="mb-14 sm:mb-20">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h2 className="font-syncopate text-base sm:text-lg font-black text-white tracking-widest uppercase">FINALS PODIUM RESULTS</h2>
              <div className="h-[1px] flex-grow bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {/* Winner podium card */}
              <div className="bg-[#081B3A] border-2 border-[#FFC400] p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#FFC400] text-black font-syncopate text-[7px] sm:text-[8px] font-black px-3 sm:px-4 py-1.5 uppercase skew-x-[-15deg] translate-x-3 translate-y-2">
                  <span className="block skew-x-[15deg] flex items-center gap-1"><Sparkles size={10} /> CHAMPION</span>
                </div>
                
                <Trophy size={40} className="text-[#FFC400] mb-4 sm:mb-6 sm:w-12 sm:h-12" />
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">1ST PLACE</span>
                <h3 className="font-syncopate text-xl sm:text-2xl font-black text-white uppercase tracking-tighter mb-1">{results.winner}</h3>
                <p className="text-[#FFC400] font-syncopate text-[8px] sm:text-[9px] font-black tracking-widest">🏆 GOLD MEDALISTS</p>
              </div>

              {/* Runner up podium card */}
              <div className="bg-[#081B3A] border border-slate-800 p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden">
                <Award size={40} className="text-slate-400 mb-4 sm:mb-6 sm:w-12 sm:h-12" />
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">2ND PLACE</span>
                <h3 className="font-syncopate text-lg sm:text-xl font-black text-white uppercase tracking-tighter mb-1">{results.runnerUp}</h3>
                <p className="text-slate-400 font-syncopate text-[8px] sm:text-[9px] font-bold tracking-widest">🥈 SILVER RUNNERS</p>
              </div>

              {/* MVP podium card */}
              {results.mvp && (
                <div className="bg-[#081B3A] border border-slate-800 p-6 sm:p-8 flex flex-col items-center text-center relative overflow-hidden sm:col-span-2 lg:col-span-1">
                  <Star size={40} className="text-purple-400 mb-4 sm:mb-6 sm:w-12 sm:h-12" />
                  <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">TOURNAMENT MVP</span>
                  <h3 className="font-syncopate text-lg sm:text-xl font-black text-white uppercase tracking-tighter mb-1">{results.mvp}</h3>
                  <p className="text-purple-400 font-syncopate text-[8px] sm:text-[9px] font-black tracking-widest">⭐ MOST VALUABLE PLAYER</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ====================================================
            7) MEDIA SECTION
            ==================================================== */}
        {media && media.length > 0 && (
          <section className="mb-14 sm:mb-20">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h2 className="font-syncopate text-base sm:text-lg font-black text-white tracking-widest uppercase">EVENT MEDIA ARCHIVE</h2>
              <div className="h-[1px] flex-grow bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
              {media.map((med: any, i: number) => (
                <div key={i} className="aspect-video relative overflow-hidden bg-slate-950 border border-slate-800 group cursor-pointer">
                  <img 
                    src={med.url} 
                    alt="Gallery item" 
                    className="w-full h-full object-cover grayscale brightness-75 group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450';
                    }}
                  />
                  
                  {/* Play video overlay if video */}
                  {med.type === 'video' && (
                    <div className="absolute inset-0 flex items-center justify-center z-10 bg-black/20 group-hover:bg-black/10 transition-colors">
                      <PlayCircle size={40} className="text-[#FFC400] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300 sm:w-12 sm:h-12" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 font-syncopate text-[7px] sm:text-[8px] text-[#FFC400] font-black tracking-widest uppercase translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                    MEDIA FILE // EVENT_ARCHIVE_{matchedEvent.game}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ====================================================
            8) SOCIAL COVERAGE
            ==================================================== */}
        {social && social.length > 0 && (
          <section className="mb-14 sm:mb-20">
            <div className="flex items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
              <h2 className="font-syncopate text-base sm:text-lg font-black text-white tracking-widest uppercase">SOCIAL COVERAGE</h2>
              <div className="h-[1px] flex-grow bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
              {social.map((soc: any, i: number) => (
                <div key={i} className="bg-[#081B3A] border border-slate-800 p-4 sm:p-6 relative">
                  <div className="flex items-center justify-between mb-3 sm:mb-4 pb-3 sm:pb-4 border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-800 flex items-center justify-center font-syncopate text-[10px] sm:text-xs font-black text-white">
                        GK
                      </div>
                      <div>
                        <span className="font-syncopate text-[9px] sm:text-[10px] font-black text-white block">GEEKAY ESPORTS</span>
                        <span className="font-syncopate text-[7px] sm:text-[8px] text-slate-500 block">{soc.handle}</span>
                      </div>
                    </div>
                    {soc.platform === 'twitter' ? (
                      <Twitter size={16} className="text-[#FFC400]" />
                    ) : (
                      <Instagram size={16} className="text-[#FFC400]" />
                    )}
                  </div>
                  <p className="text-slate-300 font-inter text-xs sm:text-sm leading-relaxed font-light">
                    {soc.text}
                  </p>
                  <div className="mt-4 sm:mt-6 flex items-center justify-between font-syncopate text-[6px] sm:text-[7px] text-slate-500 tracking-widest uppercase">
                    <span>GEEKAY OFFICIAL COMMUNICATIONS</span>
                    <span>EMBED LIVEFEED</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ====================================================
            9) RELATED EVENTS
            ==================================================== */}
        {relatedEvents.length > 0 && (
          <section className="py-8 sm:py-12 border-t border-slate-800">
            <div className="flex items-center justify-between mb-6 sm:mb-8">
              <h2 className="font-syncopate text-base sm:text-lg font-black text-white tracking-widest uppercase">RELATED OPERATIONS</h2>
              <Link to="/events" className="text-[#FFC400] font-syncopate text-[9px] sm:text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <span>VIEW FULL HUB</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {relatedEvents.map((ev, i) => (
                <div 
                  key={i}
                  onClick={() => navigate(`/events/${getEventSlug(ev.title)}`)}
                  className="bg-[#081B3A] border border-slate-800 p-4 sm:p-6 flex flex-col justify-end min-h-[140px] sm:min-h-[160px] relative overflow-hidden group cursor-pointer hover:border-[#FFC400] transition-colors"
                >
                  <img 
                    src={ev.banner} 
                    alt={ev.title} 
                    className="absolute inset-0 w-full h-full object-cover grayscale opacity-10 group-hover:grayscale-0 group-hover:opacity-25 group-hover:scale-[1.03] transition-all"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450';
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040E1E] to-transparent" />
                  
                  <div className="relative z-10">
                    <span className="bg-[#FFC400] text-black px-2 py-0.5 font-syncopate text-[6px] sm:text-[7px] font-black tracking-widest uppercase inline-block mb-1.5 sm:mb-2">
                      {ev.game}
                    </span>
                    <h4 className="font-syncopate text-[10px] sm:text-xs font-black text-white uppercase tracking-tighter leading-tight mb-1 sm:mb-2">{ev.title}</h4>
                    <span className="text-slate-500 font-syncopate text-[7px] sm:text-[8px] tracking-widest block uppercase">{ev.start_date}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

      </div>
    </div>
  );
};

export default EventDetail;

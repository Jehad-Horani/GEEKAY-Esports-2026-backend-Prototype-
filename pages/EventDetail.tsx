import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, MapPin, Gamepad2, Award, Users, Trophy, ExternalLink, ShieldAlert,
  Clock, Tv, Tag, Radio, ChevronLeft, ChevronRight, Image as ImageIcon, 
  Twitter, Instagram, PlayCircle, Star, ArrowRight, Sparkles 
} from 'lucide-react';
import { MOCK_EVENTS } from '../constants';
import { getEventSlug } from './Schedule';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';

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
    <div className="bg-[#040E1E]/90 border border-[#FFC400]/30 p-6 flex flex-col items-center justify-center max-w-sm w-full mx-auto md:mx-0 backdrop-blur-md">
      <span className="font-syncopate text-[#FFC400] text-[8px] font-black tracking-[0.4em] mb-4 uppercase">
        DEPLOYMENT COUNTDOWN
      </span>
      <div className="grid grid-cols-4 gap-4 text-center">
        <div>
          <span className="font-syncopate text-2xl font-black text-white">{String(timeLeft.days).padStart(2, '0')}</span>
          <span className="block font-syncopate text-[7px] text-slate-500 font-bold tracking-widest uppercase">DAYS</span>
        </div>
        <div>
          <span className="font-syncopate text-2xl font-black text-white">{String(timeLeft.hours).padStart(2, '0')}</span>
          <span className="block font-syncopate text-[7px] text-slate-500 font-bold tracking-widest uppercase">HRS</span>
        </div>
        <div>
          <span className="font-syncopate text-2xl font-black text-white">{String(timeLeft.minutes).padStart(2, '0')}</span>
          <span className="block font-syncopate text-[7px] text-slate-500 font-bold tracking-widest uppercase">MIN</span>
        </div>
        <div>
          <span className="font-syncopate text-2xl font-black text-[#FFC400]">{String(timeLeft.seconds).padStart(2, '0')}</span>
          <span className="block font-syncopate text-[7px] text-[#FFC400]/70 font-bold tracking-widest uppercase">SEC</span>
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
    const fetchEvents = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 1500);
      try {
        const res = await fetch('/api/events', { signal: controller.signal });
        clearTimeout(timeoutId);
        if (res.ok && res.headers.get('content-type')?.includes('application/json')) {
          const data = await res.json();
          if (Array.isArray(data)) {
            setDbEvents(data);
          } else {
            console.warn('API returned non-array data for events:', data);
          }
        }
      } catch (err) {
        console.error('Failed to fetch events (or timed out):', err);
      } finally {
        clearTimeout(timeoutId);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  // Normalization logic to merge database and mock events and select the matched one
  const matchedEvent = useMemo(() => {
    const normalized = (Array.isArray(dbEvents) ? dbEvents : []).map(e => ({
      ...e,
      title: e.title || '',
      status: e.status ? e.status.toLowerCase() : 'upcoming',
      start_date: e.start_date || '',
      banner: e.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
    }));

    // Append MOCK_EVENTS not in the DB
    MOCK_EVENTS.forEach(mock => {
      const exists = normalized.some(
        e => e.title && mock.title && e.title.toLowerCase().trim() === mock.title.toLowerCase().trim()
      );
      if (!exists) {
        normalized.push({
          id: mock.id,
          title: mock.title,
          game: mock.game,
          type: mock.type ? mock.type.toLowerCase() : 'tournament',
          start_date: mock.date,
          end_date: mock.date,
          time: mock.time || '18:00',
          region: mock.location ? (mock.location.split(',')[1]?.trim() || 'GLOBAL') : 'GLOBAL',
          status: mock.status.toLowerCase(),
          link: 'https://x.com/geekay_esports',
          description: `An official ${mock.game} championship match. Geekay Esports qualifies to compete alongside first-tier EMEA operations on the grand stage.`,
          banner: mock.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600',
          organizer: 'Esports League / Riot Games',
          published: 1,
          featured: 1,
          teams: JSON.stringify([
            { name: "Geekay Esports", logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" },
            { name: "Team Falcons", logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" },
            { name: "Sentinels", logo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=100&h=100", region: "North America" }
          ]),
          matches: JSON.stringify([
            { date: mock.date, teams: "Geekay vs Sentinels", score: mock.status === 'FINISHED' ? '3 - 2' : 'TBD', status: mock.status.toLowerCase() }
          ]),
          results: JSON.stringify(mock.status === 'FINISHED' ? { winner: "Geekay Esports", runnerUp: "Sentinels", mvp: "Abdullah" } : {}),
          media: JSON.stringify([
            { type: 'photo', url: mock.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=500' }
          ]),
          social: JSON.stringify([
            { platform: "twitter", handle: "@Geekay_Esports", text: `Ready for ${mock.title}! Make sure to support our boys as we step onto the stage! 🇸🇦` }
          ])
        } as any);
      }
    });

    return normalized.find(e => e.title && getEventSlug(e.title) === eventName);
  }, [dbEvents, eventName]);

  // Fallbacks for richer rendering of elements
  const fallbackDetails = useMemo(() => {
    if (!matchedEvent) return null;

    // Parse structures
    const safeParse = (str: any, fallback: any) => {
      if (!str) return fallback;
      if (typeof str === 'object') return str;
      try {
        return JSON.parse(str);
      } catch (err) {
        return fallback;
      }
    };

    const teams = safeParse(matchedEvent.teams, [
      { name: "Geekay Esports", logo: "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" },
      { name: "Team Falcons", logo: "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=100&h=100", region: "Saudi Arabia" },
      { name: "Spacestation Gaming", logo: "https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=100&h=100", region: "EMEA" },
      { name: "Nigma Galaxy", logo: "https://images.unsplash.com/photo-1548685913-fe6574abf1a5?auto=format&fit=crop&q=80&w=100&h=100", region: "UAE" }
    ]);

    const matches = safeParse(matchedEvent.matches, [
      { date: matchedEvent.start_date, teams: "Geekay vs Team Falcons", score: matchedEvent.status === 'finished' ? "3 - 2" : "Upcoming", status: matchedEvent.status },
      { date: matchedEvent.start_date, teams: "Geekay vs Spacestation", score: matchedEvent.status === 'finished' ? "2 - 1" : "Upcoming", status: matchedEvent.status }
    ]);

    const results = safeParse(matchedEvent.results, matchedEvent.status === 'finished' ? {
      winner: "Geekay Esports",
      runnerUp: "Team Falcons",
      mvp: "Teeen"
    } : {});

    const media = safeParse(matchedEvent.media, [
      { type: 'photo', url: matchedEvent.banner },
      { type: 'photo', url: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&q=80&w=800&h=500' },
      { type: 'photo', url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?auto=format&fit=crop&q=80&w=800&h=500' }
    ]);

    const social = safeParse(matchedEvent.social, [
      { platform: 'twitter', handle: '@Geekay_Esports', text: `OPERATION ACTIVE: The roster is fully locked and prepared to dominate at ${matchedEvent.title}. Let's go! 🇸🇦` },
      { platform: 'instagram', handle: 'geekay_esports', text: `Tactical prep done. All eyes on the trophy. We stream live on Twitch and YT. Drop an emoji to support!` }
    ]);

    return { teams, matches, results, media, social };
  }, [matchedEvent]);

  // Related events calculation
  const relatedEvents = useMemo(() => {
    if (!matchedEvent) return [];
    
    const all = (Array.isArray(dbEvents) ? dbEvents : []).filter(e => e.title && getEventSlug(e.title) !== eventName).map(e => ({
      ...e,
      title: e.title || '',
      status: e.status ? e.status.toLowerCase() : 'upcoming',
      start_date: e.start_date || '',
      banner: e.banner || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450'
    }));

    MOCK_EVENTS.forEach(mock => {
      const slug = getEventSlug(mock.title);
      const isCurrent = slug === eventName;
      const alreadyInList = all.some(e => e.title && getEventSlug(e.title) === slug);
      
      if (!isCurrent && !alreadyInList) {
        all.push({
          id: mock.id,
          title: mock.title,
          game: mock.game,
          status: mock.status.toLowerCase(),
          start_date: mock.date,
          banner: mock.image || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800&h=450',
          region: mock.location ? (mock.location.split(',')[1]?.trim() || 'GLOBAL') : 'GLOBAL'
        } as any);
      }
    });

    return all.slice(0, 3);
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
          1) EVENT HERO SECTION
          ==================================================== */}
      <div className="relative h-[70vh] min-h-[550px] overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src={matchedEvent.banner} 
            alt={matchedEvent.title} 
            className="w-full h-full object-cover grayscale brightness-[0.2]" 
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=600';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0B1C2D] via-[#0B1C2D]/40 to-transparent" />
          <div className="absolute inset-0 bg-grid opacity-10" />
        </div>

        {/* Back navigation and Breadcrumbs */}
        <div className="absolute top-28 left-8 md:left-12 z-50 flex flex-col gap-4">
          <Breadcrumbs />
          <Link 
            to="/events" 
            className="flex items-center gap-3 text-slate-400 hover:text-[#FFC400] transition-all font-syncopate text-[10px] font-black uppercase tracking-[0.4em] group"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-2 transition-transform" />
            <span>← BACK TO EVENTS</span>
          </Link>
        </div>

        {/* Hero content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 mt-16 z-10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center justify-center gap-3 mb-6"
          >
            <span className="bg-[#FFC400] text-black px-4 py-1.5 font-syncopate text-[9px] font-black tracking-[0.2em] uppercase skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">{matchedEvent.game}</span>
            </span>
            <span className="bg-white/10 backdrop-blur-sm text-white px-4 py-1.5 font-syncopate text-[9px] font-bold tracking-[0.2em] uppercase border border-white/10 skew-x-[-10deg]">
              <span className="block skew-x-[10deg]">{matchedEvent.region || 'GLOBAL'}</span>
            </span>
            <span className={`px-4 py-1.5 font-syncopate text-[9px] font-black tracking-[0.2em] uppercase border skew-x-[-10deg] ${
              isLive ? 'bg-red-500 text-white border-red-500 animate-pulse' :
              isUpcoming ? 'bg-[#FFC400]/10 text-[#FFC400] border-[#FFC400]' :
              'bg-slate-800 text-slate-400 border-slate-700'
            }`}>
              <span className="block skew-x-[10deg]">{matchedEvent.status}</span>
            </span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="font-syncopate text-4xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none max-w-4xl mb-6"
          >
            {matchedEvent.title}
          </motion.h1>

          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="flex flex-wrap items-center justify-center gap-8 text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-12"
          >
            <div className="flex items-center gap-2">
              <Calendar size={14} className="text-[#FFC400]" />
              <span>{matchedEvent.start_date} {matchedEvent.end_date && ` - ${matchedEvent.end_date}`}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin size={14} className="text-[#FFC400]" />
              <span>{matchedEvent.location || 'EMEA CENTER'}</span>
            </div>
            {matchedEvent.organizer && (
              <div className="flex items-center gap-2">
                <Users size={14} className="text-[#FFC400]" />
                <span>ORG: {matchedEvent.organizer}</span>
              </div>
            )}
          </motion.div>

          {/* Dynamic Countdown for upcoming events */}
          {isUpcoming && <CountdownTimer targetDate={matchedEvent.start_date} />}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 relative z-10 -mt-12 pb-32">

        {/* ====================================================
            2) EVENT INFORMATION OVERVIEW
            ==================================================== */}
        <section className="bg-[#081B3A]/90 border border-slate-800 p-8 md:p-12 mb-16 relative backdrop-blur-md">
          <div className="absolute top-0 left-0 w-full h-[3px] bg-[#FFC400]" />
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-7">
              <span className="font-syncopate text-[#FFC400] text-[9px] tracking-[0.4em] font-black mb-4 block uppercase">EVENT OVERVIEW</span>
              <h2 className="font-syncopate text-2xl font-black text-white uppercase tracking-tighter mb-6">TACTICAL INTELLIGENCE</h2>
              <p className="text-slate-300 font-inter text-base leading-relaxed font-light mb-8">
                {matchedEvent.description || `Geekay Esports deploys their tactical division for the highly anticipated ${matchedEvent.title}. This operation demands peak coordination, dynamic tactical flexibility, and top mechanical skill. Watch us make history.`}
              </p>
              
              <div className="border-t border-slate-900 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block mb-1">PURPOSE</span>
                  <p className="text-white font-syncopate text-xs font-bold uppercase">CHAMPIONSHIP VICTORY</p>
                </div>
                <div>
                  <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block mb-1">FORMAT</span>
                  <p className="text-[#FFC400] font-syncopate text-xs font-bold uppercase">DOUBLE ELIMINATION BRACKET</p>
                </div>
              </div>
            </div>

            {/* Side summary details card */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-4">
              <div className="bg-[#040E1E] border border-slate-900 p-6 flex flex-col justify-between">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">PRIZE POOL</span>
                <span className="font-syncopate text-xl md:text-2xl font-black text-[#FFC400] mt-4">{matchedEvent.prizePool || '$100,000'}</span>
              </div>
              <div className="bg-[#040E1E] border border-slate-900 p-6 flex flex-col justify-between">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">TOTAL TEAMS</span>
                <div className="mt-4">
                  <span className="font-syncopate text-3xl font-black text-white block leading-none">{teams.length || '16'}</span>
                  <span className="font-syncopate text-[9px] text-slate-400 font-bold tracking-wider block mt-1">CONTENDERS</span>
                </div>
              </div>
              <div className="bg-[#040E1E] border border-slate-900 p-6 flex flex-col justify-between">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">REGION</span>
                <span className="font-syncopate text-xl md:text-2xl font-black text-white mt-4">{matchedEvent.region || 'EMEA'}</span>
              </div>
              <div className="bg-[#040E1E] border border-slate-900 p-6 flex flex-col justify-between">
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">BROADCAST</span>
                <span className="font-syncopate text-xs md:text-sm font-black text-[#FFC400] mt-4 leading-normal">TWITCH / YOUTUBE</span>
              </div>
            </div>
          </div>
        </section>

        {/* ====================================================
            3) EVENT DETAILS SECTION
            ==================================================== */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-syncopate text-lg font-black text-white tracking-widest uppercase">EVENT DETAILS</h2>
            <div className="h-[1px] flex-grow bg-slate-800" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-[#081B3A] border border-slate-800 p-6 relative group hover:border-[#FFC400] transition-all">
              <Clock size={20} className="text-[#FFC400] mb-4" />
              <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">TIMELINE</span>
              <p className="text-white font-syncopate text-[10px] font-black uppercase">{matchedEvent.start_date} {matchedEvent.time && `| ${matchedEvent.time}`}</p>
            </div>

            <div className="bg-[#081B3A] border border-slate-800 p-6 relative group hover:border-[#FFC400] transition-all">
              <MapPin size={20} className="text-[#FFC400] mb-4" />
              <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">VENUE</span>
              <p className="text-white font-syncopate text-[10px] font-black uppercase">{matchedEvent.location || 'TO TBD CENTRUM'}</p>
            </div>

            <div className="bg-[#081B3A] border border-slate-800 p-6 relative group hover:border-[#FFC400] transition-all">
              <Tv size={20} className="text-[#FFC400] mb-4" />
              <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">BROADCAST PLATFORMS</span>
              <p className="text-white font-syncopate text-[10px] font-black uppercase">LIVE TWITCH.TV/GEEKAY</p>
            </div>

            <div className="bg-[#081B3A] border border-slate-800 p-6 relative group hover:border-[#FFC400] transition-all">
              <Radio size={20} className="text-[#FFC400] mb-4" />
              <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">OFFICIAL LINKS</span>
              <a 
                href={matchedEvent.link || 'https://x.com/geekay_esports'} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#FFC400] hover:text-white font-syncopate text-[10px] font-black uppercase flex items-center gap-1.5"
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
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-syncopate text-lg font-black text-white tracking-widest uppercase">PARTICIPATING TEAMS</h2>
            <div className="h-[1px] flex-grow bg-slate-800" />
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {teams.map((team: any, i: number) => (
              <Link 
                key={i} 
                to={`/teams`}
                className="bg-[#081B3A] border border-slate-800 p-6 flex flex-col items-center text-center group hover:border-[#FFC400] hover:shadow-[0_0_20px_rgba(255,196,0,0.1)] transition-all relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-8 h-8 bg-white/5 skew-x-[-45deg] translate-x-4 -translate-y-4" />
                
                <img 
                  src={team.logo || 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100'} 
                  alt={team.name} 
                  className="w-16 h-16 object-contain mb-4 grayscale group-hover:grayscale-0 transition-all duration-300"
                  onError={(e) => {
                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=100&h=100';
                  }}
                />
                
                <h4 className="font-syncopate text-xs font-black text-white uppercase tracking-tighter mb-1 line-clamp-1">{team.name}</h4>
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest uppercase">{team.region || 'EMEA'}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ====================================================
            5) MATCHES SECTION
            ==================================================== */}
        <section className="mb-20">
          <div className="flex items-center gap-4 mb-8">
            <h2 className="font-syncopate text-lg font-black text-white tracking-widest uppercase">TACTICAL SCHEDULE & MATCHES</h2>
            <div className="h-[1px] flex-grow bg-slate-800" />
          </div>

          <div className="space-y-4">
            {matches.map((match: any, i: number) => {
              const matchIsLive = match.status === 'live';
              const matchIsCompleted = match.status === 'finished' || match.status === 'completed';

              return (
                <div key={i} className="bg-[#081B3A] border border-slate-800 p-6 flex flex-col md:flex-row justify-between items-center gap-6 relative group hover:border-slate-700 transition-colors">
                  <div className="flex items-center gap-4">
                    <Calendar size={14} className="text-[#FFC400]" />
                    <span className="font-syncopate text-[9px] text-slate-500 tracking-widest uppercase">{match.date}</span>
                  </div>

                  <div className="flex items-center gap-8 md:gap-16">
                    <span className="font-syncopate text-sm md:text-base font-black text-white tracking-tighter uppercase">
                      {match.teams}
                    </span>
                    
                    <div className="bg-[#040E1E] border border-slate-800 px-6 py-2 min-w-[100px] text-center skew-x-[-10deg]">
                      <span className="font-syncopate text-sm font-black text-[#FFC400] block skew-x-[10deg]">
                        {match.score}
                      </span>
                    </div>
                  </div>

                  <div>
                    <span className={`px-4 py-1.5 font-syncopate text-[8px] font-black tracking-widest uppercase skew-x-[-10deg] ${
                      matchIsLive ? 'bg-red-500 text-white animate-pulse' :
                      matchIsCompleted ? 'bg-slate-800 text-slate-400 border border-slate-700' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      <span className="block skew-x-[10deg]">{match.status || 'upcoming'}</span>
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ====================================================
            6) RESULTS SECTION
            ==================================================== */}
        {isCompleted && results && results.winner && (
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-syncopate text-lg font-black text-white tracking-widest uppercase">FINALS PODIUM RESULTS</h2>
              <div className="h-[1px] flex-grow bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Winner podium card */}
              <div className="bg-[#081B3A] border-2 border-[#FFC400] p-8 flex flex-col items-center text-center relative overflow-hidden group">
                <div className="absolute top-0 right-0 bg-[#FFC400] text-black font-syncopate text-[8px] font-black px-4 py-1.5 uppercase skew-x-[-15deg] translate-x-3 translate-y-2">
                  <span className="block skew-x-[15deg] flex items-center gap-1"><Sparkles size={10} /> CHAMPION</span>
                </div>
                
                <Trophy size={48} className="text-[#FFC400] mb-6" />
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">1ST PLACE</span>
                <h3 className="font-syncopate text-2xl font-black text-white uppercase tracking-tighter mb-1">{results.winner}</h3>
                <p className="text-[#FFC400] font-syncopate text-[9px] font-black tracking-widest">🏆 GOLD MEDALISTS</p>
              </div>

              {/* Runner up podium card */}
              <div className="bg-[#081B3A] border border-slate-800 p-8 flex flex-col items-center text-center relative overflow-hidden">
                <Award size={48} className="text-slate-400 mb-6" />
                <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">2ND PLACE</span>
                <h3 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter mb-1">{results.runnerUp}</h3>
                <p className="text-slate-400 font-syncopate text-[9px] font-bold tracking-widest">🥈 SILVER RUNNERS</p>
              </div>

              {/* MVP podium card */}
              {results.mvp && (
                <div className="bg-[#081B3A] border border-slate-800 p-8 flex flex-col items-center text-center relative overflow-hidden">
                  <Star size={48} className="text-purple-400 mb-6" />
                  <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase mb-1">TOURNAMENT MVP</span>
                  <h3 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter mb-1">{results.mvp}</h3>
                  <p className="text-purple-400 font-syncopate text-[9px] font-black tracking-widest">⭐ MOST VALUABLE PLAYER</p>
                </div>
              )}
            </div>
          </section>
        )}

        {/* ====================================================
            7) MEDIA SECTION
            ==================================================== */}
        {media && media.length > 0 && (
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-syncopate text-lg font-black text-white tracking-widest uppercase">EVENT MEDIA ARCHIVE</h2>
              <div className="h-[1px] flex-grow bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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
                      <PlayCircle size={48} className="text-[#FFC400] opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
                    </div>
                  )}

                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute bottom-4 left-4 font-syncopate text-[8px] text-[#FFC400] font-black tracking-widest uppercase translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
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
          <section className="mb-20">
            <div className="flex items-center gap-4 mb-8">
              <h2 className="font-syncopate text-lg font-black text-white tracking-widest uppercase">SOCIAL COVERAGE</h2>
              <div className="h-[1px] flex-grow bg-slate-800" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {social.map((soc: any, i: number) => (
                <div key={i} className="bg-[#081B3A] border border-slate-800 p-6 relative">
                  <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-900">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-syncopate text-xs font-black text-white">
                        GK
                      </div>
                      <div>
                        <span className="font-syncopate text-[10px] font-black text-white block">GEEKAY ESPORTS</span>
                        <span className="font-syncopate text-[8px] text-slate-500 block">{soc.handle}</span>
                      </div>
                    </div>
                    {soc.platform === 'twitter' ? (
                      <Twitter size={16} className="text-[#FFC400]" />
                    ) : (
                      <Instagram size={16} className="text-[#FFC400]" />
                    )}
                  </div>
                  <p className="text-slate-300 font-inter text-sm leading-relaxed font-light">
                    {soc.text}
                  </p>
                  <div className="mt-6 flex items-center justify-between font-syncopate text-[7px] text-slate-500 tracking-widest uppercase">
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
          <section className="py-12 border-t border-slate-800">
            <div className="flex items-center justify-between mb-8">
              <h2 className="font-syncopate text-lg font-black text-white tracking-widest uppercase">RELATED OPERATIONS</h2>
              <Link to="/events" className="text-[#FFC400] font-syncopate text-[10px] font-black tracking-widest uppercase flex items-center gap-1">
                <span>VIEW FULL HUB</span>
                <ArrowRight size={12} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedEvents.map((ev, i) => (
                <div 
                  key={i}
                  onClick={() => navigate(`/events/${getEventSlug(ev.title)}`)}
                  className="bg-[#081B3A] border border-slate-800 p-6 flex flex-col justify-end min-h-[160px] relative overflow-hidden group cursor-pointer hover:border-[#FFC400] transition-colors"
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
                    <span className="bg-[#FFC400] text-black px-2 py-0.5 font-syncopate text-[7px] font-black tracking-widest uppercase inline-block mb-2">
                      {ev.game}
                    </span>
                    <h4 className="font-syncopate text-xs font-black text-white uppercase tracking-tighter leading-tight mb-2">{ev.title}</h4>
                    <span className="text-slate-500 font-syncopate text-[8px] tracking-widest block uppercase">{ev.start_date}</span>
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

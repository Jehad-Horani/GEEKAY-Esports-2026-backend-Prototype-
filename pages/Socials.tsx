
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring } from 'framer-motion';
import { Twitter, Twitch, Instagram, Youtube, Facebook, Heart, MessageCircle, Share2, Users, Zap, TrendingUp, BarChart3, Globe, Play, ArrowRight, Activity, Share, Target, Cpu, RefreshCw, Shield, Maximize2, X as CloseIcon, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import ArenaButton from '../components/ui/ArenaButton';
import Breadcrumbs from '../components/Breadcrumbs';
import SEOMeta from '../components/SEOMeta';

// --- Components ---

const AnimatedCounter = ({ value, label, suffix = "" }: { value: number, label: string, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      let start = 0;
      const end = value;
      const duration = 2000;
      const increment = end / (duration / 16);
      
      const counter = setInterval(() => {
        start += increment;
        if (start >= end) {
          setCount(end);
          clearInterval(counter);
        } else {
          setCount(Math.floor(start));
        }
      }, 16);
      return () => clearInterval(counter);
    }, 500);
  }, [value]);

  return (
    <div ref={ref} className="flex flex-col">
      <div className="font-syncopate text-4xl md:text-6xl font-black text-[#FFC400] leading-none mb-2">
        {count}{suffix}
      </div>
      <div className="font-syncopate text-[9px] text-slate-500 tracking-[0.4em] uppercase font-bold">
        {label}
      </div>
    </div>
  );
};

const StatCard = ({ label, value, suffix = "" }: { label: string, value: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = value;
          const duration = 2000;
          const increment = end / (duration / 16);
          
          const counter = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(counter);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <motion.div 
      ref={ref}
      whileHover={{ y: -10 }}
      className="bg-[#081B3A]/40 border border-slate-800 p-12 relative group overflow-hidden backdrop-blur-sm"
    >
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC400]/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-0 h-[2px] bg-[#FFC400] group-hover:w-full transition-all duration-700" />
      
      <div className="relative z-10 text-center">
        <div className="font-syncopate text-6xl md:text-8xl font-black text-white mb-4 tracking-tighter">
          {count}{suffix}
        </div>
        <div className="inline-block">
          <span className="font-syncopate text-[10px] text-slate-500 tracking-[0.5em] uppercase font-bold block mb-2">{label}</span>
          <div className="h-[2px] w-12 bg-[#FFC400] mx-auto opacity-40 group-hover:opacity-100 transition-opacity" />
        </div>
      </div>
      
      <div className="absolute -right-4 -bottom-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
        <BarChart3 size={160} />
      </div>
    </motion.div>
  );
};

const PlatformCard = ({ platform, icon, followers, engagement, growth }: any) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -5 }}
      className="bg-[#040E1E] border border-slate-800 p-8 relative group transition-all duration-300 hover:border-[#FFC400]/40"
    >
      <div className="absolute top-0 left-0 w-1 h-0 bg-[#FFC400] group-hover:h-full transition-all duration-500" />
      
      <div className="flex items-center justify-between mb-8">
        <div className="p-3 bg-white/5 border border-slate-800 text-slate-400 group-hover:text-[#FFC400] group-hover:shadow-[0_0_20px_rgba(255,196,0,0.2)] transition-all duration-300">
          {icon}
        </div>
        <div className="text-right">
          <span className="font-syncopate text-[8px] text-slate-600 tracking-widest block uppercase mb-1">GROWTH</span>
          <span className="font-syncopate text-xs font-bold text-green-500">{growth}</span>
        </div>
      </div>

      <div className="mb-6">
        <h3 className="font-syncopate text-xl font-black text-white uppercase mb-1">{platform}</h3>
        <p className="font-syncopate text-[10px] text-slate-500 tracking-widest uppercase">{followers}</p>
      </div>

      <div className="pt-6 border-t border-slate-800/50">
        <div className="flex justify-between items-center">
          <span className="font-syncopate text-[8px] text-slate-600 tracking-widest uppercase">ENGAGEMENT</span>
          <span className="font-syncopate text-xs font-bold text-white">{engagement}</span>
        </div>
      </div>
    </motion.div>
  );
};

const GALLERY_IMAGES = [
  { id: 1, category: 'TEAM PHOTOS', title: 'SQUAD_ALPHA', url: 'https://picsum.photos/seed/esports1/1200/800' },
  { id: 2, category: 'BOOTCAMP', title: 'TACTICAL_HUB_DUBAI', url: 'https://picsum.photos/seed/gaming1/1200/800' },
  { id: 3, category: 'LAN EVENTS', title: 'VCT_TOKYO_STAGE', url: 'https://picsum.photos/seed/arena1/1200/800' },
  { id: 4, category: 'TROPHY MOMENTS', title: 'CHAMPIONS_RISE', url: 'https://picsum.photos/seed/trophy1/1200/800' },
  { id: 5, category: 'TEAM PHOTOS', title: 'ROSTER_REVEAL', url: 'https://picsum.photos/seed/esports2/1200/800' },
  { id: 6, category: 'BOOTCAMP', title: 'LATE_NIGHT_STRATS', url: 'https://picsum.photos/seed/gaming2/1200/800' },
  { id: 7, category: 'LAN EVENTS', title: 'CROWD_ENERGY', url: 'https://picsum.photos/seed/arena2/1200/800' },
  { id: 8, category: 'TROPHY MOMENTS', title: 'GOLDEN_ERA', url: 'https://picsum.photos/seed/trophy2/1200/800' },
  { id: 9, category: 'TEAM PHOTOS', title: 'OFFICIAL_JERSEY', url: 'https://picsum.photos/seed/esports3/1200/800' },
  { id: 10, category: 'BOOTCAMP', title: 'HARDWARE_SYNC', url: 'https://picsum.photos/seed/gaming3/1200/800' },
  { id: 11, category: 'LAN EVENTS', title: 'MAIN_STAGE_LIGHTS', url: 'https://picsum.photos/seed/arena3/1200/800' },
  { id: 12, category: 'TROPHY MOMENTS', title: 'VICTORY_ROAR', url: 'https://picsum.photos/seed/trophy3/1200/800' },
  { id: 13, category: 'TEAM PHOTOS', title: 'SQUAD_BETA', url: 'https://picsum.photos/seed/esports4/1200/800' },
  { id: 14, category: 'BOOTCAMP', title: 'PERFORMANCE_LAB', url: 'https://picsum.photos/seed/gaming4/1200/800' },
  { id: 15, category: 'LAN EVENTS', title: 'ARENA_ENTRANCE', url: 'https://picsum.photos/seed/arena4/1200/800' },
  { id: 16, category: 'TROPHY MOMENTS', title: 'LEGACY_UNLOCKED', url: 'https://picsum.photos/seed/trophy4/1200/800' },
  { id: 17, category: 'TEAM PHOTOS', title: 'COACHING_STAFF', url: 'https://picsum.photos/seed/esports5/1200/800' },
  { id: 18, category: 'BOOTCAMP', title: 'RECOVERY_ZONE', url: 'https://picsum.photos/seed/gaming5/1200/800' },
  { id: 19, category: 'LAN EVENTS', title: 'PRESS_CONFERENCE', url: 'https://picsum.photos/seed/arena5/1200/800' },
  { id: 20, category: 'TROPHY MOMENTS', title: 'PODIUM_FINISH', url: 'https://picsum.photos/seed/trophy5/1200/800' },
];

const SnapchatIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M12 3c-2.5 0-4.5 2-4.5 4.5 0 1.5.8 2.8 2 3.5-.5.5-1 1.2-1 2 0 1.1.9 2 2 2s2-.9 2-2c0-.8-.5-1.5-1-2 1.2-.7 2-2 2-3.5 0-2.5-2-4.5-4.5-4.5z" />
    <path d="M12 15c-3.5 0-6.5 2-6.5 5 0 .5.5 1 1 1h11c.5 0 1-.5 1-1 0-3-3-5-6.5-5z" />
  </svg>
);

const TikTokIcon = ({ size = 24, className = "" }) => (
  <svg 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2" 
    strokeLinecap="round" 
    strokeLinejoin="round" 
    className={className}
  >
    <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
  </svg>
);

const SocialDropdown = ({ platform, accounts, icon: Icon, isCustom = false }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const isMulti = Array.isArray(accounts);

  return (
    <div className="relative" ref={containerRef}>
      <motion.button
        whileHover={{ scale: 1.1, boxShadow: "0 0 20px rgba(255, 196, 0, 0.4)" }}
        whileTap={{ scale: 0.95 }}
        onClick={() => isMulti ? setIsOpen(!isOpen) : window.open(accounts.url, '_blank')}
        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 border ${isOpen ? 'bg-[#FFC400] border-[#FFC400] text-black' : 'bg-white/5 border-white/10 text-white hover:border-[#FFC400]/50'}`}
      >
        {isCustom ? <Icon size={24} /> : <Icon size={24} />}
      </motion.button>

      <AnimatePresence>
        {isOpen && isMulti && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-4 w-64 z-50"
          >
            <div className="bg-[#040E1E]/95 backdrop-blur-xl border border-white/10 p-2 shadow-2xl">
              <div className="px-3 py-2 border-b border-white/5 mb-1">
                <span className="font-syncopate text-[8px] text-slate-500 tracking-widest uppercase">{platform} ACCOUNTS</span>
              </div>
              {accounts.map((acc: any, i: number) => (
                <a
                  key={i}
                  href={acc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-between p-3 hover:bg-white/5 transition-colors group"
                >
                  <div className="flex flex-col">
                    <span className="font-syncopate text-[10px] font-bold text-white group-hover:text-[#FFC400] transition-colors">{acc.name}</span>
                    <span className="font-inter text-[9px] text-slate-500">{acc.handle}</span>
                  </div>
                  <ExternalLink size={12} className="text-slate-600 group-hover:text-[#FFC400] transition-colors" />
                </a>
              ))}
            </div>
            <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-[#040E1E]/95" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MarqueeRow = ({ images, direction = "left", speed = 40, onImageClick }: { images: any[], direction?: "left" | "right", speed?: number, onImageClick: (img: any) => void }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <div className="relative overflow-hidden py-4">
      <motion.div 
        className="flex gap-6 whitespace-nowrap"
        animate={{ 
          x: direction === "left" ? [0, -1000] : [-1000, 0] 
        }}
        transition={{ 
          duration: speed, 
          repeat: Infinity, 
          ease: "linear",
          paused: isHovered 
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {[...images, ...images, ...images].map((img, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05, zIndex: 10 }}
            onClick={() => onImageClick(img)}
            className="relative flex-shrink-0 w-[350px] aspect-[16/10] overflow-hidden border border-white/5 group cursor-pointer"
          >
            <img 
              src={img.url} 
              alt={img.title}
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
              <span className="font-syncopate text-[8px] text-[#FFC400] tracking-widest uppercase mb-1">{img.category}</span>
              <h4 className="font-syncopate text-xs font-bold text-white uppercase">{img.title}</h4>
            </div>
            <div className="absolute inset-0 border-2 border-[#FFC400] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-[inset_0_0_30px_rgba(255,196,0,0.2)]" />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};

const Media = () => {
  const [selectedImage, setSelectedImage] = useState<any>(null);

  const socialAccounts = {
    instagram: [
      { name: 'GEEKAY ESPORTS', handle: '@geekayesports', url: '#' },
      { name: 'GEEKAY ACADEMY', handle: '@geekayacademy', url: '#' },
    ],
    tiktok: [
      { name: 'GEEKAY MAIN', handle: '@geekayesports', url: '#' },
      { name: 'GEEKAY CLIPS', handle: '@geekayclips', url: '#' },
    ],
    x: [
      { name: 'GEEKAY EN', handle: '@Geekay_Esports', url: '#' },
      { name: 'GEEKAY AR', handle: '@Geekay_AR', url: '#' },
    ],
    facebook: { name: 'GEEKAY ESPORTS', handle: 'GeekayEsports', url: '#' },
    youtube: { name: 'GEEKAY ESPORTS', handle: 'GeekayEsports', url: '#' },
    snapchat: { name: 'GEEKAY ESPORTS', handle: 'geekayesports', url: '#' },
  };

  const row1 = GALLERY_IMAGES.slice(0, 7);
  const row2 = GALLERY_IMAGES.slice(7, 14);
  const row3 = GALLERY_IMAGES.slice(14, 20);

  const openLightbox = (img: any) => setSelectedImage(img);
  const closeLightbox = () => setSelectedImage(null);

  const navigateLightbox = (direction: 'prev' | 'next') => {
    const currentIndex = GALLERY_IMAGES.findIndex(img => img.id === selectedImage.id);
    let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;
    if (nextIndex >= GALLERY_IMAGES.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = GALLERY_IMAGES.length - 1;
    setSelectedImage(GALLERY_IMAGES[nextIndex]);
  };
  return (
    <div className="bg-[#0B1C2D] min-h-screen overflow-x-hidden selection:bg-[#FFC400] selection:text-black">
      
      {/* 🎬 SECTION 1: HERO */}
      <section className="relative h-screen w-full flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <motion.div 
            animate={{ 
              opacity: [0.3, 0.5, 0.3],
              scale: [1, 1.1, 1] 
            }}
            transition={{ duration: 10, repeat: Infinity }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[1200px] h-[1200px] bg-[#FFC400]/5 rounded-full blur-[150px] z-0" 
          />
          <div className="absolute inset-0 bg-grid opacity-10 pointer-events-none" />
          <div className="absolute inset-0 bg-scanline opacity-20 pointer-events-none" />
          
          <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
             {[...Array(20)].map((_, i) => (
               <motion.div 
                 key={i}
                 initial={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
                 animate={{ x: Math.random() * 100 + "%", y: Math.random() * 100 + "%" }}
                 transition={{ duration: 20 + Math.random() * 10, repeat: Infinity, ease: "linear" }}
                 className="absolute w-1 h-1 bg-white rounded-full"
               />
             ))}
          </div>
        </div>

        <div className="container mx-auto px-6 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center pt-24">
          <div className="lg:col-span-8">
            <Breadcrumbs />
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1 }}>
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: 60 }}
                transition={{ duration: 1, delay: 0.5 }}
                className="h-[2px] bg-[#FFC400] mb-8"
              />
              
              <div className="overflow-hidden mb-2">
                <motion.h1 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 0.8, delay: 0.7, ease: "circOut" }}
                  className="font-syncopate text-white text-4xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9]"
                >
                  WE DON’T POST.
                </motion.h1>
              </div>
              <div className="overflow-hidden mb-12">
                <motion.h1 
                  initial={{ y: "100%" }}
                  animate={{ y: 0 }}
                  transition={{ duration: 1.2, delay: 1, ease: [0.16, 1, 0.3, 1] }}
                  className="font-syncopate text-[#FFC400] text-4xl md:text-8xl font-black uppercase tracking-tighter leading-[0.9] drop-shadow-[0_0_30px_rgba(255,196,0,0.3)]"
                >
                  WE COMMAND <br /> ATTENTION.
                </motion.h1>
              </div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
                className="flex flex-wrap gap-6 items-center"
              >
                <SocialDropdown platform="INSTAGRAM" accounts={socialAccounts.instagram} icon={Instagram} />
                <SocialDropdown platform="TIKTOK" accounts={socialAccounts.tiktok} icon={TikTokIcon} isCustom />
                <SocialDropdown platform="X (TWITTER)" accounts={socialAccounts.x} icon={Twitter} />
                <SocialDropdown platform="FACEBOOK" accounts={socialAccounts.facebook} icon={Facebook} />
                <SocialDropdown platform="YOUTUBE" accounts={socialAccounts.youtube} icon={Youtube} />
                <SocialDropdown platform="SNAPCHAT" accounts={socialAccounts.snapchat} icon={SnapchatIcon} isCustom />
              </motion.div>
            </motion.div>
          </div>

          <div className="lg:col-span-4 lg:flex flex-col gap-12 pl-0 lg:pl-20 border-l border-white/5 hidden">
             <AnimatedCounter value={2.4} label="COMBINED REACH" suffix="M+" />
             <AnimatedCounter value={1.2} label="MONTHLY GROWTH" suffix="M+" />
             <AnimatedCounter value={5} label="DOMINATED PLATFORMS" />
          </div>
        </div>

        <motion.div 
          animate={{ y: [0, 5, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 opacity-20"
        >
          <div className="w-[1px] h-12 bg-gradient-to-b from-[#FFC400] to-transparent" />
        </motion.div>
      </section>

      {/* 📊 SECTION 2: GLOBAL MEDIA REACH */}
      <section className="py-32 md:py-60 px-6 bg-[#040E1E] relative border-y border-white/5">
        <div className="absolute inset-0 bg-grid opacity-5 pointer-events-none" />
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-24">
            <h2 className="font-syncopate text-4xl md:text-7xl font-black text-white uppercase tracking-tighter mb-6">GLOBAL MEDIA REACH</h2>
            <p className="text-slate-400 font-inter text-xl font-light tracking-wide max-w-2xl mx-auto uppercase">
              Audience reach across Geekay platforms, teams, and creators.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <StatCard label="TOTAL REACH" value={2.4} suffix="M+" />
            <StatCard label="TOTAL PLATFORMS" value={9} />
            <StatCard label="COMBINED FOLLOWING" value={2.3} suffix="M+" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#081B3A]/40 border border-slate-800 p-12 relative group overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC400]/30 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-syncopate text-xl font-bold text-[#FFC400] mb-6 uppercase tracking-widest">Demographics</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm text-slate-400 uppercase">Millennials</span>
                    <span className="font-syncopate text-lg font-bold text-white">43%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm text-slate-400 uppercase">Gen Z</span>
                    <span className="font-syncopate text-lg font-bold text-white">41%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-inter text-sm text-slate-400 uppercase">Gen Alpha</span>
                    <span className="font-syncopate text-lg font-bold text-white">3%</span>
                  </div>
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#081B3A]/40 border border-slate-800 p-12 relative group overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC400]/30 to-transparent" />
              <div className="relative z-10">
                <h3 className="font-syncopate text-xl font-bold text-[#FFC400] mb-6 uppercase tracking-widest">Regions</h3>
                <div className="grid grid-cols-2 gap-4">
                  {['GCC', 'MENA', 'EU', 'Asia'].map(region => (
                    <div key={region} className="bg-white/5 border border-white/5 p-4 text-center">
                      <span className="font-syncopate text-sm font-bold text-white">{region}</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#081B3A]/40 border border-slate-800 p-12 relative group overflow-hidden backdrop-blur-sm"
            >
              <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC400]/30 to-transparent" />
              <div className="relative z-10 text-center">
                <h3 className="font-syncopate text-xl font-bold text-[#FFC400] mb-6 uppercase tracking-widest">Stores</h3>
                <div className="font-syncopate text-6xl font-black text-white mb-2">40</div>
                <p className="font-inter text-sm text-slate-400 uppercase tracking-widest">Retail Stores across GCC</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 🏆 SECTION 3: TOURNAMENT METRICS */}
      <section className="py-32 md:py-60 px-6 bg-[#0B1C2D] relative border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <h2 className="font-syncopate text-4xl md:text-7xl font-bold uppercase tracking-tighter text-white mb-6">Tournament Metrics</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#040E1E] border border-slate-800 p-12 relative group overflow-hidden"
            >
              <div className="font-syncopate text-6xl font-black text-[#FFC400] mb-4 tracking-tighter">30M+</div>
              <span className="font-syncopate text-[10px] text-slate-500 tracking-[0.5em] uppercase font-bold">Total Tournament Reach</span>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#040E1E] border border-slate-800 p-12 relative group overflow-hidden"
            >
              <div className="font-syncopate text-6xl font-black text-[#FFC400] mb-4 tracking-tighter">1M</div>
              <span className="font-syncopate text-[10px] text-slate-500 tracking-[0.5em] uppercase font-bold block mb-2">LAN Attendance</span>
              <p className="text-[9px] text-slate-600 font-inter italic">Data to be updated tomorrow night</p>
            </motion.div>

            <motion.div 
              whileHover={{ y: -10 }}
              className="bg-[#040E1E] border border-slate-800 p-12 relative group overflow-hidden"
            >
              <h3 className="font-syncopate text-[10px] text-slate-500 tracking-[0.5em] uppercase font-bold mb-8">Geographics</h3>
              <div className="space-y-4">
                {['Riyadh (KSA)', 'Malaysia', 'China', 'Europe (France)'].map(region => (
                  <div key={region} className="flex items-center gap-3">
                    <div className="w-1.5 h-1.5 bg-[#FFC400]" />
                    <span className="font-syncopate text-[10px] text-white uppercase tracking-widest">{region}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 📱 SECTION 4: PLATFORM BREAKDOWN */}
      <section className="py-32 md:py-60 px-6 bg-[#081B3A] relative border-b border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="mb-24">
            <h2 className="font-syncopate text-4xl md:text-7xl font-bold uppercase tracking-tighter text-white mb-6">TOTAL PLATFORM BREAKDOWN</h2>
            <p className="text-slate-400 font-inter text-xl font-light tracking-wide max-w-2xl uppercase">
              Performance metrics by platform.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            <PlatformCard platform="INSTAGRAM" icon={<Instagram size={24} />} followers="240K" engagement="15.1%" growth="+12%" />
            <PlatformCard platform="X (TWITTER)" icon={<Twitter size={24} />} followers="399K" engagement="8.2%" growth="+24%" />
            <PlatformCard platform="TIKTOK" icon={<Zap size={24} />} followers="481K" engagement="18.5%" growth="+45%" />
            <PlatformCard platform="YOUTUBE" icon={<Youtube size={24} />} followers="523K" engagement="10.8%" growth="+30%" />
            <PlatformCard platform="TWITCH" icon={<Twitch size={24} />} followers="645K" engagement="12.4%" growth="+18%" />
          </div>
        </div>
      </section>

      {/* 🖼 SECTION 5: MEDIA GALLERY */}
      <section className="py-32 md:py-60 bg-[#040E1E] relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 mb-24">
          <h2 className="font-syncopate text-4xl md:text-7xl font-bold uppercase tracking-tighter text-white mb-6">MEDIA GALLERY</h2>
          <p className="text-slate-400 font-inter text-xl font-light tracking-wide max-w-2xl uppercase">
            Team moments, competition highlights, and behind-the-scenes media.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <MarqueeRow images={row1} direction="left" speed={60} onImageClick={openLightbox} />
          <MarqueeRow images={row2} direction="right" speed={50} onImageClick={openLightbox} />
          <MarqueeRow images={row3} direction="left" speed={70} onImageClick={openLightbox} />
        </div>
      </section>

      {/* 🔦 LIGHTBOX VIEWER */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-xl flex items-center justify-center p-6 md:p-12"
          >
            <button 
              onClick={closeLightbox}
              className="absolute top-24 right-12 w-14 h-14 bg-[#FFC400] text-black rounded-full flex items-center justify-center transition-all duration-300 z-[110] shadow-[0_0_30px_rgba(255,196,0,0.4)] hover:scale-110 active:scale-95"
            >
              <CloseIcon size={28} />
            </button>

            <button 
              onClick={() => navigateLightbox('prev')}
              className="absolute left-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#FFC400] transition-colors z-[110]"
            >
              <ChevronLeft size={60} />
            </button>

            <button 
              onClick={() => navigateLightbox('next')}
              className="absolute right-8 top-1/2 -translate-y-1/2 text-white/40 hover:text-[#FFC400] transition-colors z-[110]"
            >
              <ChevronRight size={60} />
            </button>

            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center"
            >
              <img 
                src={selectedImage.url} 
                alt={selectedImage.title}
                className="max-w-full max-h-[65vh] object-contain shadow-[0_0_100px_rgba(255,196,0,0.1)]"
                referrerPolicy="no-referrer"
              />
              <div className="mt-8 text-center">
                <span className="font-syncopate text-[10px] text-[#FFC400] tracking-[0.6em] mb-4 block uppercase">{selectedImage.category}</span>
                <h3 className="font-syncopate text-2xl md:text-4xl font-black text-white uppercase tracking-tighter">{selectedImage.title}</h3>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Media;

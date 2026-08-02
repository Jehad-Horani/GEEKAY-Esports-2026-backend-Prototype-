
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useScroll, useTransform, useSpring, useInView } from 'framer-motion';
import { ChevronRight, ChevronDown, PlayCircle, Search, BarChart3, Globe, Shield, X, Twitter, Twitch, Cpu, Target, Layers, Zap, ArrowDown, ArrowRight, Clock, Calendar, MapPin, Trophy, Instagram, Youtube } from 'lucide-react';
import SocialFollowerIcon from '../components/SocialFollowerIcon';
import ArenaButton from '../components/ui/ArenaButton';
import { MOCK_EVENTS, MOCK_TEAMS, MOCK_NEWS, MOCK_PRODUCTS } from '../constants';
import { Link } from 'react-router-dom';
import { Player, NewsItem, Product } from '../types';
import SEOMeta from '../components/SEOMeta';

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

const Hero = () => {
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

          {/* RIGHT: Compact Match Panel */}
          <div className="hidden lg:flex items-center justify-center relative z-10">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.4, delay: 0.2 }}
              className="w-full max-w-md space-y-4"
            >
              {/* Upcoming Matches */}
              <div className="bg-[#0A1A31]/60 backdrop-blur-md border border-[#FFC400]/20 p-4 relative overflow-hidden group">
                <div className="absolute top-0 left-0 w-1 h-full bg-[#FFC400]/50" />
                <h3 className="font-syncopate text-[8px] font-black text-[#FFC400] tracking-[0.4em] uppercase mb-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFC400] animate-pulse" />
                  UPCOMING MATCHES
                </h3>
                
                <div className="space-y-2">
                  {[
                    { game: 'VALORANT', opp: 'TEAM FALCONS', date: 'FEB 28', time: '18:00' },
                    { game: 'DOTA 2', opp: 'NIGMA GALAXY', date: 'MAR 02', time: '20:00' }
                  ].map((match, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="text-[#FFC400] font-syncopate text-[7px] font-bold tracking-widest">{match.game}</div>
                        <div className="text-white font-syncopate text-[10px] font-black tracking-tight">VS {match.opp}</div>
                      </div>
                      <div className="text-right">
                        <div className="text-white/60 font-syncopate text-[8px] tracking-widest">{match.date}</div>
                        <div className="text-white/40 font-syncopate text-[7px] tracking-widest">{match.time} GST</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Past Results */}
              <div className="bg-[#0A1A31]/60 backdrop-blur-md border border-white/10 p-4 relative overflow-hidden group">
                <h3 className="font-syncopate text-[8px] font-black text-white/40 tracking-[0.4em] uppercase mb-3">
                  PAST RESULTS
                </h3>
                
                <div className="space-y-2">
                  {[
                    { game: 'VALORANT', opp: 'TEAM SECRET', res: 'WIN', score: '2-1' },
                    { game: 'DOTA 2', opp: 'OG', res: 'LOSS', score: '0-2' }
                  ].map((result, i) => (
                    <div key={i} className="flex items-center justify-between border-b border-white/5 pb-2 last:border-0 last:pb-0">
                      <div>
                        <div className="text-white/40 font-syncopate text-[7px] font-bold tracking-widest">{result.game}</div>
                        <div className="text-white/80 font-syncopate text-[10px] font-black tracking-tight">VS {result.opp}</div>
                      </div>
                      <div className="text-right flex items-center gap-2">
                        <div className="text-white font-syncopate text-[10px] font-black">{result.score}</div>
                        <div className={`font-syncopate text-[8px] font-black px-1.5 py-0.5 ${result.res === 'WIN' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                          {result.res}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tactical Decor */}
              <div className="absolute -top-2 -right-2 w-12 h-12 border-t border-r border-[#FFC400]/10 pointer-events-none" />
              <div className="absolute -bottom-2 -left-2 w-12 h-12 border-b border-l border-[#FFC400]/10 pointer-events-none" />
            </motion.div>
          </div>

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

// --- ProductCard Component ---
const ProductCard = ({ product }: { product: Product }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [showMobileRegions, setShowMobileRegions] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState<string | null>(localStorage.getItem('geekay_region'));

  const regions = [
    { name: 'UAE', link: product.link },
    { name: 'KSA', link: 'https://www.geekay.com/saudi_en/' },
    { name: 'GLOBAL', link: 'https://www.geekay.com/global/' },
  ];

  const handleRegionSelect = (region: string, link: string) => {
    localStorage.setItem('geekay_region', region);
    setSelectedRegion(region);
    window.open(link, '_blank');
    setShowMobileRegions(false);
  };

  return (
    <>
      <motion.div
        className="group relative bg-[#0A1A31]/40 border border-slate-800 hover:border-[#FFC400]/40 transition-all duration-500 overflow-hidden cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (window.innerWidth < 1024) {
            setShowMobileRegions(true);
          }
        }}
      >
        {/* Product Image */}
        <div className="aspect-square overflow-hidden relative">
          <motion.img
            src={product.image}
            alt={product.name}
            animate={{ scale: isHovered ? 1.1 : 1 }}
            transition={{ duration: 0.6 }}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
            onError={(e) => {
              (e.target as HTMLImageElement).src = `https://picsum.photos/seed/${product.id}/600/600`;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#081B3A] via-transparent to-transparent opacity-60" />
          
          {/* Region Selector Overlay (Desktop) */}
          <AnimatePresence>
            {isHovered && window.innerWidth >= 1024 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="absolute inset-0 flex items-center justify-center bg-[#081B3A]/90 backdrop-blur-md z-[500] p-6"
              >
                <div className="w-full space-y-3">
                  <p className="font-syncopate text-[8px] text-[#FFC400] tracking-[0.3em] text-center mb-4">SELECT REGION</p>
                  {regions.map((r) => (
                    <button
                      key={r.name}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegionSelect(r.name, r.link);
                      }}
                      className="w-full py-3 border border-white/10 hover:border-[#FFC400] hover:bg-[#FFC400]/10 text-white font-syncopate text-[10px] tracking-widest transition-all flex items-center justify-between px-4 group/btn"
                    >
                      {r.name}
                      <ArrowRight size={12} className="opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Product Info */}
        <div className="p-6">
          <div className="flex justify-between items-start mb-2">
            <span className="text-[#FFC400] font-syncopate text-[8px] font-black tracking-widest uppercase">{product.category}</span>
            {selectedRegion && (
              <span className="text-white/20 font-syncopate text-[7px] tracking-widest uppercase">SHIPPING TO: {selectedRegion}</span>
            )}
          </div>
          <h4 className="font-syncopate text-sm font-bold text-white uppercase mb-4 line-clamp-2 group-hover:text-[#FFC400] transition-colors">
            {product.name}
          </h4>
          <div className="flex justify-between items-center">
            <span className="font-syncopate text-lg font-black text-white">
              {product.price && product.price !== 'TBA' ? `AED ${product.price}` : 'TBA'}
            </span>
            <div className="w-8 h-8 rounded-full border border-white/10 flex items-center justify-center group-hover:border-[#FFC400] group-hover:bg-[#FFC400]/10 transition-all">
              <ArrowRight size={14} className="text-white group-hover:text-[#FFC400]" />
            </div>
          </div>
        </div>

        {/* Corner Markers */}
        <div className="absolute top-0 right-0 w-8 h-8 border-t border-r border-[#FFC400]/10 group-hover:border-[#FFC400]/40 transition-colors" />
      </motion.div>

      {/* Mobile Bottom Sheet */}
      <AnimatePresence>
        {showMobileRegions && (
          <div className="fixed inset-0 z-[1000] lg:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowMobileRegions(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
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
              <p className="text-white/40 font-syncopate text-[10px] tracking-widest uppercase mb-8">Choose your store for {product.name}</p>
              
              <div className="space-y-3">
                {regions.map((r) => (
                  <button
                    key={r.name}
                    onClick={() => handleRegionSelect(r.name, r.link)}
                    className="w-full py-5 border border-white/10 active:border-[#FFC400] active:bg-[#FFC400]/10 text-white font-syncopate text-xs tracking-widest transition-all flex items-center justify-between px-6"
                  >
                    {r.name}
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
    </>
  );
};

const ShopSection = () => {
  return (
    <section className="py-32 px-6 bg-[#030C1A] border-b border-slate-900 relative z-50 overflow-visible">
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto overflow-visible relative">
        <div className="mb-20 flex flex-col items-center text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-6"
          >
            SHOP THE <span className="text-[#FFC400]">GEEKAY COLLECTION</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.5 }}
            viewport={{ once: true }}
            className="text-white font-syncopate text-[10px] md:text-sm tracking-[0.5em] uppercase font-light"
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
              <ProductCard product={product} />
            </motion.div>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <ShopDropdown variant="outline" />
        </div>
      </div>
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
          <div className="absolute bottom-10 left-10">
            <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.4em] font-bold block mb-2 uppercase">{player.role}</span>
            <h2 className="font-syncopate text-5xl md:text-7xl font-bold leading-none">{player.nickname}</h2>
          </div>
        </div>

        <div className="p-8 md:p-16 flex flex-col justify-center">
          <div className="flex gap-5 mb-10">
            {Object.entries(player.socials).map(([platform, count]) => (
              count && count !== '#' && (
                <SocialFollowerIcon 
                  key={platform}
                  platform={platform} 
                  count={count}
                  size={24}
                  className="text-slate-400 hover:text-[#FFC400]"
                />
              )
            ))}
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

const NewsAnnouncements = () => {
  const news = MOCK_NEWS.slice(0, 3);
  const featured = news[0]; // International Qualifications
  const others = news.slice(1); // RL Decals and Roster Announcements

  return (
    <section className="py-32 px-6 bg-[#081B3A] relative z-10 overflow-hidden border-t border-white/5 border-b border-slate-800/50">
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        {/* Header Row */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 mb-16">
          <div className="space-y-4">
            <motion.h2 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="font-syncopate text-4xl md:text-6xl font-bold text-white uppercase tracking-tighter relative inline-block"
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
                src={featured.image} 
                alt={featured.title} 
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
                    src={item.image} 
                    alt={item.title} 
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

const AboutSnapshot = () => {
  const sectionRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"]
  });

  const leftY = useTransform(scrollYProgress, [0, 1], [20, -20]);
  const rightY = useTransform(scrollYProgress, [0, 1], [-20, 20]);

  const stats = [
    { label: 'GLOBAL COMMUNITY', value: '24.1M', sub: 'Active network' },
    { label: 'MAJOR TITLES', value: '32', sub: 'Championship wins' },
    { label: 'WIN RATE', value: '68%', sub: 'Last 100 matches' },
    { label: 'ACTIVE TEAMS', value: '12', sub: 'Elite divisions' },
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
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="font-syncopate text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-[1.1] mb-8"
          >
            WHO IS <span className="text-[#FFC400]">GEEKAY ESPORTS?</span>
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-slate-400 text-base md:text-lg font-light leading-relaxed mb-10 max-w-md"
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

const LiveOperationsHighlight = () => {
  const upcomingMatches = [
    {
      id: 'm1',
      game: 'VALORANT',
      title: 'VCT CHALLENGERS',
      opponent: 'TEAM FALCONS',
      date: 'FEB 28, 2026',
      time: '18:00 GST',
      region: 'MENA',
      countdown: '2D 11H'
    },
    {
      id: 'm2',
      game: 'DOTA 2',
      title: 'RIYADH MASTERS',
      opponent: 'NIGMA GALAXY',
      date: 'MAR 02, 2026',
      time: '20:00 GST',
      region: 'GLOBAL',
      countdown: '4D 13H'
    },
    {
      id: 'm3',
      game: 'CS2',
      title: 'PRO LEAGUE S13',
      opponent: 'G2 ESPORTS',
      date: 'MAR 05, 2026',
      time: '19:30 GST',
      region: 'EU',
      countdown: '7D 12H'
    }
  ];

  const featuredTournament = MOCK_EVENTS[1]; // THE INTERNATIONAL 2026

  return (
    <section className="py-32 px-6 bg-[#081B3A] relative z-10 overflow-hidden border-t border-slate-800/50">
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4"
          >
            UPCOMING <span className="text-[#FFC400]">MATCHES</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            className="text-slate-400 font-syncopate text-[10px] tracking-[0.2em] uppercase"
          >
            Upcoming matches and featured tournaments.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Column: Upcoming Matches */}
          <div className="lg:col-span-7 space-y-6">
            <h3 className="font-syncopate text-xs font-bold text-white/40 tracking-[0.3em] uppercase mb-8">UPCOMING MATCHES</h3>
            {upcomingMatches.map((match, idx) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="group relative bg-[#0A1A31]/40 border border-slate-800 p-6 md:p-8 hover:border-[#FFC400]/30 transition-all overflow-hidden"
              >
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                  <div className="space-y-4">
                    <span className="text-[#FFC400] font-syncopate text-[9px] font-black tracking-widest uppercase">{match.game}</span>
                    <div className="space-y-1">
                      <h4 className="font-syncopate text-lg md:text-xl font-bold text-white uppercase">{match.title}</h4>
                      <p className="text-slate-400 font-syncopate text-[10px] tracking-widest uppercase">VS {match.opponent}</p>
                    </div>
                  </div>
                  
                  <div className="flex flex-col md:items-end gap-2">
                    <div className="flex items-center gap-3 text-slate-300 font-syncopate text-[10px] tracking-widest">
                      <Calendar size={14} className="text-[#FFC400]" />
                      <span>{match.date}</span>
                    </div>
                    <div className="flex items-center gap-3 text-slate-500 font-syncopate text-[10px] tracking-widest">
                      <Clock size={14} />
                      <span>{match.time} // {match.region}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="px-3 py-1 bg-[#FFC400]/10 border border-[#FFC400]/20 text-[#FFC400] font-syncopate text-[8px] font-bold tracking-widest uppercase">
                      STARTS IN: {match.countdown}
                    </div>
                  </div>
                  <Link to="/events" className="group/link flex items-center gap-2 font-syncopate text-[9px] font-black text-[#FFC400] tracking-[0.2em] uppercase relative">
                    VIEW MATCH 
                    <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
                    <span className="absolute -bottom-1 left-0 w-0 h-[1px] bg-[#FFC400] group-hover/link:w-full transition-all duration-300" />
                  </Link>
                </div>

                {/* Hover Border Animation */}
                <div className="absolute top-0 right-0 w-0 h-[1px] bg-[#FFC400] group-hover:w-full transition-all duration-500" />
                <div className="absolute bottom-0 left-0 w-0 h-[1px] bg-[#FFC400] group-hover:w-full transition-all duration-500" />
              </motion.div>
            ))}
          </div>

          {/* Right Column: Featured Tournament */}
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
                <div className="absolute top-6 right-6">
                  <span className="bg-[#FFC400] text-black px-4 py-1 font-syncopate text-[10px] font-black tracking-widest uppercase">
                    {featuredTournament.status}
                  </span>
                </div>
              </div>

              <div className="p-8 md:p-12 flex-grow flex flex-col">
                <div className="mb-6">
                  <span className="text-[#FFC400] font-syncopate text-[10px] font-black tracking-widest uppercase">{featuredTournament.game}</span>
                  <h4 className="font-syncopate text-2xl md:text-4xl font-bold text-white uppercase mt-2 leading-tight">{featuredTournament.title}</h4>
                </div>

                <div className="space-y-6 mb-12">
                  <div className="flex items-center gap-4 text-slate-300">
                    <Calendar size={18} className="text-[#FFC400]" />
                    <span className="font-syncopate text-xs tracking-widest uppercase">{featuredTournament.date}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <MapPin size={18} className="text-[#FFC400]" />
                    <span className="font-syncopate text-xs tracking-widest uppercase">{featuredTournament.location}</span>
                  </div>
                  <div className="flex items-center gap-4 text-slate-300">
                    <Trophy size={18} className="text-[#FFC400]" />
                    <span className="font-syncopate text-xs tracking-widest uppercase">PRIZE POOL: {featuredTournament.prizePool}</span>
                  </div>
                </div>

                <div className="mt-auto">
                  <Link to="/events">
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
        </div>
      </div>
    </section>
  );
};

const ActiveTeamsSection = () => {
  return (
    <section className="py-32 px-6 bg-[#030C1A] relative z-10 overflow-hidden border-t border-slate-900">
      <div className="absolute inset-0 bg-grid opacity-[0.03] pointer-events-none" />
      <div className="max-w-7xl mx-auto">
        <div className="mb-16">
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4"
          >
            ACTIVE <span className="text-[#FFC400]">TEAMS</span>
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 0.6 }}
            viewport={{ once: true }}
            className="text-slate-400 font-syncopate text-[10px] tracking-[0.2em] uppercase"
          >
            Our elite multi-gaming professional divisions.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {MOCK_TEAMS.slice(0, 4).map((team, idx) => (
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
                <h3 className="font-syncopate text-xl font-black text-white uppercase mb-4 group-hover:text-[#FFC400] transition-colors">{team.name} Roster</h3>
                <p className="text-slate-500 font-inter text-xs font-light leading-relaxed mb-6">{team.bio || `Our professional ${team.game} squad competing in the highest tiers of regional and global tournaments.`}</p>
              </div>

              <Link to={`/teams?id=${team.id}`} className="group/btn flex items-center gap-2 font-syncopate text-[9px] font-black text-[#FFC400] tracking-widest uppercase mt-4">
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
      <Hero />
      <NewsAnnouncements />
      <AboutSnapshot />
      <ActiveTeamsSection />
      <LiveOperationsHighlight />
      <ShopSection />
    </motion.div>
  );
};

export default Home;

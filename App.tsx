
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Twitter, Twitch, Instagram, Youtube, LayoutGrid, Info, Briefcase, Calendar, Users, Home as HomeIcon, ChevronDown, ArrowRight } from 'lucide-react';
import { Analytics } from "@vercel/analytics/react";

// Pages
import Home from './pages/Home';
import Schedule from './pages/Schedule';
import Teams from './pages/Teams';
import About from './pages/About';
import Careers from './pages/Careers';
import JobDetail from './pages/JobDetail';
import Information from './pages/Information';
import AdminLayout from './src/admin/AdminLayout';
import AdminDashboard from './src/admin/Dashboard';
import AdminLogin from './src/admin/LoginPage';
import AdminTeams from './src/admin/Teams';
import AdminCreators from './src/admin/Creators';
import AdminSchedule from './src/admin/Schedule';
import AdminGallery from './src/admin/Gallery';
import AdminJobs from './src/admin/Jobs';
import AdminPartners from './src/admin/Partners';
import AdminLeadership from './src/admin/Leadership';
import AdminSettings from './src/admin/Settings';
import AdminUsers from './src/admin/Users';
import AdminSubscribers from './src/admin/Subscribers';
import AdminNews from './src/admin/News';
import Socials from './pages/Socials';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import PlayerProfile from './pages/PlayerProfile';
import EventDetail from './pages/EventDetail';

import SocialFollowerIcon from './components/SocialFollowerIcon';
import NewsletterPopup from './components/NewsletterPopup';
import AnnouncementBar from './src/components/AnnouncementBar';
import { SettingsProvider, useSettings } from './src/context/SettingsContext';
import { GEEKAY_LOGO } from './constants';

// Component to handle scroll reset on navigation
const ScrollToTop = () => {
  const { pathname } = useLocation();
  
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const CustomCursor = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const updatePosition = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };
    
    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (target.closest('a') || target.closest('button') || target.closest('.interactive')) {
        setIsHovering(true);
      } else {
        setIsHovering(false);
      }
    };

    window.addEventListener('mousemove', updatePosition);
    window.addEventListener('mouseover', handleMouseOver);
    return () => {
      window.removeEventListener('mousemove', updatePosition);
      window.removeEventListener('mouseover', handleMouseOver);
    };
  }, []);

  return (
    <>
      <div 
        className={`custom-cursor hidden md:block ${isHovering ? 'cursor-active' : ''}`} 
        style={{ left: `${position.x}px`, top: `${position.y}px` }} 
      />
      <div 
        className="custom-cursor-dot hidden md:block" 
        style={{ left: `${position.x}px`, top: `${position.y}px` }} 
      />
    </>
  );
};

const regions = [
  { name: 'UAE', link: 'https://www.geekay.com/en/', sub: 'Official Store' },
  { name: 'KSA', link: 'https://www.geekay.com/saudi_en/', sub: 'Official Store' },
  { name: 'GLOBAL', link: 'https://www.geekay.com/global/', sub: 'Official Store' },
];

const DesktopShopDropdown = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="bg-[#FFC400] text-black px-6 py-2.5 rounded-none font-syncopate text-[10px] font-bold hover:bg-yellow-400 transition-all skew-x-[-10deg] flex items-center gap-2 shadow-[0_0_15px_rgba(255,196,0,0.3)]">
        <span className="skew-x-[10deg] flex items-center gap-1.5">
          SHOP
          <ChevronDown size={12} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full right-0 pt-3 z-[100] w-64"
          >
            <div className="bg-[#040E1E]/98 backdrop-blur-md border border-[#FFC400]/30 shadow-[0_20px_40px_rgba(0,0,0,0.8)] p-2 rounded-sm">
              <div className="px-4 py-2.5 border-b border-white/10 mb-1">
                <span className="font-syncopate text-[8px] text-slate-400 tracking-[0.2em] uppercase font-bold">Select Region</span>
              </div>
              <div className="flex flex-col gap-1">
                {regions.map((region, i) => (
                  <motion.a
                    key={region.name}
                    href={region.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 + 0.05 }}
                    className="group relative flex items-center justify-between px-4 py-3 hover:bg-[#081B3A] transition-colors rounded-sm overflow-hidden"
                  >
                    <div className="absolute left-0 top-0 bottom-0 w-[2px] bg-[#FFC400] transform -translate-x-full group-hover:translate-x-0 transition-transform" />
                    <div className="flex flex-col transform group-hover:translate-x-1 transition-transform duration-300">
                      <span className="font-syncopate text-xs font-bold text-white group-hover:text-[#FFC400] transition-colors">{region.name}</span>
                      <span className="font-inter text-[10px] text-slate-400">{region.sub}</span>
                    </div>
                    <ArrowRight size={14} className="text-slate-500 group-hover:text-[#FFC400] transform group-hover:translate-x-1 transition-all duration-300" />
                  </motion.a>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MobileShopDropdown = ({ onClose }: { onClose: () => void }) => {
  const [isShopOpen, setIsShopOpen] = useState(false);

  return (
    <div className="flex flex-col border-b border-white/5 pb-2">
      <button 
        onClick={() => setIsShopOpen(!isShopOpen)}
        className="font-syncopate text-sm sm:text-base font-bold py-3 px-3 flex items-center justify-between hover:text-[#FFC400] transition-colors w-full text-left tracking-wider rounded hover:bg-white/5"
      >
        <span className="flex items-center gap-2.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#FFC400]" />
          OFFICIAL SHOP
        </span>
        <ChevronDown size={16} className={`transition-transform duration-300 ${isShopOpen ? 'rotate-180 text-[#FFC400]' : 'text-slate-400'}`} />
      </button>
      <AnimatePresence>
        {isShopOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-col gap-2 mt-1 mb-3 pl-4 pr-1 border-l-2 border-[#FFC400]/50">
              <span className="font-syncopate text-[8px] text-slate-400 tracking-[0.2em] uppercase mb-1">Select Store Region</span>
              {regions.map((region) => (
                <a
                  key={region.name}
                  href={region.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={onClose}
                  className="flex items-center justify-between py-2.5 px-3 rounded bg-white/5 hover:bg-[#FFC400]/10 border border-white/5 hover:border-[#FFC400]/30 transition-all group"
                >
                  <div className="flex flex-col">
                    <span className="font-syncopate text-xs font-bold text-white group-hover:text-[#FFC400] transition-colors">{region.name}</span>
                    <span className="font-inter text-[10px] text-slate-400">{region.sub}</span>
                  </div>
                  <ArrowRight size={14} className="text-slate-500 group-hover:text-[#FFC400] transform group-hover:translate-x-1 transition-all" />
                </a>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { settings } = useSettings();

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'ABOUT', path: '/about' },
    { name: 'TEAMS', path: '/teams' },
    { name: 'EVENTS', path: '/events' },
    { name: 'NEWS', path: '/news' },
    { name: 'MEDIA', path: '/socials' },
    { name: 'CAREERS', path: '/careers' },
  ];

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Close menu on route change
  useEffect(() => {
    setIsOpen(false);
  }, [location.pathname]);

  return (
    <nav className="sticky top-0 z-50 w-full h-16 md:h-20 px-4 sm:px-6 md:px-12 flex justify-between items-center bg-[#081B3A] border-b border-white/10 shadow-lg transition-all">
      {/* Brand Logo */}
      <Link to="/" className="flex items-center gap-3 group shrink-0">
        <div className="w-9 h-9 sm:w-11 sm:h-11 group-hover:scale-105 transition-transform flex items-center justify-center">
          <img src={GEEKAY_LOGO} alt="Geekay Esports" className="w-full h-full object-contain drop-shadow-[0_0_10px_rgba(255,196,0,0.15)]" referrerPolicy="no-referrer" />
        </div>
        <span className="font-syncopate font-black text-sm sm:text-base md:text-lg tracking-tighter text-white">
          GEEKAY <span className="text-[#FFC400]">ESPORTS</span>
        </span>
      </Link>

      {/* Desktop Navigation Links */}
      <div className="hidden lg:flex gap-7 xl:gap-9 items-center">
        {navLinks.map((link) => {
          const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
          return (
            <Link 
              key={link.name} 
              to={link.path}
              className={`font-syncopate text-[10px] tracking-[0.25em] font-bold hover:text-[#FFC400] transition-colors relative group py-2 ${isActive ? 'text-[#FFC400]' : 'text-slate-400'}`}
            >
              {link.name}
              <span className={`absolute bottom-0 left-0 h-[2px] bg-[#FFC400] transition-all duration-300 ${isActive ? 'w-full shadow-[0_0_8px_rgba(255,196,0,0.8)]' : 'w-0 group-hover:w-full'}`} />
            </Link>
          );
        })}
        
        <DesktopShopDropdown />
      </div>

      {/* Mobile Navbar Controls */}
      <div className="flex items-center gap-2 lg:hidden">
        <button 
          className="p-2.5 text-white hover:text-[#FFC400] transition-colors rounded-md active:bg-white/10" 
          onClick={() => setIsOpen(!isOpen)}
          aria-label="Toggle navigation menu"
        >
          {isOpen ? <X size={22} className="text-[#FFC400]" /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Navigation Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="fixed top-16 inset-x-0 bottom-0 h-[calc(100dvh-4rem)] bg-[#040E1E] z-50 flex flex-col justify-between p-5 sm:p-7 lg:hidden overflow-y-auto overscroll-contain shadow-2xl border-t border-white/10"
          >
            {/* Top Area: Navigation Links */}
            <div className="flex flex-col space-y-2">
              {/* Navigation Links */}
              <div className="flex flex-col space-y-1 pt-1">
                <div className="text-[8px] font-syncopate text-slate-500 font-bold uppercase tracking-[0.3em] mb-1 px-3">
                  PAGES
                </div>
                {navLinks.map((link) => {
                  const isActive = location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path));
                  return (
                    <Link 
                      key={link.name} 
                      to={link.path} 
                      onClick={() => setIsOpen(false)}
                      className={`font-syncopate text-sm sm:text-base font-bold py-3 px-3 rounded flex items-center justify-between transition-all ${
                        isActive 
                          ? 'bg-[#FFC400] text-black shadow-[0_0_20px_rgba(255,196,0,0.3)] font-black' 
                          : 'text-slate-200 hover:text-[#FFC400] hover:bg-white/5'
                      }`}
                    >
                      <span>{link.name}</span>
                      {isActive ? (
                        <span className="text-black text-[10px] font-bold font-syncopate tracking-widest">• CURRENT</span>
                      ) : (
                        <ArrowRight size={14} className="text-slate-600 opacity-60" />
                      )}
                    </Link>
                  );
                })}

                <div className="pt-1">
                  <MobileShopDropdown onClose={() => setIsOpen(false)} />
                </div>
              </div>
            </div>

            {/* Bottom Area: Socials & Admin Link */}
            <div className="pt-5 mt-4 border-t border-white/10 space-y-4">
              {/* Quick Social Icons */}
              <div className="flex items-center justify-center gap-4">
                {settings.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded bg-white/5 text-slate-400 hover:text-[#FFC400] hover:bg-white/10 transition-colors" aria-label="X Twitter">
                    <Twitter size={16} />
                  </a>
                )}
                {settings.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded bg-white/5 text-slate-400 hover:text-[#FFC400] hover:bg-white/10 transition-colors" aria-label="Instagram">
                    <Instagram size={16} />
                  </a>
                )}
                {settings.youtube_url && (
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded bg-white/5 text-slate-400 hover:text-[#FFC400] hover:bg-white/10 transition-colors" aria-label="YouTube">
                    <Youtube size={16} />
                  </a>
                )}
                {settings.twitch_url && (
                  <a href={settings.twitch_url} target="_blank" rel="noopener noreferrer" className="p-2.5 rounded bg-white/5 text-slate-400 hover:text-[#FFC400] hover:bg-white/10 transition-colors" aria-label="Twitch">
                    <Twitch size={16} />
                  </a>
                )}
              </div>

              {/* Footer status & Admin link */}
              <div className="flex items-center justify-between text-slate-400 px-1 pt-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span className="font-syncopate text-[8px] tracking-widest uppercase font-bold text-slate-400">
                    GEEKAY MEA HQ
                  </span>
                </div>
                <Link 
                  to="/admin/login" 
                  onClick={() => setIsOpen(false)}
                  className="text-[9px] font-syncopate font-bold text-slate-400 hover:text-[#FFC400] transition-colors tracking-widest uppercase"
                >
                  ADMIN ACCESS →
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const SnapchatGhost = ({ size = 20, className = "" }) => (
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

export default function App() {
  return (
    <SettingsProvider>
      <Router>
        <ScrollToTop />
        <MainAppLayout />
      </Router>
    </SettingsProvider>
  );
}

function MainAppLayout() {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');
  const { settings } = useSettings();

  return (
    <div className="min-h-screen flex flex-col selection:bg-[#FFC400] selection:text-black bg-grid bg-[#081B3A] overflow-x-hidden">
      <div className="fixed inset-0 bg-scanline pointer-events-none z-10 opacity-30"></div>
      <CustomCursor />
      {!isAdmin && (
        <header className="fixed top-0 left-0 w-full z-[100]">
          <Navbar />
        </header>
      )}
      {!isAdmin && <AnnouncementBar />}
      {!isAdmin && <NewsletterPopup />}
      <main className="flex-grow relative z-20">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/news" element={<News />} />
          <Route path="/news/:slug" element={<NewsDetail />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/events" element={<Schedule />} />
          <Route path="/teams" element={<Teams />} />
          <Route path="/teams/:teamId" element={<Teams />} />
          <Route path="/players/:playerName" element={<PlayerProfile />} />
          <Route path="/about" element={<About />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/careers/:slug" element={<JobDetail />} />
          <Route path="/info" element={<Information />} />
          <Route path="/socials" element={<Socials />} />
          <Route path="/events/:eventName" element={<EventDetail />} />

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="leadership" element={<AdminLeadership />} />
            <Route path="teams" element={<AdminTeams />} />
            <Route path="creators" element={<AdminCreators />} />
            <Route path="schedule" element={<AdminSchedule />} />
            <Route path="gallery" element={<AdminGallery />} />
            <Route path="jobs" element={<AdminJobs />} />
            <Route path="partners" element={<AdminPartners />} />
            <Route path="subscribers" element={<AdminSubscribers />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="users" element={<AdminUsers />} />
          </Route>
        </Routes>
      </main>
      {!isAdmin && (
        <footer className="bg-[#040E1E] border-t border-slate-800 py-20 px-6 md:px-12 relative z-20">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-8 group">
                <div className="w-12 h-12">
                  <img src={GEEKAY_LOGO} alt="Geekay Esports" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </div>
                <h2 className="font-syncopate text-2xl font-bold uppercase tracking-tighter">GEEKAY <span className="text-[#FFC400]">ESPORTS</span></h2>
              </div>
              <p className="text-slate-500 max-w-sm leading-relaxed text-sm">The dominant force in MENA competitive gaming. Redefining the digital arena through performance and strategy.</p>
              <div className="flex flex-wrap gap-6 mt-10">
                {settings.twitter_url && (
                  <a href={settings.twitter_url} target="_blank" rel="noopener noreferrer" className="hover-glitch">
                    <SocialFollowerIcon platform="twitter" count={settings.twitter_count || '399K'} size={20} className="text-slate-400 hover:text-[#FFC400]" />
                  </a>
                )}
                {settings.twitch_url && (
                  <a href={settings.twitch_url} target="_blank" rel="noopener noreferrer" className="hover-glitch">
                    <SocialFollowerIcon platform="twitch" count={settings.twitch_count || '645K'} size={20} className="text-slate-400 hover:text-[#FFC400]" />
                  </a>
                )}
                {settings.instagram_url && (
                  <a href={settings.instagram_url} target="_blank" rel="noopener noreferrer" className="hover-glitch">
                    <SocialFollowerIcon platform="instagram" count={settings.instagram_count || '240K'} size={20} className="text-slate-400 hover:text-[#FFC400]" />
                  </a>
                )}
                {settings.youtube_url && (
                  <a href={settings.youtube_url} target="_blank" rel="noopener noreferrer" className="hover-glitch">
                    <SocialFollowerIcon platform="youtube" count={settings.youtube_count || '523K'} size={20} className="text-slate-400 hover:text-[#FFC400]" />
                  </a>
                )}
                {settings.tiktok_url && (
                  <a href={settings.tiktok_url} target="_blank" rel="noopener noreferrer" className="hover-glitch">
                    <SocialFollowerIcon platform="tiktok" count={settings.tiktok_count || '481K'} size={20} className="text-slate-400 hover:text-[#FFC400]" />
                  </a>
                )}
                {settings.facebook_url && (
                  <a href={settings.facebook_url} target="_blank" rel="noopener noreferrer" className="hover-glitch">
                    <SocialFollowerIcon platform="facebook" count={settings.facebook_count || '8.7K'} size={20} className="text-slate-400 hover:text-[#FFC400]" />
                  </a>
                )}
                {settings.snapchat_url && (
                  <a href={settings.snapchat_url} target="_blank" rel="noopener noreferrer" className="hover-glitch text-slate-400 hover:text-[#FFC400] transition-colors">
                    <SnapchatGhost size={20} />
                  </a>
                )}
              </div>
            </div>
            <div>
              <h3 className="font-syncopate text-[10px] font-bold text-[#FFC400] mb-8 tracking-[0.3em] uppercase">Roster</h3>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li><Link to="/teams" className="hover:text-white transition-colors">Pro Teams</Link></li>
                <li><Link to="/events" className="hover:text-white transition-colors">Tournaments</Link></li>
                <li><Link to="/careers" className="hover:text-white transition-colors">Join Us</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-syncopate text-[10px] font-bold text-[#FFC400] mb-8 tracking-[0.3em] uppercase">Internal</h3>
              <ul className="space-y-4 text-slate-400 text-sm font-medium">
                <li><Link to="/about" className="hover:text-white transition-colors">About Org</Link></li>
                <li><Link to="/info" className="hover:text-white transition-colors">Privacy</Link></li>
                <li><Link to="/info" className="hover:text-white transition-colors">Contact</Link></li>
              </ul>
            </div>
          </div>
          <div className="max-w-7xl mx-auto mt-20 pt-8 border-t border-slate-900 flex flex-col md:flex-row justify-between text-slate-600 text-[10px] font-syncopate tracking-widest uppercase">
            <p>&copy; 2026 GEEKAY ESPORTS. ALL RIGHTS RESERVED.</p>
            <p>DESIGNED FOR THE ARENA</p>
          </div>
        </footer>
      )}
      <Analytics />
    </div>
  );
}

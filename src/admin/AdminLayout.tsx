import React, { useEffect, useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Trophy, 
  Video, 
  Calendar, 
  Image as ImageIcon, 
  Briefcase, 
  Settings, 
  UserCircle, 
  LogOut,
  Menu,
  X,
  ChevronRight,
  Mail,
  Newspaper,
  Building2,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';

import { GEEKAY_LOGO } from '../../constants';

const AdminLayout = () => {
  const [user, setUser] = useState<any>(() => {
    const saved = localStorage.getItem('geekay_user');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      username: 'OPERATIVE_ADMIN',
      email: 'admin@geekay.com',
      role: 'admin'
    };
  });
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const token = localStorage.getItem('geekay_token');
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/auth/me', {
          headers,
          credentials: 'include'
        });

        if (res.ok) {
          const data = await res.json();
          if (data && data.user) {
            setUser(data.user);
            if (data.token) {
              localStorage.setItem('geekay_token', data.token);
            }
            localStorage.setItem('geekay_user', JSON.stringify(data.user));
            setLoading(false);
            return;
          }
        }

        // If unauthenticated or token is expired/invalid, clear and redirect to login
        localStorage.removeItem('geekay_token');
        localStorage.removeItem('geekay_user');
        navigate('/admin/login');
      } catch (e) {
        localStorage.removeItem('geekay_token');
        localStorage.removeItem('geekay_user');
        navigate('/admin/login');
      } finally {
        setLoading(false);
      }
    };
    checkSession();
  }, [navigate]);

  // Close mobile sidebar on route changes
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  // Lock body scroll on mobile when sidebar is open
  useEffect(() => {
    if (window.innerWidth < 1024) {
      document.body.style.overflow = isSidebarOpen ? 'hidden' : 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isSidebarOpen]);

  const handleLogout = async () => {
    try {
      const token = localStorage.getItem('geekay_token');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      await fetch('/api/auth/logout', { method: 'POST', headers, credentials: 'include' });
    } catch (e) {}
    localStorage.removeItem('geekay_user');
    localStorage.removeItem('geekay_token');
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#081B3A] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#FFC400] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={18} /> },
    { name: 'Leadership', path: '/admin/leadership', icon: <UserCircle size={18} /> },
    { name: 'Teams', path: '/admin/teams', icon: <Trophy size={18} /> },
    { name: 'Creators', path: '/admin/creators', icon: <Video size={18} /> },
    { name: 'Schedule', path: '/admin/schedule', icon: <Calendar size={18} /> },
    { name: 'Gallery', path: '/admin/gallery', icon: <ImageIcon size={18} /> },
    { name: 'Jobs', path: '/admin/jobs', icon: <Briefcase size={18} /> },
    { name: 'Partners', path: '/admin/partners', icon: <Building2 size={18} /> },
    { name: 'News', path: '/admin/news', icon: <Newspaper size={18} /> },
    { name: 'Subscribers', path: '/admin/subscribers', icon: <Mail size={18} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={18} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={18} />, adminOnly: true },
  ];

  const currentSection = menuItems.find(m => m.path === location.pathname)?.name || 'Admin Panel';

  return (
    <div className="min-h-screen bg-[#040E1E] text-white flex flex-col lg:flex-row">
      {/* Mobile Top Navigation Header */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#081B3A]/95 backdrop-blur-md border-b border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 -ml-1 text-slate-300 hover:text-[#FFC400] transition-colors rounded-md active:bg-white/10"
            aria-label="Open Navigation Menu"
          >
            <Menu size={22} />
          </button>
          <Link to="/" className="flex items-center gap-2">
            <img src={GEEKAY_LOGO} alt="Geekay" className="h-6 w-auto" />
            <span className="font-syncopate font-bold text-xs tracking-wider text-[#FFC400]">
              ADMIN <span className="text-white text-[10px] hidden sm:inline">• {currentSection}</span>
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <span className={`px-2 py-0.5 rounded text-[8px] font-syncopate font-bold tracking-widest uppercase border ${
            user?.role === 'admin' 
              ? 'bg-[#FFC400]/10 border-[#FFC400]/40 text-[#FFC400]' 
              : 'bg-blue-500/10 border-blue-500/40 text-blue-400'
          }`}>
            {user?.role === 'admin' ? 'ADMIN' : 'EDITOR'}
          </span>
          <button 
            onClick={handleLogout}
            className="p-2 text-slate-400 hover:text-red-400 transition-colors"
            title="Logout"
            aria-label="Logout"
          >
            <LogOut size={16} />
          </button>
        </div>
      </header>

      {/* Backdrop for Mobile Sidebar */}
      {isSidebarOpen && (
        <div 
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 lg:hidden transition-opacity duration-300"
          aria-hidden="true"
        />
      )}

      {/* Admin Sidebar */}
      <aside 
        className={`fixed lg:sticky top-0 inset-y-0 left-0 z-50 w-72 lg:w-64 h-screen bg-[#081B3A] border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out shrink-0 ${
          isSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Sidebar Top Header */}
          <div className="p-5 border-b border-white/5 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 group">
              <img src={GEEKAY_LOGO} alt="Geekay Esports" className="h-7 w-auto group-hover:scale-105 transition-transform" />
              <div>
                <span className="block font-syncopate font-bold text-sm tracking-tight text-white">
                  GEEKAY <span className="text-[#FFC400]">HQ</span>
                </span>
                <span className="block font-syncopate text-[7px] text-slate-500 tracking-[0.25em] uppercase font-bold">
                  CONTROL PANEL
                </span>
              </div>
            </Link>
            <button 
              onClick={() => setIsSidebarOpen(false)} 
              className="lg:hidden p-2 text-slate-400 hover:text-white rounded-md hover:bg-white/5"
              aria-label="Close sidebar"
            >
              <X size={20} />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="flex-grow p-3 space-y-1 overflow-y-auto">
            <div className="px-3 py-1.5 text-[8px] font-syncopate text-slate-500 font-bold uppercase tracking-[0.25em]">
              MANAGEMENT
            </div>
            {menuItems.map((item) => {
              if (item.adminOnly && user?.role !== 'admin') return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-sm transition-all group font-syncopate text-[9px] font-bold tracking-widest uppercase ${
                    isActive 
                      ? 'bg-[#FFC400] text-black shadow-[0_0_15px_rgba(255,196,0,0.3)]' 
                      : 'text-slate-400 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <span className={`${isActive ? 'text-black' : 'text-[#FFC400] group-hover:scale-110 transition-transform'}`}>
                    {item.icon}
                  </span>
                  <span className="truncate">{item.name}</span>
                  {isActive && <ChevronRight size={14} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* User Profile & Footer Actions */}
          <div className="p-3 border-t border-white/5 bg-[#051329]/50 space-y-2">
            <Link
              to="/"
              className="flex items-center justify-between w-full px-3 py-2 text-[8px] font-syncopate font-bold text-slate-400 hover:text-[#FFC400] hover:bg-white/5 rounded transition-colors uppercase tracking-wider"
            >
              <span className="flex items-center gap-2">
                <ExternalLink size={12} />
                VIEW PUBLIC SITE
              </span>
              <ChevronRight size={12} />
            </Link>

            <div className="pt-2 border-t border-white/5 flex items-center justify-between px-2">
              <div className="flex items-center gap-2.5 overflow-hidden">
                <div className="w-8 h-8 rounded bg-[#FFC400]/20 border border-[#FFC400]/30 flex items-center justify-center text-[#FFC400] font-black text-xs shrink-0">
                  {user.username ? user.username[0].toUpperCase() : 'A'}
                </div>
                <div className="overflow-hidden">
                  <p className="font-syncopate text-[9px] font-bold text-white truncate">{user.username || 'Admin'}</p>
                  <span className="font-syncopate text-[7px] text-[#FFC400] uppercase tracking-wider block">
                    {user?.role === 'admin' ? 'ADMINISTRATOR' : 'CONTENT EDITOR'}
                  </span>
                </div>
              </div>

              <button 
                onClick={handleLogout} 
                className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded hover:bg-white/5"
                title="Log Out"
                aria-label="Log Out"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col min-w-0 bg-[#040E1E]">
        <div className="flex-grow p-4 sm:p-6 lg:p-10 overflow-y-auto">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

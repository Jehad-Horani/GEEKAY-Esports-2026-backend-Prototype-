
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
  Newspaper
} from 'lucide-react';

import { auth } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { GEEKAY_LOGO } from '../../constants';

const AdminLayout = () => {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Security removed: Admin panel is now public
    setUser({
      username: 'GUEST_ADMIN',
      email: 'guest@geekay.com',
      role: 'admin'
    });
    setLoading(false);
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/admin/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-[#081B3A] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-[#FFC400] border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  const menuItems = [
    { name: 'Dashboard', path: '/admin', icon: <LayoutDashboard size={20} /> },
    { name: 'Leadership', path: '/admin/leadership', icon: <UserCircle size={20} /> },
    { name: 'Teams', path: '/admin/teams', icon: <Trophy size={20} /> },
    { name: 'Creators', path: '/admin/creators', icon: <Video size={20} /> },
    { name: 'Schedule', path: '/admin/schedule', icon: <Calendar size={20} /> },
    { name: 'Gallery', path: '/admin/gallery', icon: <ImageIcon size={20} /> },
    { name: 'Jobs', path: '/admin/jobs', icon: <Briefcase size={20} /> },
    { name: 'News', path: '/admin/news', icon: <Newspaper size={20} /> },
    { name: 'Subscribers', path: '/admin/subscribers', icon: <Mail size={20} /> },
    { name: 'Settings', path: '/admin/settings', icon: <Settings size={20} /> },
    { name: 'Users', path: '/admin/users', icon: <Users size={20} />, adminOnly: true },
  ];

  return (
    <div className="min-h-screen bg-[#040E1E] text-white flex">
      {/* Sidebar */}
      <aside 
        className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[#081B3A] border-r border-white/5 transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-20'}`}
      >
        <div className="h-full flex flex-col">
          <div className="p-6 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src={GEEKAY_LOGO} alt="Geekay Esports" className="h-6 w-auto" />
              {isSidebarOpen && <span className="font-syncopate font-bold text-lg tracking-tighter">ADMIN</span>}
            </Link>
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="lg:hidden text-slate-400 hover:text-white">
              <X size={24} />
            </button>
          </div>

          <nav className="flex-grow p-4 space-y-2">
            {menuItems.map((item) => {
              if (item.adminOnly && user.role !== 'admin') return null;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-4 px-4 py-3 rounded-lg transition-all group ${isActive ? 'bg-[#FFC400] text-black' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
                >
                  <span className={`${isActive ? 'text-black' : 'text-[#FFC400] group-hover:scale-110 transition-transform'}`}>
                    {item.icon}
                  </span>
                  {isSidebarOpen && <span className="font-syncopate text-[10px] font-bold tracking-widest uppercase">{item.name}</span>}
                  {isActive && isSidebarOpen && <ChevronRight size={16} className="ml-auto" />}
                </Link>
              );
            })}
          </nav>

          <div className="p-4 border-t border-white/5">
            <div className="flex items-center gap-4 px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-[#FFC400]/20 flex items-center justify-center text-[#FFC400] font-bold">
                {user.username[0].toUpperCase()}
              </div>
              {isSidebarOpen && (
                <div className="flex-grow overflow-hidden">
                  <p className="font-syncopate text-[10px] font-bold truncate">{user.username}</p>
                  <p className="text-[8px] text-slate-500 uppercase tracking-widest">{user.role}</p>
                </div>
              )}
              {isSidebarOpen && (
                <button onClick={handleLogout} className="text-slate-500 hover:text-red-500 transition-colors">
                  <LogOut size={18} />
                </button>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow flex flex-col min-w-0">
        <div className="flex-grow p-8 lg:p-12 overflow-y-auto">
          <Outlet context={{ user }} />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;

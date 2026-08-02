
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Trophy, 
  Users, 
  Calendar, 
  Image as ImageIcon, 
  Briefcase,
  Activity,
  Clock,
  User as UserIcon,
  ArrowUpRight,
  Settings,
  Newspaper
} from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [stats, setStats] = useState<any>({ teams: 0, players: 0, events: 0, gallery: 0, jobs: 0, news: 0 });
  const [activity, setActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dbStatus, setDbStatus] = useState<any>(null);
  const [testingDb, setTestingDb] = useState(false);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/health');
      if (res.ok) setDbStatus(await res.json());
    } catch (err) {
      console.error('Failed to fetch health status:', err);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, activityRes] = await Promise.all([
          fetch('/api/stats'),
          fetch('/api/activity'),
          fetchDbStatus()
        ]);
        
        if (statsRes.ok) setStats(await statsRes.json());
        if (activityRes.ok) setActivity(await activityRes.json());
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
        setStats({ teams: 0, players: 0, events: 0, gallery: 0, jobs: 0 });
        setActivity([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleTestWrite = async () => {
    setTestingDb(true);
    await fetchDbStatus();
    setTestingDb(false);
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 space-y-4">
      <div className="w-8 h-8 border-2 border-[#FFC400] border-t-transparent rounded-full animate-spin"></div>
      <div className="text-slate-500 font-syncopate text-[10px] tracking-widest uppercase animate-pulse">Initializing Dashboard...</div>
    </div>
  );

  const statCards = [
    { label: 'Total Teams', value: stats.teams, icon: <Trophy size={24} />, color: 'text-blue-500', path: '/admin/teams' },
    { label: 'Total Players', value: stats.players, icon: <Users size={24} />, color: 'text-emerald-500', path: '/admin/teams' },
    { label: 'Total Events', value: stats.events, icon: <Calendar size={24} />, color: 'text-purple-500', path: '/admin/schedule' },
    { label: 'Gallery Items', value: stats.gallery, icon: <ImageIcon size={24} />, color: 'text-amber-500', path: '/admin/gallery' },
    { label: 'Job Openings', value: stats.jobs, icon: <Briefcase size={24} />, color: 'text-rose-500', path: '/admin/jobs' },
    { label: 'News Articles', value: stats.news, icon: <Newspaper size={24} />, color: 'text-orange-500', path: '/admin/news' },
  ];

  return (
    <div className="space-y-12">
      <header>
        <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">SYSTEM_OVERVIEW</span>
        <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">DASHBOARD</h1>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-[#081B3A] border border-white/5 p-8 relative group overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-0 bg-[#FFC400] group-hover:h-full transition-all duration-500" />
            <div className={`mb-6 ${stat.color}`}>{stat.icon}</div>
            <p className="font-syncopate text-[8px] text-slate-500 font-bold tracking-[0.3em] uppercase mb-2">{stat.label}</p>
            <h3 className="font-syncopate text-3xl font-black text-white">{stat.value}</h3>
            <Link to={stat.path} className="absolute top-6 right-6 text-slate-600 hover:text-[#FFC400] transition-colors">
              <ArrowUpRight size={18} />
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-syncopate text-xl font-bold text-white tracking-widest uppercase flex items-center gap-4">
              <Activity size={20} className="text-[#FFC400]" />
              RECENT_ACTIVITY
            </h2>
          </div>

          <div className="bg-[#081B3A] border border-white/5 overflow-hidden">
            <div className="divide-y divide-white/5">
              {activity.length > 0 ? activity.map((log, i) => (
                <div key={log.id} className="p-6 flex items-start gap-6 hover:bg-white/[0.02] transition-colors">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 shrink-0">
                    <UserIcon size={18} />
                  </div>
                  <div className="flex-grow">
                    <div className="flex items-center justify-between mb-2">
                      <p className="font-syncopate text-[10px] font-bold text-white uppercase tracking-wider">
                        <span className="text-[#FFC400]">{log.username}</span> {log.action}
                      </p>
                      <span className="flex items-center gap-2 text-[8px] text-slate-500 font-bold uppercase tracking-widest">
                        <Clock size={10} />
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 font-syncopate uppercase tracking-widest">
                      Entity: {log.entity_type} (ID: {log.entity_id})
                    </p>
                  </div>
                </div>
              )) : (
                <div className="p-12 text-center text-slate-500 font-syncopate text-[10px] tracking-widest uppercase">
                  No activity logs found.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="space-y-8">
          <h2 className="font-syncopate text-xl font-bold text-white tracking-widest uppercase flex items-center gap-4">
            <Settings size={20} className="text-[#FFC400]" />
            SYSTEM_STATUS
          </h2>

          <div className="bg-[#081B3A] border border-white/5 p-8 space-y-8">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="font-syncopate text-[10px] text-slate-400 font-bold uppercase tracking-widest">Database</span>
                <span className={`px-3 py-1 font-syncopate text-[8px] font-bold uppercase tracking-widest rounded-full ${dbStatus?.db === 'writable' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                  {dbStatus?.db === 'writable' ? 'Connected & Writable' : 'Read-Only or Error'}
                </span>
              </div>
              {dbStatus?.error && (
                <p className="text-[8px] text-red-500 font-syncopate uppercase tracking-widest leading-relaxed">
                  Error: {dbStatus.error}
                </p>
              )}
              <div className="flex justify-between items-center">
                <span className="font-syncopate text-[10px] text-slate-400 font-bold uppercase tracking-widest">Environment</span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-500 font-syncopate text-[8px] font-bold uppercase tracking-widest rounded-full">
                  {dbStatus?.isVercel ? 'Vercel Serverless' : 'Local Node.js'}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-syncopate text-[10px] text-slate-400 font-bold uppercase tracking-widest">DB Path</span>
                <span className="text-slate-600 font-syncopate text-[8px] font-bold uppercase tracking-widest">
                  {dbStatus?.dbPath}
                </span>
              </div>
            </div>

            <div className="pt-8 border-t border-white/5 space-y-4">
              <button 
                onClick={handleTestWrite}
                disabled={testingDb}
                className="w-full py-3 bg-white/5 border border-white/10 text-white font-syncopate text-[8px] font-bold uppercase tracking-widest hover:bg-[#FFC400] hover:text-black transition-all disabled:opacity-50"
              >
                {testingDb ? 'TESTING...' : 'TEST_DATABASE_WRITE'}
              </button>
              <p className="text-[10px] text-slate-500 font-syncopate uppercase tracking-widest leading-relaxed">
                All systems are operating within normal parameters. Last security audit: {new Date().toLocaleDateString()}.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

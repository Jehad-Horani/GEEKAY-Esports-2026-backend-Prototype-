import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  ChevronRight, 
  ChevronDown, 
  UserPlus, 
  Save, 
  X,
  Image as ImageIcon,
  ExternalLink
} from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ImageUploader from '../components/ImageUploader';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import FormSection from './components/FormSection';
import FormRepeater from './components/FormRepeater';
import { ToastNotification } from './components/Toast';
import { getAuthHeaders } from './utils/api';

const AdminTeams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; type: 'team' | 'player'; name?: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // Team Repeaters State
  const [staffList, setStaffList] = useState<any[]>([]);
  const [trophiesList, setTrophiesList] = useState<any[]>([]);
  const [teamMediaList, setTeamMediaList] = useState<any[]>([]);
  const [teamSocialList, setTeamSocialList] = useState<any[]>([]);

  // Player Repeaters & Object State
  const [playerMatchesList, setPlayerMatchesList] = useState<any[]>([]);
  const [playerAchievementsList, setPlayerAchievementsList] = useState<any[]>([]);
  const [playerMediaList, setPlayerMediaList] = useState<any[]>([]);
  const [playerSocialList, setPlayerSocialList] = useState<any[]>([]);
  const [playerGear, setPlayerGear] = useState<{ mouse: string; keyboard: string; headset: string; monitor: string; mousepad: string }>({
    mouse: '', keyboard: '', headset: '', monitor: '', mousepad: ''
  });

  const handleOpenTeamEdit = (team: any) => {
    setEditingTeam(team);
    
    // Parse Staff JSON
    try {
      const parsed = typeof team.staff === 'string' ? JSON.parse(team.staff) : team.staff;
      setStaffList(Array.isArray(parsed) ? parsed : []);
    } catch (e) { setStaffList([]); }

    // Parse Achievements / Trophies JSON
    try {
      const parsed = typeof team.achievements === 'string' ? JSON.parse(team.achievements) : team.achievements;
      setTrophiesList(Array.isArray(parsed) ? parsed : []);
    } catch (e) { setTrophiesList([]); }

    // Parse Media JSON
    try {
      const parsed = typeof team.media === 'string' ? JSON.parse(team.media) : team.media;
      setTeamMediaList(Array.isArray(parsed) ? parsed : []);
    } catch (e) { setTeamMediaList([]); }

    // Parse Socials JSON
    try {
      const parsed = typeof team.socials === 'string' ? JSON.parse(team.socials) : team.socials;
      if (Array.isArray(parsed)) {
        setTeamSocialList(parsed);
      } else if (parsed && typeof parsed === 'object') {
        const arr = Object.entries(parsed).map(([platform, handle]) => ({ platform, handle: String(handle) }));
        setTeamSocialList(arr);
      } else {
        setTeamSocialList([]);
      }
    } catch (e) { setTeamSocialList([]); }

    setIsModalOpen(true);
  };

  const handleOpenPlayerEdit = (player: any) => {
    setEditingPlayer(player);

    // Parse Match History JSON
    try {
      const parsed = typeof player.match_history === 'string' ? JSON.parse(player.match_history) : player.match_history;
      setPlayerMatchesList(Array.isArray(parsed) ? parsed : []);
    } catch (e) { setPlayerMatchesList([]); }

    // Parse Player Achievements JSON
    try {
      const parsed = typeof player.achievements === 'string' ? JSON.parse(player.achievements) : player.achievements;
      setPlayerAchievementsList(Array.isArray(parsed) ? parsed : []);
    } catch (e) { setPlayerAchievementsList([]); }

    // Parse Player Media JSON
    try {
      const parsed = typeof player.media === 'string' ? JSON.parse(player.media) : player.media;
      setPlayerMediaList(Array.isArray(parsed) ? parsed : []);
    } catch (e) { setPlayerMediaList([]); }

    // Parse Player Gear JSON
    try {
      const parsed = typeof player.gear === 'string' ? JSON.parse(player.gear) : player.gear;
      setPlayerGear({
        mouse: parsed?.mouse || '',
        keyboard: parsed?.keyboard || '',
        headset: parsed?.headset || '',
        monitor: parsed?.monitor || '',
        mousepad: parsed?.mousepad || ''
      });
    } catch (e) { setPlayerGear({ mouse: '', keyboard: '', headset: '', monitor: '', mousepad: '' }); }

    // Parse Player Socials
    try {
      const parsed = typeof player.socials === 'string' ? JSON.parse(player.socials) : player.socials;
      if (Array.isArray(parsed)) {
        setPlayerSocialList(parsed);
      } else if (parsed && typeof parsed === 'object') {
        const arr = Object.entries(parsed).map(([platform, handle]) => ({ platform, handle: String(handle) }));
        setPlayerSocialList(arr);
      } else {
        setPlayerSocialList([]);
      }
    } catch (e) { setPlayerSocialList([]); }
  };

  const fetchTeams = async () => {
    try {
      const res = await fetch('/api/teams');
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      }
    } catch (err) {
      console.error('Failed to fetch teams:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const fetchPlayers = async (teamId: number) => {
    try {
      const res = await fetch(`/api/teams/${teamId}/players`);
      const data = await res.json();
      const parsed = data.map((p: any) => {
        let socials = p.socials;
        if (typeof socials === 'string') {
          try { socials = JSON.parse(socials); } catch (e) { socials = {}; }
        }
        return { ...p, socials: socials || {} };
      });
      setPlayers(parsed);
    } catch (err) {
      console.error('Failed to fetch players:', err);
      setPlayers([]);
    }
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const payload = {
        ...editingTeam,
        staff: JSON.stringify(staffList),
        achievements: JSON.stringify(trophiesList),
        media: JSON.stringify(teamMediaList),
        socials: JSON.stringify(teamSocialList)
      };

      const method = editingTeam.id ? 'PUT' : 'POST';
      const url = editingTeam.id ? `/api/teams/${editingTeam.id}` : '/api/teams';
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save team');
      }
      
      setIsModalOpen(false);
      setToastMsg('تم حفظ بيانات الفريق بنجاح! / Team saved successfully!');
      fetchTeams();
    } catch (err: any) {
      console.error('Save team error:', err);
      if (err.name === 'AbortError') {
        alert('Request timed out. The server might be busy.');
      } else {
        alert(err.message);
      }
    } finally {
      setSaving(false);
      clearTimeout(timeoutId);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    setDeleteTarget(null);
    if (type === 'team') {
      try {
        setTeams(prev => prev.filter(t => String(t.id) !== String(id)));
        await fetch(`/api/teams/${id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
        setToastMsg('تم حذف الفريق بنجاح! / Team deleted.');
        fetchTeams();
      } catch (err: any) {
        fetchTeams();
      }
    } else {
      try {
        setPlayers(prev => prev.filter(p => String(p.id) !== String(id)));
        await fetch(`/api/players/${id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
        setToastMsg('تم حذف اللاعب بنجاح! / Player deleted.');
        if (expandedTeamId) fetchPlayers(expandedTeamId);
      } catch (err: any) {
        if (expandedTeamId) fetchPlayers(expandedTeamId);
      }
    }
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const payload = {
        ...editingPlayer,
        team_id: expandedTeamId,
        ign: editingPlayer.nickname || editingPlayer.ign || 'PLAYER',
        nickname: editingPlayer.nickname || editingPlayer.ign || 'PLAYER',
        role: editingPlayer.role || 'ROSTER',
        name: editingPlayer.name || '',
        age: editingPlayer.age || '20',
        nationality: editingPlayer.nationality || editingPlayer.country || 'Saudi Arabia',
        joined_date: editingPlayer.joined_date || editingPlayer.joinedDate || '',
        photo: editingPlayer.photo || editingPlayer.image || '',
        bio: editingPlayer.bio || editingPlayer.overview_description || '',
        kd: Number(editingPlayer.kd ?? 1.2),
        mvps: Number(editingPlayer.mvps || editingPlayer.major_titles || 0),
        tournaments: Number(editingPlayer.tournaments || editingPlayer.total_matches || 0),
        total_matches: Number(editingPlayer.tournaments || editingPlayer.total_matches || 0),
        win_rate: editingPlayer.win_rate || editingPlayer.winRate || '70%',
        rating_performance: editingPlayer.rating_performance !== undefined ? Number(editingPlayer.rating_performance) : 4.5,
        rating_consistency: editingPlayer.rating_consistency !== undefined ? Number(editingPlayer.rating_consistency) : 4.5,
        rating_community: editingPlayer.rating_community !== undefined ? Number(editingPlayer.rating_community) : 4.5,
        rating_overall: editingPlayer.rating_overall !== undefined ? Number(editingPlayer.rating_overall) : (editingPlayer.rating ? Number(editingPlayer.rating) : 4.6),
        championship_wins: editingPlayer.championship_wins !== undefined ? String(editingPlayer.championship_wins) : '5',
        major_titles: editingPlayer.major_titles !== undefined ? String(editingPlayer.major_titles) : '5',
        int_placements: editingPlayer.int_placements !== undefined ? String(editingPlayer.int_placements) : '12',
        trophy_count: editingPlayer.trophy_count !== undefined ? String(editingPlayer.trophy_count) : '12',
        match_history: JSON.stringify(playerMatchesList),
        achievements: JSON.stringify(playerAchievementsList),
        media: JSON.stringify(playerMediaList),
        socials: JSON.stringify(playerSocialList)
      };

      const method = editingPlayer.id ? 'PUT' : 'POST';
      const url = editingPlayer.id ? `/api/players/${editingPlayer.id}` : '/api/players';
      
      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save player');
      }
      
      setEditingPlayer(null);
      setToastMsg('تم حفظ بيانات اللاعب وتحديثها بنجاح! / Player saved successfully!');
      if (expandedTeamId) fetchPlayers(expandedTeamId);
    } catch (err: any) {
      console.error('Save player error:', err);
      if (err.name === 'AbortError') {
        alert('Request timed out. The server might be busy.');
      } else {
        alert(err.message);
      }
    } finally {
      setSaving(false);
      clearTimeout(timeoutId);
    }
  };

  if (loading) return <div className="p-8 font-syncopate text-[#FFC400] text-xs font-bold">LOADING_TEAMS...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-syncopate text-3xl font-black text-white uppercase tracking-tighter">
            TEAMS & <span className="text-[#FFC400]">ROSTERS</span>
          </h1>
          <p className="text-slate-400 font-inter text-sm mt-1">
            Manage official competitive divisions and individual active esports athletes
          </p>
        </div>
        <ArenaButton onClick={() => {
          handleOpenTeamEdit({
            name: '',
            game: '',
            region: 'Saudi Arabia',
            league: 'EMEA Division',
            logo: '',
            banner: '',
            bio: '',
            win_rate: '78%',
            global_rank: '#1 GLOBAL',
            championships: 3,
            published: 1,
            display_order: teams.length + 1
          });
        }}>
          <Plus size={16} className="mr-2" /> CREATE_TEAM
        </ArenaButton>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {teams.map((team) => (
          <div key={team.id} className="bg-[#081B3A] border border-white/5 overflow-hidden">
            <div className="p-6 flex items-center justify-between bg-slate-900/40 border-b border-white/5">
              <div className="flex items-center gap-6">
                <button 
                  onClick={() => {
                    if (expandedTeamId === team.id) {
                      setExpandedTeamId(null);
                    } else {
                      setExpandedTeamId(team.id);
                      fetchPlayers(team.id);
                    }
                  }}
                  className="p-2 bg-slate-800 hover:bg-[#FFC400] hover:text-black text-white transition-colors"
                >
                  {expandedTeamId === team.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
                {team.logo && (
                  <img src={team.logo} alt={team.name} className="w-10 h-10 object-contain bg-black/40 p-1 border border-slate-800" />
                )}
                <div>
                  <div className="flex items-center gap-3">
                    <h3 className="font-syncopate text-lg font-black text-white uppercase tracking-tight">{team.name}</h3>
                    <span className="bg-[#FFC400] text-black text-[9px] font-syncopate font-black px-2 py-0.5">{team.game}</span>
                    <span className="bg-slate-800 text-slate-300 text-[9px] font-syncopate font-bold px-2 py-0.5">{team.region || 'EMEA'}</span>
                  </div>
                  <p className="text-slate-400 text-xs font-mono mt-1">
                    League: {team.league || 'Global'} | Rank: {team.global_rank || '#1'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    setExpandedTeamId(team.id);
                    handleOpenPlayerEdit({
                      ign: '',
                      name: '',
                      role: 'Starter',
                      photo: '',
                      bio: '',
                      nationality: 'Saudi Arabia',
                      age: '22',
                      kd: 1.25,
                      mvps: 5,
                      tournaments: 12,
                      win_rate: '75%',
                      status: 'active',
                      display_order: players.length + 1
                    });
                  }}
                  className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white font-syncopate text-[10px] font-bold tracking-wider transition-colors"
                >
                  <UserPlus size={14} /> ADD_PLAYER
                </button>
                <button 
                  onClick={() => {
                    handleOpenTeamEdit(team);
                  }}
                  className="p-2 bg-slate-800 hover:bg-[#FFC400] hover:text-black text-white transition-colors"
                >
                  <Edit2 size={16} />
                </button>
                <button 
                  onClick={() => setDeleteTarget({ id: team.id, type: 'team', name: team.name })}
                  className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedTeamId === team.id && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="p-6 bg-[#040E1E] border-t border-white/5"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-syncopate text-xs font-bold text-slate-400 uppercase tracking-widest">
                        ROSTER ATHLETES ({players.length})
                      </h4>
                    </div>

                    {players.length === 0 ? (
                      <p className="text-slate-500 font-mono text-xs italic py-4">No players added to this roster yet.</p>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {players.map(player => (
                          <div key={player.id} className="bg-[#081B3A] border border-slate-800 p-4 flex items-center justify-between group hover:border-[#FFC400] transition-colors">
                            <div className="flex items-center gap-4">
                              {player.photo ? (
                                <img src={player.photo} alt={player.ign} className="w-12 h-12 object-cover border border-slate-700" />
                              ) : (
                                <div className="w-12 h-12 bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-500 font-syncopate font-bold text-xs">
                                  {player.ign?.substring(0, 2).toUpperCase()}
                                </div>
                              )}
                              <div>
                                <h5 className="font-syncopate text-sm font-black text-white uppercase">{player.ign}</h5>
                                <p className="text-[#FFC400] font-syncopate text-[10px] uppercase">{player.role || 'PLAYER'}</p>
                                <p className="text-slate-400 font-mono text-[10px]">{player.name || player.nationality || 'Operative'}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleOpenPlayerEdit(player)}
                                className="p-1.5 bg-slate-800 hover:bg-[#FFC400] hover:text-black text-white transition-colors"
                              >
                                <Edit2 size={14} />
                              </button>
                              <button 
                                onClick={() => setDeleteTarget({ id: player.id, type: 'player', name: player.ign || player.name })}
                                className="p-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Team Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-4xl relative z-10 my-8 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                {editingTeam.id ? 'EDIT_TEAM' : 'CREATE_TEAM'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveTeam} className="p-6 space-y-8 overflow-y-auto flex-grow">
              
              {/* SECTION 1: HERO & BRANDING */}
              <FormSection title="1. HERO & BRANDING" subtitle="Team name, game division, region, logo, and banner">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Team Name</label>
                    <input 
                      type="text" 
                      value={editingTeam.name || ''}
                      onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
                      placeholder="e.g. Geekay Rocket League"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Game Title / Division</label>
                    <input 
                      type="text" 
                      value={editingTeam.game || ''}
                      onChange={e => setEditingTeam({...editingTeam, game: e.target.value})}
                      placeholder="e.g. ROCKET LEAGUE"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Region</label>
                    <input 
                      type="text" 
                      value={editingTeam.region || ''}
                      onChange={e => setEditingTeam({...editingTeam, region: e.target.value})}
                      placeholder="e.g. Saudi Arabia / MENA"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">League</label>
                    <input 
                      type="text" 
                      value={editingTeam.league || ''}
                      onChange={e => setEditingTeam({...editingTeam, league: e.target.value})}
                      placeholder="e.g. RLCS EMEA Major"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Global Rank</label>
                    <input 
                      type="text" 
                      value={editingTeam.global_rank || editingTeam.globalRank || ''}
                      onChange={e => setEditingTeam({...editingTeam, global_rank: e.target.value, globalRank: e.target.value})}
                      placeholder="e.g. #1 GLOBAL"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <ImageUploader 
                    label="Team Logo" 
                    value={editingTeam.logo || ''} 
                    onChange={(url) => setEditingTeam({ ...editingTeam, logo: url })}
                    aspectRatio="square"
                  />
                  <ImageUploader 
                    label="Hero Image / Banner" 
                    value={editingTeam.banner || editingTeam.hero_image || ''} 
                    onChange={(url) => setEditingTeam({ ...editingTeam, banner: url, hero_image: url })}
                    aspectRatio="banner"
                  />
                </div>
              </FormSection>

              {/* SECTION 2: TACTICAL INTEL & STATS */}
              <FormSection title="2. TACTICAL INTEL & STATS" subtitle="Overview narrative and competitive stats displayed on team page">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Tactical Bio / Overview</label>
                  <textarea 
                    rows={4}
                    value={editingTeam.bio || ''}
                    onChange={e => setEditingTeam({...editingTeam, bio: e.target.value})}
                    placeholder="Detailed narrative about the team's tactical vision and achievements..."
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Win Rate</label>
                    <input 
                      type="text" 
                      value={editingTeam.win_rate || editingTeam.winRate || ''}
                      onChange={e => setEditingTeam({...editingTeam, win_rate: e.target.value, winRate: e.target.value})}
                      placeholder="e.g. 78%"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Championships</label>
                    <input 
                      type="text" 
                      value={editingTeam.championships || ''}
                      onChange={e => setEditingTeam({...editingTeam, championships: e.target.value})}
                      placeholder="e.g. 5"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Season Record</label>
                    <input 
                      type="text" 
                      value={editingTeam.season_record || editingTeam.seasonRecord || ''}
                      onChange={e => setEditingTeam({...editingTeam, season_record: e.target.value, seasonRecord: e.target.value})}
                      placeholder="e.g. 18-4"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Display Order</label>
                    <input 
                      type="number" 
                      value={isNaN(editingTeam?.display_order) ? '' : (editingTeam?.display_order ?? 0)}
                      onChange={e => {
                        const val = parseInt(e.target.value, 10);
                        setEditingTeam({...editingTeam, display_order: isNaN(val) ? 0 : val});
                      }}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                </div>
              </FormSection>

              {/* SECTION 3: ACHIEVEMENTS & TROPHY CASE REPEATER */}
              <FormSection title="3. ACHIEVEMENTS & TROPHY CASE" subtitle="Championship history and major tournament placements">
                <FormRepeater
                  title="Trophy Hall of Fame"
                  items={trophiesList}
                  onItemsChange={setTrophiesList}
                  createDefaultItem={() => ({ title: 'RLCS Major', placement: '1st Place', year: '2025' })}
                  itemTitle={(item) => `${item.title || 'Tournament'} (${item.placement || item.rank || '1st'})`}
                  renderItemFields={(item, idx, onChange) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Tournament Title</label>
                        <input 
                          type="text" 
                          value={item.title || ''} 
                          onChange={e => onChange({ ...item, title: e.target.value })}
                          placeholder="e.g. RLCS World Championship" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Placement / Rank</label>
                        <input 
                          type="text" 
                          value={item.placement || item.rank || ''} 
                          onChange={e => onChange({ ...item, placement: e.target.value, rank: e.target.value })}
                          placeholder="e.g. 1st Place / Champion" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Year / Date</label>
                        <input 
                          type="text" 
                          value={item.year || item.date || ''} 
                          onChange={e => onChange({ ...item, year: e.target.value, date: e.target.value })}
                          placeholder="2025" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                    </div>
                  )}
                />
              </FormSection>

              {/* SECTION 4: MEDIA FILES REPEATER */}
              <FormSection title="4. MEDIA FILES" subtitle="Team photo gallery and video features">
                <FormRepeater
                  title="Division Gallery Assets"
                  items={teamMediaList}
                  onItemsChange={setTeamMediaList}
                  createDefaultItem={() => ({ type: 'photo', url: '' })}
                  itemTitle={(item) => item.type?.toUpperCase() || 'MEDIA'}
                  renderItemFields={(item, idx, onChange) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Media Type</label>
                        <select 
                          value={item.type || 'photo'}
                          onChange={e => onChange({ ...item, type: e.target.value })}
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                        >
                          <option value="photo">PHOTO</option>
                          <option value="video">VIDEO</option>
                        </select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        {item.type === 'video' ? (
                          <>
                            <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Video Stream URL</label>
                            <input 
                              type="text" 
                              value={item.url || ''} 
                              onChange={e => onChange({ ...item, url: e.target.value })}
                              placeholder="https://..." 
                              className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                            />
                          </>
                        ) : (
                          <ImageUploader
                            label="Photo File / صورة"
                            value={item.url || ''}
                            onChange={url => onChange({ ...item, url })}
                            aspectRatio="banner"
                          />
                        )}
                      </div>
                    </div>
                  )}
                />
              </FormSection>

              {/* PUBLISHED TOGGLE & SUBMIT */}
              <div className="flex items-center gap-8 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={editingTeam.published === 1}
                    onChange={e => setEditingTeam({...editingTeam, published: e.target.checked ? 1 : 0})}
                    className="w-5 h-5 bg-[#040E1E] border-slate-800 rounded-none checked:bg-[#FFC400] transition-colors"
                  />
                  <span className="font-syncopate text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-[#FFC400]">Published</span>
                </label>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button>
                <ArenaButton type="submit" disabled={saving}>
                  {saving ? 'SAVING...' : 'SAVE_TEAM'}
                </ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Player Modal */}
      {editingPlayer && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingPlayer(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-4xl relative z-10 my-8 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                {editingPlayer.id ? 'EDIT_PLAYER' : 'ADD_PLAYER'}
              </h2>
              <button onClick={() => setEditingPlayer(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSavePlayer} className="p-6 space-y-8 overflow-y-auto flex-grow">
              
              {/* SECTION 1: HERO */}
              <FormSection title="1. HERO & ATHLETE PROFILE" subtitle="Player IGN, real identity, competitive role, and photo">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">In-Game Nickname (IGN)</label>
                    <input 
                      type="text" 
                      value={editingPlayer.ign || ''}
                      onChange={e => setEditingPlayer({...editingPlayer, ign: e.target.value})}
                      placeholder="e.g. TRK511"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Full Real Name</label>
                    <input 
                      type="text" 
                      value={editingPlayer.name || ''}
                      onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})}
                      placeholder="e.g. Hisham Al-Kadi"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Competitive Role</label>
                    <input 
                      type="text" 
                      value={editingPlayer.role || ''}
                      onChange={e => setEditingPlayer({...editingPlayer, role: e.target.value})}
                      placeholder="e.g. Offense / Captain / IGL"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Nationality / Country</label>
                    <input 
                      type="text" 
                      value={editingPlayer.nationality || editingPlayer.country || ''}
                      onChange={e => setEditingPlayer({...editingPlayer, nationality: e.target.value, country: e.target.value})}
                      placeholder="e.g. Saudi Arabia, Brazil, Germany"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Joined Date (e.g. January 2024)</label>
                    <input 
                      type="text" 
                      value={editingPlayer.joined_date || editingPlayer.joinedDate || ''}
                      onChange={e => setEditingPlayer({...editingPlayer, joined_date: e.target.value, joinedDate: e.target.value})}
                      placeholder="e.g. January 2024"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                </div>

                <ImageUploader 
                  label="Player Athlete Photo" 
                  value={editingPlayer.photo || editingPlayer.image || ''} 
                  onChange={(url) => setEditingPlayer({ ...editingPlayer, photo: url, image: url })}
                  aspectRatio="square"
                />
              </FormSection>

              {/* SECTION 2: PLAYER OVERVIEW & RATINGS */}
              <FormSection title="2. PLAYER OVERVIEW & RATINGS" subtitle="Bio, age, K/D ratio, and tactical performance ratings">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Age / العمر</label>
                    <input 
                      type="text" 
                      value={editingPlayer.age || ''}
                      onChange={e => setEditingPlayer({...editingPlayer, age: e.target.value})}
                      placeholder="e.g. 22"
                      className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-[#FFC400] font-bold uppercase tracking-widest flex items-center justify-between">
                      <span>Overall Rating / التقييم العام</span>
                      <span className="text-[7px] text-slate-400 font-normal">AUTO-CALCULATED AVERAGE</span>
                    </label>
                    <input 
                      type="number"
                      step="0.1"
                      readOnly 
                      value={parseFloat((((editingPlayer.rating_performance ?? 4.4) + (editingPlayer.rating_consistency ?? 4.6) + (editingPlayer.rating_community ?? 4.7)) / 3).toFixed(1))}
                      placeholder="e.g. 4.6"
                      className="w-full bg-[#05142B] border border-[#FFC400]/40 p-3 text-[#FFC400] font-syncopate text-xs font-bold focus:outline-none cursor-not-allowed"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">K/D Ratio</label>
                    <input 
                      type="number"
                      step="0.01" 
                      value={editingPlayer.kd || 1.2}
                      onChange={e => setEditingPlayer({...editingPlayer, kd: parseFloat(e.target.value) || 0})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                </div>

                {/* Sub-ratings */}
                <div className="p-4 bg-[#040E1E]/80 border border-slate-800/80 rounded-none space-y-3 mt-4">
                  <span className="font-syncopate text-[9px] text-[#FFC400] font-bold uppercase tracking-widest block">
                    DETAILED PLAYER RATINGS / تفاصيل التقييمات (Out of 5.0)
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Tournament Performance</label>
                      <input 
                        type="number"
                        step="0.1"
                        min="0"
                        max="5" 
                        value={editingPlayer.rating_performance ?? 4.4}
                        onChange={e => {
                          const perf = parseFloat(e.target.value) || 0;
                          const cons = editingPlayer.rating_consistency ?? 4.6;
                          const comm = editingPlayer.rating_community ?? 4.7;
                          const overall = parseFloat(((perf + cons + comm) / 3).toFixed(1));
                          setEditingPlayer({...editingPlayer, rating_performance: perf, rating_overall: overall, rating: overall});
                        }}
                        placeholder="4.4"
                        className="w-full bg-[#05142B] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Consistency Rating</label>
                      <input 
                        type="number"
                        step="0.1"
                        min="0"
                        max="5" 
                        value={editingPlayer.rating_consistency ?? 4.6}
                        onChange={e => {
                          const perf = editingPlayer.rating_performance ?? 4.4;
                          const cons = parseFloat(e.target.value) || 0;
                          const comm = editingPlayer.rating_community ?? 4.7;
                          const overall = parseFloat(((perf + cons + comm) / 3).toFixed(1));
                          setEditingPlayer({...editingPlayer, rating_consistency: cons, rating_overall: overall, rating: overall});
                        }}
                        placeholder="4.6"
                        className="w-full bg-[#05142B] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Community Approval</label>
                      <input 
                        type="number"
                        step="0.1"
                        min="0"
                        max="5" 
                        value={editingPlayer.rating_community ?? 4.7}
                        onChange={e => {
                          const perf = editingPlayer.rating_performance ?? 4.4;
                          const cons = editingPlayer.rating_consistency ?? 4.6;
                          const comm = parseFloat(e.target.value) || 0;
                          const overall = parseFloat(((perf + cons + comm) / 3).toFixed(1));
                          setEditingPlayer({...editingPlayer, rating_community: comm, rating_overall: overall, rating: overall});
                        }}
                        placeholder="4.7"
                        className="w-full bg-[#05142B] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2 mt-4">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Player Bio & Tactical Intel</label>
                  <textarea 
                    rows={4}
                    value={editingPlayer.bio || editingPlayer.overview_description || ''}
                    onChange={e => setEditingPlayer({...editingPlayer, bio: e.target.value, overview_description: e.target.value})}
                    placeholder="Player career background, playstyle, and tactical strengths..."
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              </FormSection>

              {/* SECTION 3: CAREER STATS & ACCOLADES CARDS */}
              <FormSection title="3. CAREER STATS & ACCOLADES CARDS" subtitle="Control trophy cards, championship counts, win rates & matches">
                <div className="p-4 bg-[#040E1E]/80 border border-slate-800/80 mb-6 space-y-3">
                  <span className="font-syncopate text-[9px] text-[#FFC400] font-bold uppercase tracking-widest block">
                    ACHIEVEMENTS & ACCOLADES CARDS / كروت الإنجازات والبطولات
                  </span>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="space-y-2">
                      <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Championship Wins</label>
                      <input 
                        type="text" 
                        value={editingPlayer.championship_wins ?? '5'}
                        onChange={e => setEditingPlayer({...editingPlayer, championship_wins: e.target.value})}
                        placeholder="5"
                        className="w-full bg-[#05142B] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Major Titles</label>
                      <input 
                        type="text" 
                        value={editingPlayer.major_titles ?? '5'}
                        onChange={e => setEditingPlayer({...editingPlayer, major_titles: e.target.value})}
                        placeholder="5"
                        className="w-full bg-[#05142B] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Int. Placements</label>
                      <input 
                        type="text" 
                        value={editingPlayer.int_placements ?? '12'}
                        onChange={e => setEditingPlayer({...editingPlayer, int_placements: e.target.value})}
                        placeholder="12"
                        className="w-full bg-[#05142B] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Trophy Count</label>
                      <input 
                        type="text" 
                        value={editingPlayer.trophy_count ?? '12'}
                        onChange={e => setEditingPlayer({...editingPlayer, trophy_count: e.target.value})}
                        placeholder="12"
                        className="w-full bg-[#05142B] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Total Matches</label>
                    <input 
                      type="number" 
                      value={editingPlayer.tournaments || editingPlayer.total_matches || 0}
                      onChange={e => setEditingPlayer({...editingPlayer, tournaments: parseInt(e.target.value) || 0, total_matches: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Win Rate</label>
                    <input 
                      type="text" 
                      value={editingPlayer.win_rate || '75%'}
                      onChange={e => setEditingPlayer({...editingPlayer, win_rate: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Major Titles / MVPs</label>
                    <input 
                      type="number" 
                      value={editingPlayer.mvps || editingPlayer.major_titles || 0}
                      onChange={e => setEditingPlayer({...editingPlayer, mvps: parseInt(e.target.value) || 0, major_titles: parseInt(e.target.value) || 0})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                </div>
              </FormSection>

              {/* SECTION 4: MATCH HISTORY REPEATER */}
              <FormSection title="4. MATCH HISTORY" subtitle="Recent match results and opponents">
                <FormRepeater
                  title="Recent Match Record"
                  items={playerMatchesList}
                  onItemsChange={setPlayerMatchesList}
                  createDefaultItem={() => ({ opponent: 'Team Vitality', score: '3-1', result: 'WIN', date: '2025-02-10' })}
                  itemTitle={(item) => `vs ${item.opponent || 'Opponent'} (${item.result || 'WIN'} ${item.score || ''})`}
                  renderItemFields={(item, idx, onChange) => (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Opponent</label>
                        <input 
                          type="text" 
                          value={item.opponent || ''} 
                          onChange={e => onChange({ ...item, opponent: e.target.value })}
                          placeholder="e.g. Team Vitality" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Score</label>
                        <input 
                          type="text" 
                          value={item.score || ''} 
                          onChange={e => onChange({ ...item, score: e.target.value })}
                          placeholder="e.g. 3-1" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Result</label>
                        <select 
                          value={item.result || 'WIN'} 
                          onChange={e => onChange({ ...item, result: e.target.value })}
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                        >
                          <option value="WIN">WIN</option>
                          <option value="LOSS">LOSS</option>
                          <option value="DRAW">DRAW</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Date</label>
                        <input 
                          type="text" 
                          value={item.date || ''} 
                          onChange={e => onChange({ ...item, date: e.target.value })}
                          placeholder="2025-02-10" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                    </div>
                  )}
                />
              </FormSection>

              {/* SECTION 5: ACHIEVEMENTS REPEATER */}
              <FormSection title="5. ACHIEVEMENTS & ACCOLADES" subtitle="Individual MVP awards and championship wins">
                <FormRepeater
                  title="Player Hall of Fame"
                  items={playerAchievementsList}
                  onItemsChange={setPlayerAchievementsList}
                  createDefaultItem={() => ({ tournament: 'RLCS Major', placement: 'MVP', year: '2025' })}
                  itemTitle={(item) => `${item.tournament || 'Tournament'} (${item.placement || '1st'})`}
                  renderItemFields={(item, idx, onChange) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Tournament</label>
                        <input 
                          type="text" 
                          value={item.tournament || ''} 
                          onChange={e => onChange({ ...item, tournament: e.target.value })}
                          placeholder="e.g. Gamers8 Major" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Placement / Award</label>
                        <input 
                          type="text" 
                          value={item.placement || ''} 
                          onChange={e => onChange({ ...item, placement: e.target.value })}
                          placeholder="e.g. MVP / 1st Place" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Year</label>
                        <input 
                          type="text" 
                          value={item.year || ''} 
                          onChange={e => onChange({ ...item, year: e.target.value })}
                          placeholder="2025" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                    </div>
                  )}
                />
              </FormSection>

              {/* SECTION 6: MEDIA FILES REPEATER */}
              <FormSection title="6. MEDIA FILES & GALLERY" subtitle="Player photo gallery and video highlights">
                <FormRepeater
                  title="Player Media Assets"
                  items={playerMediaList}
                  onItemsChange={setPlayerMediaList}
                  createDefaultItem={() => ({ type: 'photo', url: '', title: '' })}
                  itemTitle={(item) => `${item.type?.toUpperCase() || 'MEDIA'} ${item.title ? `- ${item.title}` : ''}`}
                  renderItemFields={(item, idx, onChange) => (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Media Type / نوع الميديا</label>
                          <select 
                            value={item.type || 'photo'}
                            onChange={e => onChange({ ...item, type: e.target.value })}
                            className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                          >
                            <option value="photo">PHOTO / صورة</option>
                            <option value="video">VIDEO / فيديو</option>
                          </select>
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Media Caption / Title / عنوان الصورة أو الفيديو</label>
                          <input 
                            type="text" 
                            value={item.title || ''} 
                            onChange={e => onChange({ ...item, title: e.target.value })}
                            placeholder="e.g. Arena Trophy Celebration 2025" 
                            className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        {item.type === 'video' ? (
                          <>
                            <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Video Stream or Embed URL / رابط الفيديو</label>
                            <input 
                              type="text" 
                              value={item.url || ''} 
                              onChange={e => onChange({ ...item, url: e.target.value })}
                              placeholder="https://youtube.com/watch?v=... or https://..." 
                              className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                            />
                          </>
                        ) : (
                          <div>
                            <ImageUploader
                              label="Upload Photo File / رفع ملف صورة"
                              value={item.url || ''}
                              onChange={url => onChange({ ...item, url })}
                              aspectRatio="banner"
                            />
                            {item.url && (
                              <div className="mt-2 flex items-center gap-3 p-2 bg-slate-950 border border-slate-800">
                                <img src={item.url} alt="Preview" className="w-16 h-10 object-cover border border-slate-700 shrink-0" />
                                <div className="text-[10px] text-slate-400 font-mono truncate">
                                  <span className="text-[#FFC400] font-bold">Uploaded Image:</span> {item.url}
                                </div>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                />
              </FormSection>

              {/* SECTION 7: SOCIAL ACCOUNTS REPEATER */}
              <FormSection title="7. CONNECT WITH OPERATIVE / SOCIALS" subtitle="Player social media channels and streams">
                <FormRepeater
                  title="Player Social Handles"
                  items={playerSocialList}
                  onItemsChange={setPlayerSocialList}
                  createDefaultItem={() => ({ platform: 'twitter', handle: '@TRK511' })}
                  itemTitle={(item) => `${item.platform?.toUpperCase() || 'SOCIAL'} (${item.handle || ''})`}
                  renderItemFields={(item, idx, onChange) => (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Platform</label>
                        <select 
                          value={item.platform || 'twitter'}
                          onChange={e => onChange({ ...item, platform: e.target.value })}
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                        >
                          <option value="twitter">X / TWITTER</option>
                          <option value="twitch">TWITCH</option>
                          <option value="instagram">INSTAGRAM</option>
                          <option value="youtube">YOUTUBE</option>
                          <option value="tiktok">TIKTOK</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Handle / URL</label>
                        <input 
                          type="text" 
                          value={item.handle || ''} 
                          onChange={e => onChange({ ...item, handle: e.target.value })}
                          placeholder="@Handle or URL" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                    </div>
                  )}
                />
              </FormSection>

              <div className="grid grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Status</label>
                  <select 
                    value={editingPlayer.status || 'active'}
                    onChange={e => setEditingPlayer({...editingPlayer, status: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                  >
                    <option value="active">ACTIVE</option>
                    <option value="inactive">INACTIVE</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Display Order</label>
                  <input 
                    type="number" 
                    value={isNaN(editingPlayer?.display_order) ? '' : (editingPlayer?.display_order ?? 0)}
                    onChange={e => {
                      const val = parseInt(e.target.value, 10);
                      setEditingPlayer({...editingPlayer, display_order: isNaN(val) ? 0 : val});
                    }}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                <button type="button" onClick={() => setEditingPlayer(null)} className="px-8 py-4 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button>
                <ArenaButton type="submit" disabled={saving}>
                  {saving ? 'SAVING...' : 'SAVE_PLAYER'}
                </ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      <ToastNotification message={toastMsg} onClose={() => setToastMsg(null)} />

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title={deleteTarget?.type === 'team' ? "DELETE_TEAM" : "DELETE_PLAYER"}
        itemName={deleteTarget?.name}
        description={
          deleteTarget?.type === 'team'
            ? "Are you sure you want to delete this team and all associated players? This action cannot be undone."
            : "Are you sure you want to delete this athlete from the roster? This action cannot be undone."
        }
      />
    </div>
  );
};

export default AdminTeams;

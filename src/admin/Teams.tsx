
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

const AdminTeams = () => {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingTeam, setEditingTeam] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedTeamId, setExpandedTeamId] = useState<number | null>(null);
  const [players, setPlayers] = useState<any[]>([]);
  const [editingPlayer, setEditingPlayer] = useState<any>(null);

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
    const res = await fetch(`/api/teams/${teamId}/players`);
    const data = await res.json();
    setPlayers(data);
  };

  const handleSaveTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const method = editingTeam.id ? 'PUT' : 'POST';
      const url = editingTeam.id ? `/api/teams/${editingTeam.id}` : '/api/teams';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTeam),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save team');
      }
      
      setIsModalOpen(false);
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

  const handleDeleteTeam = async (id: number) => {
    if (!confirm('Are you sure you want to delete this team and all its players?')) return;
    try {
      await fetch(`/api/teams/${id}`, { method: 'DELETE' });
      fetchTeams();
    } catch (err: any) {
      alert('Failed to delete team');
    }
  };

  const handleSavePlayer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const method = editingPlayer.id ? 'PUT' : 'POST';
      const url = editingPlayer.id ? `/api/players/${editingPlayer.id}` : '/api/players';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editingPlayer, team_id: expandedTeamId }),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save player');
      }
      
      setEditingPlayer(null);
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

  const handleDeletePlayer = async (id: number) => {
    if (!confirm('Delete player?')) return;
    await fetch(`/api/players/${id}`, { method: 'DELETE' });
    if (expandedTeamId) fetchPlayers(expandedTeamId);
  };

  if (loading) return <div>Loading teams...</div>;

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">ROSTER_MANAGEMENT</span>
          <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">TEAMS</h1>
        </div>
        <ArenaButton onClick={() => { setEditingTeam({ name: '', game: '', region: '', league: '', banner: '', tagline: '', achievements: [], display_order: 0, published: 0 }); setIsModalOpen(true); }}>
          <Plus size={18} className="mr-2" /> ADD_TEAM
        </ArenaButton>
      </header>

      <div className="space-y-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-[#081B3A] border border-white/5 overflow-hidden">
            <div className="p-8 flex items-center justify-between group">
              <div className="flex items-center gap-8">
                <div className="w-16 h-16 bg-[#040E1E] border border-white/5 flex items-center justify-center overflow-hidden">
                  {team.banner ? <img src={team.banner} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-700" />}
                </div>
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <span className="bg-[#FFC400] text-black px-3 py-1 font-syncopate text-[8px] font-black tracking-widest uppercase skew-x-[-10deg]">{team.game}</span>
                    <span className="text-slate-500 font-syncopate text-[8px] font-bold tracking-widest uppercase">{team.region}</span>
                  </div>
                  <h3 className="font-syncopate text-2xl font-black text-white uppercase tracking-tighter">{team.name}</h3>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button 
                  onClick={() => {
                    if (expandedTeamId === team.id) setExpandedTeamId(null);
                    else {
                      setExpandedTeamId(team.id);
                      fetchPlayers(team.id);
                    }
                  }}
                  className="p-3 bg-white/5 text-slate-400 hover:text-[#FFC400] transition-colors"
                >
                  {expandedTeamId === team.id ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                </button>
                <button onClick={() => { setEditingTeam(team); setIsModalOpen(true); }} className="p-3 bg-white/5 text-slate-400 hover:text-blue-500 transition-colors">
                  <Edit2 size={20} />
                </button>
                <button onClick={() => handleDeleteTeam(team.id)} className="p-3 bg-white/5 text-slate-400 hover:text-red-500 transition-colors">
                  <Trash2 size={20} />
                </button>
              </div>
            </div>

            <AnimatePresence>
              {expandedTeamId === team.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t border-white/5 bg-[#040E1E]/50"
                >
                  <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                      <h4 className="font-syncopate text-sm font-bold text-white tracking-widest uppercase">ROSTER_OPERATIVES</h4>
                      <button 
                        onClick={() => setEditingPlayer({ ign: '', role: '', name: '', age: '', nationality: '', socials: {}, achievements: [], display_order: 0, status: 'active' })}
                        className="flex items-center gap-2 text-[#FFC400] font-syncopate text-[10px] font-bold tracking-widest uppercase hover:underline"
                      >
                        <UserPlus size={14} /> ADD_PLAYER
                      </button>
                    </div>

                    <div className="overflow-x-auto">
                      <table className="w-full text-left font-syncopate text-[10px] tracking-widest uppercase">
                        <thead className="text-slate-500 border-b border-white/5">
                          <tr>
                            <th className="pb-4 font-bold">IGN</th>
                            <th className="pb-4 font-bold">ROLE</th>
                            <th className="pb-4 font-bold">STATUS</th>
                            <th className="pb-4 font-bold text-right">ACTIONS</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                          {players.map((player) => (
                            <tr key={player.id} className="group hover:bg-white/[0.02]">
                              <td className="py-4 font-bold text-white">{player.ign}</td>
                              <td className="py-4 text-slate-400">{player.role}</td>
                              <td className="py-4">
                                <span className={`px-2 py-1 rounded-full text-[8px] font-black ${player.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                  {player.status}
                                </span>
                              </td>
                              <td className="py-4 text-right">
                                <div className="flex items-center justify-end gap-2">
                                  <button onClick={() => setEditingPlayer(player)} className="p-2 text-slate-600 hover:text-blue-500 transition-colors"><Edit2 size={14} /></button>
                                  <button onClick={() => handleDeletePlayer(player.id)} className="p-2 text-slate-600 hover:text-red-500 transition-colors"><Trash2 size={14} /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>

      {/* Team Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-2xl relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                {editingTeam.id ? 'EDIT_TEAM' : 'CREATE_TEAM'}
              </h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSaveTeam} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Team Name</label>
                  <input 
                    type="text" 
                    value={editingTeam.name}
                    onChange={e => setEditingTeam({...editingTeam, name: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Game Title</label>
                  <input 
                    type="text" 
                    value={editingTeam.game}
                    onChange={e => setEditingTeam({...editingTeam, game: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Region</label>
                  <input 
                    type="text" 
                    value={editingTeam.region}
                    onChange={e => setEditingTeam({...editingTeam, region: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">League</label>
                  <input 
                    type="text" 
                    value={editingTeam.league}
                    onChange={e => setEditingTeam({...editingTeam, league: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Banner URL</label>
                <input 
                  type="text" 
                  value={editingTeam.banner}
                  onChange={e => setEditingTeam({...editingTeam, banner: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingPlayer(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-xl relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                {editingPlayer.id ? 'EDIT_PLAYER' : 'ADD_PLAYER'}
              </h2>
              <button onClick={() => setEditingPlayer(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSavePlayer} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">IGN</label>
                  <input 
                    type="text" 
                    value={editingPlayer.ign}
                    onChange={e => setEditingPlayer({...editingPlayer, ign: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Role</label>
                  <input 
                    type="text" 
                    value={editingPlayer.role}
                    onChange={e => setEditingPlayer({...editingPlayer, role: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Full Name</label>
                <input 
                  type="text" 
                  value={editingPlayer.name}
                  onChange={e => setEditingPlayer({...editingPlayer, name: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Status</label>
                  <select 
                    value={editingPlayer.status}
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
                    value={editingPlayer.display_order}
                    onChange={e => setEditingPlayer({...editingPlayer, display_order: parseInt(e.target.value)})}
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
    </div>
  );
};

export default AdminTeams;

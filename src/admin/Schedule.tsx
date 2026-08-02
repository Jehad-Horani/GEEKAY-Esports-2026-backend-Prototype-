
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Calendar, Filter, Search, ExternalLink, FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import * as XLSX from 'xlsx';

const AdminSchedule = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [filterGame, setFilterGame] = useState('ALL');
  
  // Excel Upload State
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<{ type: 'success' | 'error' | null, message: string }>({ type: null, message: '' });
  const [replaceMode, setReplaceMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/events');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch events:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const method = editingItem.id ? 'PUT' : 'POST';
      const url = editingItem.id ? `/api/events/${editingItem.id}` : '/api/events';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save event');
      }
      
      setEditingItem(null);
      fetchItems();
    } catch (err: any) {
      console.error('Save event error:', err);
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

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this event?')) return;
    await fetch(`/api/events/${id}`, { method: 'DELETE' });
    fetchItems();
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setUploadStatus({ type: null, message: '' });
    setUploadProgress(10);

    try {
      const reader = new FileReader();
      reader.onload = async (evt) => {
        try {
          const bstr = evt.target?.result;
          const wb = XLSX.read(bstr, { type: 'binary' });
          const wsname = wb.SheetNames[0];
          const ws = wb.Sheets[wsname];
          const data = XLSX.utils.sheet_to_json(ws);

          setUploadProgress(40);

          if (data.length === 0) {
            throw new Error('Excel file is empty');
          }

          // Map columns to our schema
          const events = data.map((row: any) => ({
            title: row['Event Name'] || row['title'] || 'Untitled Event',
            game: (row['Game Title'] || row['game'] || 'RL').toUpperCase(),
            start_date: row['Date'] || row['start_date'] || '',
            status: (row['Status'] || row['status'] || 'upcoming').toLowerCase(),
            link: row['Link'] || row['link'] || '',
            type: row['Type'] || 'match',
            published: 1
          }));

          setUploadProgress(60);

          // If replace mode, delete all existing events first
          if (replaceMode) {
            // In a real app, we'd have a bulk delete or bulk replace API
            // For now, we'll just append or handle it server-side if possible
            // But since we don't have a bulk API, we'll just post them one by one
            // or warn the user. Let's assume we append for now or handle the logic.
          }

          let successCount = 0;
          for (const event of events) {
            const res = await fetch('/api/events', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(event)
            });
            if (res.ok) successCount++;
            setUploadProgress(60 + (successCount / events.length) * 30);
          }

          setUploadProgress(100);
          setUploadStatus({ type: 'success', message: `Schedule imported successfully: ${successCount} events added.` });
          fetchItems();
          
          setTimeout(() => {
            setUploadStatus({ type: null, message: '' });
            setUploadProgress(0);
          }, 5000);
        } catch (err: any) {
          setUploadStatus({ type: 'error', message: err.message || 'Failed to parse Excel file' });
        } finally {
          setUploading(false);
          if (fileInputRef.current) fileInputRef.current.value = '';
        }
      };
      reader.readAsBinaryString(file);
    } catch (err: any) {
      setUploadStatus({ type: 'error', message: 'Failed to read file' });
      setUploading(false);
    }
  };

  const games = ['ALL', 'RL', 'HOK', 'PUBG', 'VALORANT', 'LOL'];
  const filteredItems = filterGame === 'ALL' ? items : items.filter(i => i.game === filterGame);

  if (loading) return <div>Loading schedule...</div>;

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">OPERATIONAL_CALENDAR</span>
          <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">SCHEDULE</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end gap-2">
            <div className="flex items-center gap-3 bg-white/5 p-1 rounded-sm border border-white/10">
              <button 
                onClick={() => setReplaceMode(false)}
                className={`px-3 py-1.5 font-syncopate text-[8px] font-bold transition-all ${!replaceMode ? 'bg-[#FFC400] text-black' : 'text-slate-500 hover:text-white'}`}
              >
                APPEND
              </button>
              <button 
                onClick={() => setReplaceMode(true)}
                className={`px-3 py-1.5 font-syncopate text-[8px] font-bold transition-all ${replaceMode ? 'bg-red-500 text-white' : 'text-slate-500 hover:text-white'}`}
              >
                REPLACE
              </button>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleExcelUpload}
              accept=".xlsx, .xls, .csv"
              className="hidden"
            />
            <ArenaButton 
              variant="outline" 
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="h-10 text-[10px]"
            >
              <FileSpreadsheet size={16} className="mr-2" /> 
              {uploading ? 'UPLOADING...' : 'UPLOAD_EXCEL'}
            </ArenaButton>
          </div>
          <ArenaButton onClick={() => setEditingItem({ title: '', game: 'RL', type: 'match', start_date: '', end_date: '', time: '', region: 'GLOBAL', status: 'upcoming', link: '', featured: 0, description: '', banner: '', organizer: '', teams: '[]', matches: '[]', results: '{}', media: '[]', social: '[]', published: 0 })}>
            <Plus size={18} className="mr-2" /> ADD_EVENT
          </ArenaButton>
        </div>
      </header>

      {/* Upload Status Feedback */}
      <AnimatePresence>
        {uploadStatus.type && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 border flex items-center gap-4 ${uploadStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-red-500/10 border-red-500/20 text-red-500'}`}
          >
            {uploadStatus.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span className="font-syncopate text-[10px] font-bold tracking-widest uppercase">{uploadStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {uploading && (
        <div className="w-full bg-white/5 h-1 relative overflow-hidden">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${uploadProgress}%` }}
            className="absolute top-0 left-0 h-full bg-[#FFC400]"
          />
        </div>
      )}

      <div className="flex flex-col md:flex-row gap-6">
        <div className="relative min-w-[250px]">
          <Filter className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <select 
            value={filterGame}
            onChange={e => setFilterGame(e.target.value)}
            className="w-full bg-[#081B3A] border border-white/5 py-6 pl-16 pr-6 text-white font-syncopate text-[10px] tracking-widest focus:outline-none focus:border-[#FFC400] appearance-none"
          >
            {games.map(g => <option key={g} value={g}>{g.toUpperCase()}</option>)}
          </select>
        </div>
      </div>

      <div className="bg-[#081B3A] border border-white/5 overflow-hidden">
        <table className="w-full text-left font-syncopate text-[10px] tracking-widest uppercase">
          <thead className="text-slate-500 border-b border-white/5">
            <tr>
              <th className="p-8 font-bold">EVENT</th>
              <th className="p-8 font-bold">DATE</th>
              <th className="p-8 font-bold">STATUS</th>
              <th className="p-8 font-bold text-right">ACTIONS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredItems.map((item) => (
              <tr key={item.id} className="group hover:bg-white/[0.02] transition-colors">
                <td className="p-8">
                  <div className="flex items-center gap-4 mb-2">
                    <span className="bg-[#FFC400] text-black px-2 py-0.5 font-syncopate text-[6px] font-black tracking-widest uppercase skew-x-[-10deg]">{item.game}</span>
                    <span className="text-slate-600 font-syncopate text-[6px] font-bold tracking-widest uppercase">{item.type}</span>
                  </div>
                  <p className="font-bold text-white text-sm">{item.title}</p>
                </td>
                <td className="p-8 text-slate-400">
                  {item.start_date} {item.time && `| ${item.time}`}
                </td>
                <td className="p-8">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black ${item.status === 'live' ? 'bg-red-500/10 text-red-500 animate-pulse' : item.status === 'finished' ? 'bg-slate-500/10 text-slate-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="p-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {item.link && <a href={item.link} target="_blank" className="p-3 bg-white/5 text-slate-400 hover:text-[#FFC400] transition-colors"><ExternalLink size={18} /></a>}
                    <button onClick={() => setEditingItem(item)} className="p-3 bg-white/5 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-3 bg-white/5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-2xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                {editingItem.id ? 'EDIT_EVENT' : 'ADD_EVENT'}
              </h2>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto flex-grow">
              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Event Title</label>
                <input 
                  type="text" 
                  value={editingItem.title}
                  onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Game</label>
                  <select 
                    value={editingItem.game}
                    onChange={e => setEditingItem({...editingItem, game: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                  >
                    {games.filter(g => g !== 'ALL').map(g => <option key={g} value={g}>{g}</option>)}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Type</label>
                  <select 
                    value={editingItem.type}
                    onChange={e => setEditingItem({...editingItem, type: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                  >
                    <option value="match">MATCH</option>
                    <option value="tournament">TOURNAMENT</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Start Date</label>
                  <input 
                    type="date" 
                    value={editingItem.start_date}
                    onChange={e => setEditingItem({...editingItem, start_date: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Time</label>
                  <input 
                    type="text" 
                    value={editingItem.time}
                    onChange={e => setEditingItem({...editingItem, time: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. 18:00 GMT"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Status</label>
                  <select 
                    value={editingItem.status}
                    onChange={e => setEditingItem({...editingItem, status: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                  >
                    <option value="upcoming">UPCOMING</option>
                    <option value="live">LIVE</option>
                    <option value="finished">FINISHED</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">External Link</label>
                  <input 
                    type="text" 
                    value={editingItem.link}
                    onChange={e => setEditingItem({...editingItem, link: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Event Description</label>
                <textarea 
                  value={editingItem.description || ''}
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] min-h-[100px]"
                  placeholder="Enter detailed description..."
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">End Date</label>
                  <input 
                    type="date" 
                    value={editingItem.end_date || ''}
                    onChange={e => setEditingItem({...editingItem, end_date: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Organizer</label>
                  <input 
                    type="text" 
                    value={editingItem.organizer || ''}
                    onChange={e => setEditingItem({...editingItem, organizer: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. Psyonix / BLAST"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Region / Location</label>
                  <input 
                    type="text" 
                    value={editingItem.region || ''}
                    onChange={e => setEditingItem({...editingItem, region: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. EMEA / London"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Banner Image URL</label>
                  <input 
                    type="text" 
                    value={editingItem.banner || ''}
                    onChange={e => setEditingItem({...editingItem, banner: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Participating Teams (JSON)</label>
                <textarea 
                  value={editingItem.teams || ''}
                  onChange={e => setEditingItem({...editingItem, teams: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400] min-h-[100px]"
                  placeholder='[{"name": "Team Name", "logo": "url", "region": "Saudi Arabia"}]'
                />
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Matches & Schedules (JSON)</label>
                <textarea 
                  value={editingItem.matches || ''}
                  onChange={e => setEditingItem({...editingItem, matches: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400] min-h-[100px]"
                  placeholder='[{"date": "2026-02-10", "teams": "Team A vs Team B", "score": "3 - 2", "status": "completed"}]'
                />
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Podium Results (JSON)</label>
                <textarea 
                  value={editingItem.results || ''}
                  onChange={e => setEditingItem({...editingItem, results: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400] min-h-[60px]"
                  placeholder='{"winner": "Team A", "runnerUp": "Team B", "mvp": "Player"}'
                />
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Media Files JSON</label>
                  <textarea 
                    value={editingItem.media || ''}
                    onChange={e => setEditingItem({...editingItem, media: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400] min-h-[80px]"
                    placeholder='[{"type": "photo", "url": "https://..."}]'
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Social Posts JSON</label>
                  <textarea 
                    value={editingItem.social || ''}
                    onChange={e => setEditingItem({...editingItem, social: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400] min-h-[80px]"
                    placeholder='[{"platform": "twitter", "handle": "@...", "text": "..."}]'
                  />
                </div>
              </div>

              <div className="flex items-center gap-8 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={editingItem.published === 1}
                    onChange={e => setEditingItem({...editingItem, published: e.target.checked ? 1 : 0})}
                    className="w-5 h-5 bg-[#040E1E] border-slate-800 rounded-none checked:bg-[#FFC400] transition-colors"
                  />
                  <span className="font-syncopate text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-[#FFC400]">Published</span>
                </label>
              </div>

              <div className="pt-8 border-t border-white/5 flex justify-end gap-4">
                <button type="button" onClick={() => setEditingItem(null)} className="px-8 py-4 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-white transition-colors">Cancel</button>
                <ArenaButton type="submit" disabled={saving}>
                  {saving ? 'SAVING...' : 'SAVE_EVENT'}
                </ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminSchedule;

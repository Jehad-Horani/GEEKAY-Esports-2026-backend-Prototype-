
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Calendar, Filter, Search, ExternalLink, FileSpreadsheet, Upload, CheckCircle2, AlertCircle } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ImageUploader from '../components/ImageUploader';
import * as XLSX from 'xlsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

import FormSection from './components/FormSection';
import FormRepeater from './components/FormRepeater';
import { getAuthHeaders } from './utils/api';
import { getDynamicStatus } from '../utils/dateStatus';

const AdminSchedule = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name?: string } | null>(null);
  const [filterGame, setFilterGame] = useState('ALL');

  // Parsed sub-structures for repeater management
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [podiumResults, setPodiumResults] = useState<{ winner: string; runnerUp: string; mvp: string }>({ winner: '', runnerUp: '', mvp: '' });
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [socialList, setSocialList] = useState<any[]>([]);

  // Open modal handler with safe JSON parsing
  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    
    // Parse Teams JSON
    try {
      const parsed = typeof item.teams === 'string' ? JSON.parse(item.teams) : item.teams;
      setTeamsList(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setTeamsList([]);
    }

    // Parse Matches JSON
    try {
      const parsed = typeof item.matches === 'string' ? JSON.parse(item.matches) : item.matches;
      setMatchesList(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setMatchesList([]);
    }

    // Parse Podium Results JSON
    try {
      const parsed = typeof item.results === 'string' ? JSON.parse(item.results) : item.results;
      setPodiumResults({
        winner: parsed?.winner || '',
        runnerUp: parsed?.runnerUp || '',
        mvp: parsed?.mvp || ''
      });
    } catch (e) {
      setPodiumResults({ winner: '', runnerUp: '', mvp: '' });
    }

    // Parse Media JSON
    try {
      const parsed = typeof item.media === 'string' ? JSON.parse(item.media) : item.media;
      setMediaList(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setMediaList([]);
    }

    // Parse Social JSON
    try {
      const parsed = typeof item.social === 'string' ? JSON.parse(item.social) : item.social;
      setSocialList(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setSocialList([]);
    }
  };
  
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

  // Game Titles Management State
  const [gameTitlesList, setGameTitlesList] = useState<{ id?: number | string; name: string }[]>([]);
  const [isManageTitlesOpen, setIsManageTitlesOpen] = useState(false);
  const [newTitleInput, setNewTitleInput] = useState('');

  const fetchGameTitles = async () => {
    try {
      const res = await fetch('/api/game-titles');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) setGameTitlesList(data);
      }
    } catch (e) {
      console.error('Failed to fetch game titles:', e);
    }
  };

  const handleAddGameTitle = async (nameToAdd?: string) => {
    const title = (nameToAdd || newTitleInput).trim().toUpperCase();
    if (!title) return;
    try {
      const res = await fetch('/api/game-titles', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ name: title })
      });
      if (res.ok) {
        setNewTitleInput('');
        fetchGameTitles();
      }
    } catch (e) {
      console.error('Error adding game title:', e);
    }
  };

  const handleDeleteGameTitle = async (gt: { id?: number | string; name: string }) => {
    try {
      if (gt.id) {
        await fetch(`/api/game-titles/${gt.id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
      } else {
        await fetch(`/api/game_titles/by-name/${encodeURIComponent(gt.name)}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
      }
      setGameTitlesList(prev => prev.filter(item => item.name.toUpperCase() !== gt.name.toUpperCase()));
      fetchGameTitles();
    } catch (e) {
      console.error('Error deleting game title:', e);
    }
  };

  useEffect(() => {
    fetchItems();
    fetchGameTitles();
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const payload = {
        ...editingItem,
        teams: JSON.stringify(teamsList),
        matches: JSON.stringify(matchesList),
        results: JSON.stringify(podiumResults),
        media: JSON.stringify(mediaList),
        social: JSON.stringify(socialList)
      };

      const method = editingItem.id ? 'PUT' : 'POST';
      const url = editingItem.id ? `/api/events/${editingItem.id}` : '/api/events';
      
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

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      setItems(prev => prev.filter(item => String(item.id) !== String(id)));
      await fetch(`/api/events/${id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
      fetchItems();
    } catch (err: any) {
      fetchItems();
    }
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
              headers: getAuthHeaders(),
              credentials: 'include',
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

  const dynamicGameTitles = useMemo(() => {
    const set = new Set<string>();
    gameTitlesList.forEach(gt => {
      if (gt.name) set.add(gt.name.trim().toUpperCase());
    });
    items.forEach(i => {
      if (i.game) set.add(String(i.game).trim().toUpperCase());
    });
    return Array.from(set);
  }, [gameTitlesList, items]);

  const games = ['ALL', ...dynamicGameTitles];
  const filteredItems = filterGame === 'ALL' ? items : items.filter(i => String(i.game).toUpperCase() === filterGame.toUpperCase());

  if (loading) return <div>Loading schedule...</div>;

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">OPERATIONAL_CALENDAR</span>
          <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">SCHEDULE</h1>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 sm:gap-3">
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
            <ArenaButton 
              variant="outline" 
              onClick={() => setIsManageTitlesOpen(true)}
              className="h-10 text-[10px] border-[#FFC400]/40 text-[#FFC400] hover:bg-[#FFC400]/10"
            >
              GAME TITLES (إدارة الألعاب)
            </ArenaButton>
          </div>
          <ArenaButton onClick={() => handleOpenEdit({ title: '', game: 'RL', type: 'match', start_date: '', end_date: '', time: '', region: 'GLOBAL', status: 'upcoming', link: '', featured: 0, description: '', banner: '', organizer: '', location: '', venue: '', overview_title: 'TACTICAL INTELLIGENCE', prize_pool: '$100,000', total_teams: '16', broadcast: 'TWITCH / YOUTUBE', purpose: 'CHAMPIONSHIP VICTORY', format: 'DOUBLE ELIMINATION BRACKET', timeline: 'FEBRUARY 2026', broadcast_platforms: 'LIVE TWITCH.TV/GEEKAY', published: 1 })}>
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
                  {(() => {
                    const dynStatus = getDynamicStatus(item.start_date, item.end_date, item.time, item.status);
                    return (
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${dynStatus === 'live' ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/30' : dynStatus === 'completed' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {dynStatus === 'completed' ? 'FINISHED' : (dynStatus === 'live' ? '● LIVE' : 'UPCOMING')}
                      </span>
                    );
                  })()}
                </td>
                <td className="p-8 text-right">
                  <div className="flex items-center justify-end gap-3">
                    {item.link && <a href={item.link} target="_blank" className="p-3 bg-white/5 text-slate-400 hover:text-[#FFC400] transition-colors"><ExternalLink size={18} /></a>}
                    <button onClick={() => handleOpenEdit(item)} className="p-3 bg-white/5 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={18} /></button>
                    <button onClick={() => setDeleteTarget({ id: item.id, name: item.title })} className="p-3 bg-white/5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
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
            className="bg-[#081B3A] border border-white/10 w-full max-w-4xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                {editingItem.id ? 'EDIT_EVENT' : 'ADD_EVENT'}
              </h2>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-8 overflow-y-auto flex-grow">
              
              {/* SECTION 1: HERO */}
              <FormSection title="1. HERO" subtitle="Core identification, dates, banner, and organizer info">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Event Name</label>
                    <input 
                      type="text" 
                      value={editingItem.title || ''}
                      onChange={e => setEditingItem({...editingItem, title: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. RLCS 2026 WORLD CHAMPIONSHIP"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Game Title (Type or Select)</label>
                      <span className="font-syncopate text-[7px] text-[#FFC400] font-bold">CUSTOM TITLE SUPPORTED</span>
                    </div>
                    <input 
                      type="text" 
                      list="game-titles-list"
                      value={editingItem.game || ''}
                      onChange={e => setEditingItem({...editingItem, game: e.target.value.toUpperCase()})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="TYPE ANY GAME TITLE (e.g. OVERWATCH 2, RL, CS2)"
                      required
                    />
                    <datalist id="game-titles-list">
                      {dynamicGameTitles.map((g: string) => (
                        <option key={g} value={g} />
                      ))}
                    </datalist>

                    {/* Quick Badge Chips */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {dynamicGameTitles.slice(0, 10).map((g: string) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEditingItem({...editingItem, game: g})}
                          className={`text-[8px] font-syncopate font-bold px-2 py-1 rounded-sm border transition-all ${editingItem.game === g ? 'bg-[#FFC400] text-black border-[#FFC400]' : 'bg-white/5 text-slate-400 border-white/10 hover:text-white'}`}
                        >
                          {g}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Region</label>
                    <input 
                      type="text" 
                      value={editingItem.region || ''}
                      onChange={e => setEditingItem({...editingItem, region: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. GLOBAL / EMEA"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Status</label>
                    <select 
                      value={editingItem.status || 'upcoming'}
                      onChange={e => setEditingItem({...editingItem, status: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                    >
                      <option value="upcoming">UPCOMING</option>
                      <option value="live">LIVE</option>
                      <option value="finished">FINISHED</option>
                    </select>
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

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Start Date</label>
                    <input 
                      type="date" 
                      value={editingItem.start_date || ''}
                      onChange={e => setEditingItem({...editingItem, start_date: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
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
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Location / Venue</label>
                    <input 
                      type="text" 
                      value={editingItem.location || editingItem.venue || ''}
                      onChange={e => setEditingItem({...editingItem, location: e.target.value, venue: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. Copper Box Arena, London"
                    />
                  </div>
                </div>

                <ImageUploader 
                  label="Hero Background Image" 
                  value={editingItem.banner || ''} 
                  onChange={(url) => setEditingItem({ ...editingItem, banner: url })}
                  aspectRatio="banner"
                />
              </FormSection>

              {/* SECTION 2: EVENT OVERVIEW */}
              <FormSection title="2. EVENT OVERVIEW" subtitle="Format, Prize Pool, Broadcast, and Event Intel">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Overview Title</label>
                    <input 
                      type="text" 
                      value={editingItem.overview_title || ''}
                      onChange={e => setEditingItem({...editingItem, overview_title: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. TACTICAL INTELLIGENCE"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Prize Pool</label>
                    <input 
                      type="text" 
                      value={editingItem.prize_pool || ''}
                      onChange={e => setEditingItem({...editingItem, prize_pool: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. $100,000 USD"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Total Teams</label>
                    <input 
                      type="text" 
                      value={editingItem.total_teams || ''}
                      onChange={e => setEditingItem({...editingItem, total_teams: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. 16 TEAMS"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Broadcast</label>
                    <input 
                      type="text" 
                      value={editingItem.broadcast || ''}
                      onChange={e => setEditingItem({...editingItem, broadcast: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. TWITCH / YOUTUBE"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Purpose</label>
                    <input 
                      type="text" 
                      value={editingItem.purpose || ''}
                      onChange={e => setEditingItem({...editingItem, purpose: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. CHAMPIONSHIP QUALIFICATION"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Tournament Format</label>
                  <input 
                    type="text" 
                    value={editingItem.format || ''}
                    onChange={e => setEditingItem({...editingItem, format: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. DOUBLE ELIMINATION BRACKET (BO5/BO7)"
                  />
                </div>

                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Overview Description</label>
                  <textarea 
                    rows={4}
                    value={editingItem.description || ''}
                    onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="Comprehensive description of the event narrative and stakes..."
                  />
                </div>
              </FormSection>

              {/* SECTION 3: EVENT DETAILS */}
              <FormSection title="3. EVENT DETAILS & BROADCAST" subtitle="Timeline, Venue, Platforms, and External Links">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Timeline</label>
                    <input 
                      type="text" 
                      value={editingItem.timeline || ''}
                      onChange={e => setEditingItem({...editingItem, timeline: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. FEB 10 - FEB 15, 2026"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Venue / Location (مكان / مركز الفعالية)</label>
                    <input 
                      type="text" 
                      value={editingItem.venue || editingItem.location || ''}
                      onChange={e => setEditingItem({...editingItem, venue: e.target.value, location: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. EMEA CENTER"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Broadcast Platforms</label>
                    <input 
                      type="text" 
                      value={editingItem.broadcast_platforms || ''}
                      onChange={e => setEditingItem({...editingItem, broadcast_platforms: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. LIVE TWITCH.TV/GEEKAY & YOUTUBE"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Official External Link</label>
                    <input 
                      type="text" 
                      value={editingItem.link || ''}
                      onChange={e => setEditingItem({...editingItem, link: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="https://..."
                    />
                  </div>
                </div>
              </FormSection>

              {/* SECTION 4: PARTICIPATING TEAMS REPEATER */}
              <FormSection title="4. PARTICIPATING TEAMS" subtitle="Manage dynamic roster of competing esports teams">
                <FormRepeater
                  title="Team Roster"
                  items={teamsList}
                  onItemsChange={setTeamsList}
                  createDefaultItem={() => ({ name: '', region: 'Saudi Arabia', logo: '' })}
                  itemTitle={(item) => item.name || 'Unnamed Team'}
                  renderItemFields={(item, idx, onChange) => (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Team Name</label>
                        <input 
                          type="text" 
                          value={item.name || ''} 
                          onChange={e => onChange({ ...item, name: e.target.value })}
                          placeholder="Team Name" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Region / Country</label>
                        <input 
                          type="text" 
                          value={item.region || ''} 
                          onChange={e => onChange({ ...item, region: e.target.value })}
                          placeholder="Region" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2">
                        <ImageUploader
                          label="Team Logo / شعار الفريق"
                          value={item.logo || ''}
                          onChange={url => onChange({ ...item, logo: url })}
                          aspectRatio="square"
                        />
                      </div>
                    </div>
                  )}
                />
              </FormSection>

              {/* SECTION 5: TACTICAL SCHEDULE & MATCHES REPEATER */}
              <FormSection title="5. TACTICAL SCHEDULE & MATCHES" subtitle="Round-by-round fixture timeline">
                <FormRepeater
                  title="Match Fixtures"
                  items={matchesList}
                  onItemsChange={setMatchesList}
                  createDefaultItem={() => ({ date: '2026-02-10', teams: 'Geekay Esports vs Opponent', score: '3 - 2', status: 'completed' })}
                  itemTitle={(item) => item.teams || 'Match Fixture'}
                  renderItemFields={(item, idx, onChange) => (
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Date / Time</label>
                        <input 
                          type="text" 
                          value={item.date || ''} 
                          onChange={e => onChange({ ...item, date: e.target.value })}
                          placeholder="2026-02-10" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Match Title / Teams</label>
                        <input 
                          type="text" 
                          value={item.teams || ''} 
                          onChange={e => onChange({ ...item, teams: e.target.value })}
                          placeholder="Geekay vs Sentinels" 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Score & Status</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            value={item.score || ''} 
                            onChange={e => onChange({ ...item, score: e.target.value })}
                            placeholder="3 - 2" 
                            className="w-1/2 bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                          />
                          <select 
                            value={item.status || 'upcoming'}
                            onChange={e => onChange({ ...item, status: e.target.value })}
                            className="w-1/2 bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                          >
                            <option value="upcoming">UPCOMING</option>
                            <option value="live">LIVE</option>
                            <option value="completed">COMPLETED</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                />
              </FormSection>

              {/* SECTION 6: PODIUM RESULTS */}
              <FormSection title="6. FINALS PODIUM RESULTS" subtitle="Championship winners, runner up, and MVP">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-[#FFC400] font-bold uppercase tracking-widest">1st Place / Winner</label>
                    <input 
                      type="text" 
                      value={podiumResults.winner}
                      onChange={e => setPodiumResults({ ...podiumResults, winner: e.target.value })}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. Geekay Esports"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">2nd Place / Runner Up</label>
                    <input 
                      type="text" 
                      value={podiumResults.runnerUp}
                      onChange={e => setPodiumResults({ ...podiumResults, runnerUp: e.target.value })}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. Vitality"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Tournament MVP</label>
                    <input 
                      type="text" 
                      value={podiumResults.mvp}
                      onChange={e => setPodiumResults({ ...podiumResults, mvp: e.target.value })}
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. TRK511"
                    />
                  </div>
                </div>
              </FormSection>

              {/* SECTION 7: MEDIA FILES REPEATER */}
              <FormSection title="7. MEDIA FILES" subtitle="Photos and highlight clip assets">
                <FormRepeater
                  title="Event Gallery & Highlights"
                  items={mediaList}
                  onItemsChange={setMediaList}
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

              {/* SECTION 8: SOCIAL POSTS REPEATER */}
              <FormSection title="8. SOCIAL POSTS" subtitle="Official press updates and announcements">
                <FormRepeater
                  title="Social Stream Updates"
                  items={socialList}
                  onItemsChange={setSocialList}
                  createDefaultItem={() => ({ platform: 'twitter', handle: '@GeekayEsports', text: '' })}
                  itemTitle={(item) => `${item.platform?.toUpperCase() || 'POST'} - ${item.handle || ''}`}
                  renderItemFields={(item, idx, onChange) => (
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Platform</label>
                          <select 
                            value={item.platform || 'twitter'}
                            onChange={e => onChange({ ...item, platform: e.target.value })}
                            className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] appearance-none"
                          >
                            <option value="twitter">X / TWITTER</option>
                            <option value="instagram">INSTAGRAM</option>
                            <option value="youtube">YOUTUBE</option>
                            <option value="twitch">TWITCH</option>
                          </select>
                        </div>
                        <div className="space-y-2">
                          <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Handle</label>
                          <input 
                            type="text" 
                            value={item.handle || ''} 
                            onChange={e => onChange({ ...item, handle: e.target.value })}
                            placeholder="@GeekayEsports" 
                            className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Post Content</label>
                        <textarea 
                          rows={2}
                          value={item.text || ''} 
                          onChange={e => onChange({ ...item, text: e.target.value })}
                          placeholder="Announcing our tactical roster for the upcoming major..." 
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                        />
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

      {/* Manage Game Titles Modal */}
      <AnimatePresence>
        {isManageTitlesOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#081B3A] border border-white/10 w-full max-w-lg p-6 shadow-2xl relative space-y-6"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[#FFC400] font-syncopate text-[9px] tracking-widest font-bold block uppercase">GAME_TITLES_MANAGER</span>
                  <h2 className="font-syncopate text-xl font-bold text-white uppercase">إدارة عناوين الألعاب</h2>
                </div>
                <button 
                  onClick={() => setIsManageTitlesOpen(false)}
                  className="p-2 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Add New Title Input */}
              <form 
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddGameTitle();
                }}
                className="flex gap-2"
              >
                <input 
                  type="text" 
                  value={newTitleInput}
                  onChange={e => setNewTitleInput(e.target.value.toUpperCase())}
                  placeholder="NEW TITLE (e.g. TEKKEN 8, APEX, RL)"
                  className="flex-1 bg-[#040E1E] border border-slate-700 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
                <ArenaButton type="submit" className="text-xs px-4">
                  + ADD
                </ArenaButton>
              </form>

              {/* Saved Game Titles List */}
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest block mb-2">
                  EXISTING GAME TITLES ({dynamicGameTitles.length})
                </label>
                {dynamicGameTitles.length === 0 ? (
                  <p className="text-slate-500 font-syncopate text-xs py-4 text-center">NO GAME TITLES FOUND</p>
                ) : (
                  <div className="grid grid-cols-1 gap-2">
                    {dynamicGameTitles.map((title) => {
                      const gtObj = gameTitlesList.find(gt => gt.name.toUpperCase() === title.toUpperCase()) || { name: title };
                      return (
                        <div 
                          key={title}
                          className="flex items-center justify-between p-3 bg-[#040E1E] border border-white/5 hover:border-white/20 transition-all"
                        >
                          <span className="bg-[#FFC400] text-black px-2.5 py-1 font-syncopate text-[10px] font-black tracking-widest uppercase">
                            {title}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleDeleteGameTitle(gtObj)}
                            className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded border border-red-500/30 transition-all flex items-center gap-1.5 font-syncopate text-[9px] font-bold"
                            title="Delete Game Title"
                          >
                            <Trash2 size={13} />
                            <span>DELETE (حذف)</span>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div className="pt-2 text-right border-t border-white/10">
                <ArenaButton 
                  variant="outline" 
                  onClick={() => setIsManageTitlesOpen(false)}
                  className="text-xs"
                >
                  DONE
                </ArenaButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="DELETE_EVENT"
        itemName={deleteTarget?.name}
        description="Are you sure you want to delete this event schedule? This action cannot be undone."
      />
    </div>
  );
};

export default AdminSchedule;

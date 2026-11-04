
import React, { useEffect, useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X, Calendar, Filter, Search, ExternalLink, FileSpreadsheet, Upload, CheckCircle2, AlertCircle, Star, Clock, Globe, Swords, Trophy, Medal, Coins } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ImageUploader from '../components/ImageUploader';
import * as XLSX from 'xlsx';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import useConfirmDialog from './utils/useConfirmDialog';

import FormSection from './components/FormSection';
import FormRepeater from './components/FormRepeater';
import { getAuthHeaders } from './utils/api';
import { getDynamicStatus } from '../utils/dateStatus';
import { TIMEZONE_OPTIONS, getDetectedBrowserTimezone, formatMatchDateTimeForVisitor } from '../utils/timezone';

const AdminSchedule = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name?: string } | null>(null);
  const [filterGame, setFilterGame] = useState('ALL');
  const { confirmDialog, requestConfirm, closeConfirm } = useConfirmDialog();

  // Parsed sub-structures for repeater management
  const [teamsList, setTeamsList] = useState<any[]>([]);
  const [matchesList, setMatchesList] = useState<any[]>([]);
  const [podiumResults, setPodiumResults] = useState<{
    placement: string;
    customPlacement: string;
    teamName: string;
    prizeCurrency: string;
    prizeAmount: string;
    prizeMoney: string;
    winner: string;
    runnerUp: string;
    mvp: string;
  }>({
    placement: 'champions',
    customPlacement: '',
    teamName: 'Geekay Esports',
    prizeCurrency: '€',
    prizeAmount: '',
    prizeMoney: '',
    winner: '',
    runnerUp: '',
    mvp: ''
  });
  const [mediaList, setMediaList] = useState<any[]>([]);
  const [socialList, setSocialList] = useState<any[]>([]);
  const [featuredToast, setFeaturedToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const handleFeatureToggle = async (eventId: number | string) => {
    try {
      const res = await fetch(`/api/events/${eventId}/feature`, {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include'
      });
      if (res.ok) {
        const data = await res.json();
        // Optimistic state update
        setItems(prev => prev.map(item => ({
          ...item,
          featured: (eventId !== 'clear' && eventId !== 'none' && data.isFeatured && String(item.id) === String(eventId)) ? 1 : 0
        })));
        setFeaturedToast({
          type: 'success',
          message: data.message || 'Homepage Featured Tournament updated successfully!'
        });
        setTimeout(() => setFeaturedToast(null), 4000);
        fetchItems();
        notifyScheduleUpdated();
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to update featured event');
      }
    } catch (err: any) {
      console.error('Failed to toggle featured tournament:', err);
      setFeaturedToast({
        type: 'error',
        message: err.message || 'Failed to toggle featured event.'
      });
      setTimeout(() => setFeaturedToast(null), 4000);
    }
  };

  // Open modal handler with safe JSON parsing
  const handleOpenEdit = (item: any) => {
    const detectedTz = getDetectedBrowserTimezone();
    const eventTz = item.timezone || detectedTz;
    const defaultTime = item.time || (item.start_date && item.start_date.includes(' ') ? item.start_date.split(' ')[1] : '18:00');

    setEditingItem({
      ...item,
      time: defaultTime,
      timezone: eventTz,
      featured: Number(item.featured) === 1 || item.featured === true ? 1 : 0,
      overview_title: item.overview_title || 'TACTICAL INTELLIGENCE',
      prize_pool: item.prize_pool || item.prizePool || '$100,000',
      total_teams: item.total_teams || '16',
      broadcast: item.broadcast || 'TWITCH / YOUTUBE',
      purpose: item.purpose || 'CHAMPIONSHIP VICTORY',
      format: item.format || 'DOUBLE ELIMINATION BRACKET (BO5/BO7)',
      timeline: item.timeline || '',
      venue: item.venue || item.location || '',
      location: item.location || item.venue || '',
      broadcast_platforms: item.broadcast_platforms || 'LIVE TWITCH.TV/GEEKAY'
    });
    
    // Parse Teams JSON
    try {
      const parsed = typeof item.teams === 'string' ? JSON.parse(item.teams) : item.teams;
      setTeamsList(Array.isArray(parsed) ? parsed : []);
    } catch (e) {
      setTeamsList([]);
    }

    // Parse Matches JSON (with independent dedicated time, timezone, and link support per fixture)
    try {
      const parsed = typeof item.matches === 'string' ? JSON.parse(item.matches) : item.matches;
      setMatchesList(Array.isArray(parsed) ? parsed.map((m: any) => {
        let mDate = m.date || '';
        let mTime = m.time || '';
        if (!mTime && mDate.includes(' ')) {
          const parts = mDate.split(' ');
          mDate = parts[0];
          mTime = parts[1] || '';
        }
        return {
          date: mDate,
          time: mTime || defaultTime || '18:00',
          timezone: m.timezone || eventTz,
          teams: m.teams || '',
          score: m.score || '',
          status: m.status || 'upcoming',
          link: m.link || m.url || ''
        };
      }) : []);
    } catch (e) {
      setMatchesList([]);
    }

    // Parse Final Placement Results JSON
    try {
      const parsed = typeof item.results === 'string' ? JSON.parse(item.results) : item.results;
      let initPlacement = parsed?.placement;
      if (!initPlacement) {
        if (parsed?.winner && parsed.winner.toLowerCase().includes('geekay')) {
          initPlacement = 'champions';
        } else if (parsed?.runnerUp && parsed.runnerUp.toLowerCase().includes('geekay')) {
          initPlacement = 'second';
        } else if (parsed?.winner) {
          initPlacement = 'champions';
        } else {
          initPlacement = 'champions';
        }
      }

      setPodiumResults({
        placement: initPlacement || 'champions',
        customPlacement: parsed?.customPlacement || '',
        teamName: parsed?.teamName || (parsed?.placement === 'second' ? parsed?.runnerUp : parsed?.winner) || 'Geekay Esports',
        prizeCurrency: parsed?.prizeCurrency || '€',
        prizeAmount: parsed?.prizeAmount || (parsed?.prizeMoney ? String(parsed.prizeMoney).replace(/[^\d.,]/g, '') : ''),
        prizeMoney: parsed?.prizeMoney || '',
        winner: parsed?.winner || '',
        runnerUp: parsed?.runnerUp || '',
        mvp: parsed?.mvp || ''
      });
    } catch (e) {
      setPodiumResults({
        placement: 'champions',
        customPlacement: '',
        teamName: 'Geekay Esports',
        prizeCurrency: '€',
        prizeAmount: '',
        prizeMoney: '',
        winner: '',
        runnerUp: '',
        mvp: ''
      });
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

  const executeSave = async () => {
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const payload = {
        ...editingItem,
        overview_title: editingItem.overview_title || 'TACTICAL INTELLIGENCE',
        prize_pool: editingItem.prize_pool || '$100,000',
        total_teams: editingItem.total_teams || '16',
        broadcast: editingItem.broadcast || 'TWITCH / YOUTUBE',
        purpose: editingItem.purpose || 'CHAMPIONSHIP VICTORY',
        format: editingItem.format || 'DOUBLE ELIMINATION BRACKET (BO5/BO7)',
        venue: editingItem.venue || editingItem.location || '',
        location: editingItem.location || editingItem.venue || '',
        broadcast_platforms: editingItem.broadcast_platforms || 'LIVE TWITCH.TV/GEEKAY',
        teams: JSON.stringify(teamsList),
        matches: JSON.stringify(matchesList),
        results: JSON.stringify({
          ...podiumResults,
          prizeMoney: podiumResults.prizeAmount ? `${podiumResults.prizeCurrency || ''}${podiumResults.prizeAmount}`.trim() : (podiumResults.prizeMoney || ''),
          winner: podiumResults.placement === 'champions' ? (podiumResults.teamName || 'Geekay Esports') : (podiumResults.winner || ''),
          runnerUp: podiumResults.placement === 'second' ? (podiumResults.teamName || 'Geekay Esports') : (podiumResults.runnerUp || '')
        }),
        media: JSON.stringify(mediaList),
        social: JSON.stringify(socialList)
      };

      if (!editingItem.id) {
        delete (payload as any).id;
      }

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
      notifyScheduleUpdated();
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

  const notifyScheduleUpdated = () => {
    try {
      window.dispatchEvent(new CustomEvent('geekay:events_updated'));
      localStorage.setItem('geekay_events_updated_at', Date.now().toString());
    } catch {}
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const isCreate = !editingItem?.id;
    const eventName = editingItem?.title || editingItem?.name || 'EVENT SCHEDULE';
    requestConfirm({
      actionType: isCreate ? 'create' : 'edit',
      title: isCreate ? 'CONFIRM EVENT CREATION' : 'CONFIRM EVENT UPDATE',
      itemName: eventName,
      description: isCreate
        ? `Are you sure you want to add the event schedule "${eventName}"?`
        : `Are you sure you want to save changes to event "${eventName}"?`,
      onConfirm: async () => {
        closeConfirm();
        await executeSave();
      }
    });
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id } = deleteTarget;
    setDeleteTarget(null);
    try {
      setItems(prev => prev.filter(item => String(item.id) !== String(id)));
      await fetch(`/api/events/${id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
      fetchItems();
      notifyScheduleUpdated();
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
          notifyScheduleUpdated();
          
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
              GAME TITLES
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

      {/* Featured Tournament Feedback Toast */}
      <AnimatePresence>
        {featuredToast && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 border flex items-center justify-between gap-4 ${
              featuredToast.type === 'success' 
                ? 'bg-[#FFC400]/10 border-[#FFC400]/40 text-[#FFC400]' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            <div className="flex items-center gap-3">
              <Star size={18} className={featuredToast.type === 'success' ? 'fill-[#FFC400]' : ''} />
              <span className="font-syncopate text-[10px] font-bold tracking-widest uppercase">
                {featuredToast.message}
              </span>
            </div>
            <button 
              onClick={() => setFeaturedToast(null)} 
              className="text-slate-400 hover:text-white"
            >
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Featured Tournament Selector Box */}
      {(() => {
        const currentlyFeatured = items.find(i => Number(i.featured) === 1);
        return (
          <div className="bg-[#0A1A31] border border-[#FFC400]/40 p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-[0_0_20px_rgba(255,196,0,0.05)]">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-sm bg-[#FFC400]/10 border border-[#FFC400]/40 flex items-center justify-center text-[#FFC400] shrink-0 mt-0.5">
                <Star size={24} className={currentlyFeatured ? 'fill-[#FFC400]' : 'text-slate-500'} />
              </div>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-syncopate text-xs md:text-sm font-black text-white uppercase tracking-wider">
                    HOMEPAGE FEATURED TOURNAMENT
                  </h3>
                  <span className="text-[8px] bg-[#FFC400] text-black px-2 py-0.5 font-bold uppercase tracking-widest">
                    LIVE SHOWCASE
                  </span>
                </div>
                <p className="text-slate-300 font-inter text-xs">
                  {currentlyFeatured ? (
                    <span>
                      Currently pinned:{' '}
                      <strong className="text-[#FFC400] font-syncopate font-bold">
                        [{currentlyFeatured.game}] {currentlyFeatured.title}
                      </strong>
                    </span>
                  ) : (
                    <span className="text-slate-400 italic">
                      No specific tournament pinned (Automatic mode: displaying the active LIVE or earliest upcoming tournament).
                    </span>
                  )}
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
              <select
                value={currentlyFeatured?.id || 'clear'}
                onChange={(e) => {
                  handleFeatureToggle(e.target.value);
                }}
                className="bg-[#040E1E] border border-[#FFC400]/50 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] min-w-[280px]"
              >
                <option value="clear">-- AUTOMATIC (NEXT UPCOMING / LIVE) --</option>
                {items.map(ev => (
                  <option key={ev.id} value={ev.id}>
                    {ev.game ? `[${ev.game}] ` : ''}{ev.title} {Number(ev.featured) === 1 ? '★ [CURRENT PINNED]' : ''}
                  </option>
                ))}
              </select>

              {currentlyFeatured && (
                <button
                  type="button"
                  onClick={() => handleFeatureToggle('clear')}
                  title="Remove pinned tournament and return to automatic mode"
                  className="px-3 py-3 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 border border-white/10 hover:border-red-500/40 font-syncopate text-[9px] font-bold tracking-widest uppercase transition-all whitespace-nowrap text-center"
                >
                  UNPIN / SET AUTO
                </button>
              )}
            </div>
          </div>
        );
      })()}

      <div className="bg-[#081B3A] border border-white/5 overflow-hidden">
        <table className="w-full text-left font-syncopate text-[10px] tracking-widest uppercase">
          <thead className="text-slate-500 border-b border-white/5">
            <tr>
              <th className="p-8 font-bold">EVENT</th>
              <th className="p-8 font-bold">DATE</th>
              <th className="p-8 font-bold">STATUS</th>
              <th className="p-8 font-bold text-center">HOMEPAGE</th>
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
                    const dynStatus = getDynamicStatus(item.start_date, item.end_date, item.time, item.status, item.matches);
                    return (
                      <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase ${dynStatus === 'live' ? 'bg-red-500/10 text-red-500 animate-pulse border border-red-500/30' : dynStatus === 'completed' ? 'bg-slate-500/10 text-slate-400 border border-slate-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {dynStatus === 'completed' ? 'FINISHED' : (dynStatus === 'live' ? '● LIVE' : 'UPCOMING')}
                      </span>
                    );
                  })()}
                </td>
                <td className="p-8 text-center">
                  {Number(item.featured) === 1 ? (
                    <button
                      type="button"
                      onClick={() => handleFeatureToggle(item.id)}
                      title="Currently featured on Homepage - click to toggle"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FFC400] text-black font-syncopate text-[8px] font-black tracking-widest uppercase hover:bg-yellow-400 transition-all shadow-[0_0_10px_rgba(255,196,0,0.4)]"
                    >
                      <Star size={11} className="fill-black" />
                      <span>FEATURED</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleFeatureToggle(item.id)}
                      title="Set as featured tournament on Homepage"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-[#FFC400]/20 text-slate-400 hover:text-[#FFC400] border border-white/10 hover:border-[#FFC400]/40 font-syncopate text-[8px] font-bold tracking-widest uppercase transition-all"
                    >
                      <Star size={11} />
                      <span>SET FEATURED</span>
                    </button>
                  )}
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
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
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

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={11} className="text-[#FFC400]" />
                      <span>Start Date</span>
                    </label>
                    <input 
                      type="date" 
                      value={editingItem.start_date || ''}
                      onChange={e => setEditingItem({...editingItem, start_date: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar size={11} className="text-slate-400" />
                      <span>End Date</span>
                    </label>
                    <input 
                      type="date" 
                      value={editingItem.end_date || ''}
                      onChange={e => setEditingItem({...editingItem, end_date: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-[#FFC400] font-black uppercase tracking-widest flex items-center gap-1.5">
                      <Clock size={11} className="text-[#FFC400]" />
                      <span>Event Start Time</span>
                    </label>
                    <input 
                      type="time" 
                      value={editingItem.time || '18:00'}
                      onChange={e => setEditingItem({...editingItem, time: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Location / Venue</label>
                    <input 
                      type="text" 
                      value={editingItem.location || editingItem.venue || ''}
                      onChange={e => setEditingItem({...editingItem, location: e.target.value, venue: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="e.g. Copper Box Arena, London"
                    />
                  </div>
                </div>

                {/* Admin Timezone Configuration & Automatic Local Time Conversion */}
                <div className="p-4 bg-[#040E1E] border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <Globe size={18} className="text-[#FFC400] shrink-0" />
                    <div>
                      <span className="font-syncopate text-[9px] font-black text-white uppercase tracking-wider block">
                        Admin Entry Timezone
                      </span>
                      <span className="font-inter text-[11px] text-slate-400">
                        Enter dates & times in your timezone. Visitors will automatically see them in their local timezone.
                      </span>
                    </div>
                  </div>
                  <select
                    value={editingItem.timezone || getDetectedBrowserTimezone()}
                    onChange={e => setEditingItem({ ...editingItem, timezone: e.target.value })}
                    className="bg-[#081B3A] border border-slate-700 text-white font-syncopate text-xs p-2.5 focus:border-[#FFC400] focus:outline-none"
                  >
                    {TIMEZONE_OPTIONS.map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-3 p-4 bg-[#040E1E] border border-slate-800 hover:border-[#FFC400]/40 transition-colors cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={Boolean(Number(editingItem.featured) === 1 || editingItem.featured === true || editingItem.featured === '1')}
                      onChange={e => setEditingItem({ ...editingItem, featured: e.target.checked ? 1 : 0 })}
                      className="w-4 h-4 text-[#FFC400] bg-slate-900 border-slate-700 rounded focus:ring-[#FFC400] accent-[#FFC400]"
                    />
                    <div>
                      <span className="font-syncopate text-[9px] font-bold text-white uppercase tracking-wider flex items-center gap-2">
                        <Star size={12} className={editingItem.featured ? 'text-[#FFC400] fill-[#FFC400]' : 'text-slate-500'} />
                        FEATURED TOURNAMENT ON HOMEPAGE
                      </span>
                      <span className="font-inter text-[10px] text-slate-400">
                        Display this tournament prominently in the Featured Tournament showcase on the homepage.
                      </span>
                    </div>
                  </label>
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
                    <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Venue / Location</label>
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
                          label="Team Logo"
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
                  createDefaultItem={() => ({ 
                    date: editingItem?.start_date || new Date().toISOString().split('T')[0], 
                    time: editingItem?.time || '18:00',
                    timezone: editingItem?.timezone || getDetectedBrowserTimezone(),
                    teams: 'Geekay Esports vs Opponent', 
                    score: '', 
                    status: 'upcoming', 
                    link: '' 
                  })}
                  itemTitle={(item) => item.teams || 'Match Fixture'}
                  renderItemFields={(item, idx, onChange) => {
                    const localPreview = formatMatchDateTimeForVisitor(item.date, item.time, item.timezone || editingItem?.timezone);
                    return (
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 sm:gap-4">
                          {/* Match Date */}
                          <div className="space-y-1.5 lg:col-span-3">
                            <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                              <Calendar size={11} className="text-[#FFC400]" />
                              <span>Match Date</span>
                            </label>
                            <input 
                              type="date" 
                              value={item.date || ''} 
                              onChange={e => onChange({ ...item, date: e.target.value })}
                              className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                            />
                          </div>

                          {/* Dedicated Match Time Input */}
                          <div className="space-y-1.5 lg:col-span-3">
                            <label className="font-syncopate text-[8px] text-[#FFC400] font-black uppercase tracking-widest flex items-center gap-1.5">
                              <Clock size={11} className="text-[#FFC400]" />
                              <span>Match Time</span>
                            </label>
                            <input 
                              type="time" 
                              value={item.time || '18:00'} 
                              onChange={e => onChange({ ...item, time: e.target.value })}
                              className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                            />
                          </div>

                          {/* Match Title / Teams */}
                          <div className="space-y-1.5 lg:col-span-3">
                            <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest flex items-center gap-1.5">
                              <Swords size={11} className="text-[#FFC400]" />
                              <span>Match Title / Teams</span>
                            </label>
                            <input 
                              type="text" 
                              value={item.teams || ''} 
                              onChange={e => onChange({ ...item, teams: e.target.value })}
                              placeholder="Geekay vs Sentinels" 
                              className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                            />
                          </div>

                          {/* Score & Status */}
                          <div className="space-y-1.5 lg:col-span-3">
                            <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Score & Status</label>
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

                        {/* Automatic Timezone Display Helper */}
                        <div className="flex flex-wrap items-center justify-between text-[9px] text-slate-400 bg-[#020A16] px-3 py-1.5 border border-slate-800/80 font-mono">
                          <span className="flex items-center gap-1.5">
                            <Globe size={11} className="text-[#FFC400]" />
                            <span>Input Timezone: <strong className="text-white">{item.timezone || editingItem?.timezone || 'Admin Timezone'}</strong></span>
                          </span>
                          <span className="text-emerald-400 font-bold">
                            Visitor Local Preview: {localPreview.formattedDate} @ {localPreview.formattedTime} ({localPreview.timezoneLabel})
                          </span>
                        </div>

                      {/* Individual Match Link */}
                      <div className="pt-2 border-t border-slate-800/60">
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="font-syncopate text-[8px] text-[#FFC400] font-bold uppercase tracking-widest flex items-center gap-1.5">
                            <ExternalLink size={10} />
                            <span>Match Stream URL / Dedicated Link</span>
                          </label>
                          {item.link && (
                            <button 
                              type="button" 
                              onClick={() => onChange({ ...item, link: '' })}
                              className="text-[7px] text-red-400 hover:text-red-300 font-syncopate uppercase tracking-widest transition-colors"
                            >
                              ✕ REMOVE LINK
                            </button>
                          )}
                        </div>
                        <div className="flex gap-2">
                          <input 
                            type="url" 
                            value={item.link || ''} 
                            onChange={e => onChange({ ...item, link: e.target.value })}
                            placeholder="e.g. https://www.twitch.tv/rainbow6 or https://youtube.com/watch?v=..." 
                            className="w-full bg-[#040E1E] border border-slate-800 p-2.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] transition-colors"
                          />
                          {item.link && (
                            <a 
                              href={item.link} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="px-3 bg-white/5 border border-slate-800 hover:border-[#FFC400]/40 text-[#FFC400] hover:bg-[#FFC400]/10 flex items-center justify-center transition-colors shrink-0 text-xs rounded"
                              title="Test Link in New Tab"
                            >
                              <ExternalLink size={14} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                }}
                />
              </FormSection>

              {/* SECTION 6: FINAL PLACEMENT */}
              <FormSection title="6. FINAL PLACEMENT" subtitle="Tournament placement and prize money earned">
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-4 sm:gap-6">
                    {/* 1. Placement Dropdown */}
                    <div className="space-y-2 lg:col-span-4">
                      <label className="font-syncopate text-[8px] text-[#FFC400] font-black uppercase tracking-widest flex items-center gap-1.5">
                        <Trophy size={11} className="text-[#FFC400]" />
                        <span>Placement</span>
                      </label>
                      <select
                        value={podiumResults.placement || 'champions'}
                        onChange={e => setPodiumResults({ ...podiumResults, placement: e.target.value })}
                        className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      >
                        <option value="champions">🏆 Champions (Trophy Icon)</option>
                        <option value="second">🥈 Second place (Silver Medal)</option>
                        <option value="third">🥉 Third place (Bronze Medal)</option>
                        <option value="custom">✍️ Custom (4th place, Top 8, Top 12... - No Icon)</option>
                      </select>
                    </div>

                    {/* Custom Placement Text Field */}
                    {podiumResults.placement === 'custom' ? (
                      <div className="space-y-2 lg:col-span-4">
                        <label className="font-syncopate text-[8px] text-[#FFC400] font-bold uppercase tracking-widest">
                          Custom Place Text
                        </label>
                        <input
                          type="text"
                          value={podiumResults.customPlacement || ''}
                          onChange={e => setPodiumResults({ ...podiumResults, customPlacement: e.target.value })}
                          placeholder="e.g. 4th Place, Top 8, Top 12..."
                          className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                    ) : (
                      <div className="space-y-2 lg:col-span-4">
                        <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                          Team Name
                        </label>
                        <input
                          type="text"
                          value={podiumResults.teamName || 'Geekay Esports'}
                          onChange={e => setPodiumResults({ ...podiumResults, teamName: e.target.value })}
                          placeholder="e.g. Geekay Esports"
                          className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                    )}

                    {/* Team Name if Custom */}
                    {podiumResults.placement === 'custom' && (
                      <div className="space-y-2 lg:col-span-4">
                        <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                          Team Name
                        </label>
                        <input
                          type="text"
                          value={podiumResults.teamName || 'Geekay Esports'}
                          onChange={e => setPodiumResults({ ...podiumResults, teamName: e.target.value })}
                          placeholder="e.g. Geekay Esports"
                          className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>
                    )}
                  </div>

                  {/* 2. Prize Money Earned */}
                  <div className="p-4 sm:p-5 bg-[#040E1E] border border-slate-800/80">
                    <span className="font-syncopate text-[8px] text-[#FFC400] font-black uppercase tracking-widest block mb-3 flex items-center gap-1.5">
                      <Coins size={12} className="text-[#FFC400]" />
                      <span>Prize Money Earned</span>
                    </span>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 sm:gap-4 items-center">
                      {/* Currency Input / Selection */}
                      <div className="sm:col-span-4 space-y-1.5">
                        <label className="font-syncopate text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                          Currency
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={['€', '$', '£', 'SAR', 'AED', 'USD'].includes(podiumResults.prizeCurrency || '') ? podiumResults.prizeCurrency : 'custom'}
                            onChange={e => {
                              if (e.target.value !== 'custom') {
                                setPodiumResults({ ...podiumResults, prizeCurrency: e.target.value });
                              }
                            }}
                            className="bg-[#081B3A] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] shrink-0"
                          >
                            <option value="€">€ (EUR)</option>
                            <option value="$">$ (USD)</option>
                            <option value="SAR">SAR</option>
                            <option value="AED">AED</option>
                            <option value="£">£ (GBP)</option>
                            <option value="custom">Other</option>
                          </select>
                          <input
                            type="text"
                            value={podiumResults.prizeCurrency || ''}
                            onChange={e => setPodiumResults({ ...podiumResults, prizeCurrency: e.target.value })}
                            placeholder="e.g. € or USD"
                            className="w-full bg-[#081B3A] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                          />
                        </div>
                      </div>

                      {/* Prize Amount */}
                      <div className="sm:col-span-5 space-y-1.5">
                        <label className="font-syncopate text-[7px] text-slate-400 font-bold uppercase tracking-wider">
                          Amount Earned
                        </label>
                        <input
                          type="text"
                          value={podiumResults.prizeAmount || ''}
                          onChange={e => setPodiumResults({ ...podiumResults, prizeAmount: e.target.value })}
                          placeholder="e.g. 15,000 or 50,000"
                          className="w-full bg-[#081B3A] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>

                      {/* Live Preview Display */}
                      <div className="sm:col-span-3 bg-[#020A16] border border-slate-800 p-3 text-center">
                        <span className="font-syncopate text-[7px] text-slate-500 uppercase block mb-1">Prize Display</span>
                        <span className="font-syncopate text-sm font-black text-[#FFC400] block truncate">
                          {podiumResults.prizeAmount ? `${podiumResults.prizeCurrency || ''}${podiumResults.prizeAmount}` : 'No prize entered'}
                        </span>
                      </div>
                    </div>
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
                            label="Photo File"
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
                  <h2 className="font-syncopate text-xl font-bold text-white uppercase">MANAGE GAME TITLES</h2>
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
                            <span>DELETE</span>
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
        title="DELETE EVENT"
        itemName={deleteTarget?.name}
        actionType="delete"
        description="Are you sure you want to permanently delete this event schedule? This action cannot be undone."
      />

      {confirmDialog && (
        <ConfirmDeleteModal
          isOpen={confirmDialog.isOpen}
          onClose={closeConfirm}
          onConfirm={confirmDialog.onConfirm}
          actionType={confirmDialog.actionType}
          title={confirmDialog.title}
          itemName={confirmDialog.itemName}
          description={confirmDialog.description}
          loading={saving}
        />
      )}
    </div>
  );
};

export default AdminSchedule;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Image as ImageIcon, 
  Video, 
  Search, 
  Eye, 
  EyeOff, 
  CheckCircle, 
  Archive, 
  Globe, 
  Youtube, 
  Twitch, 
  Instagram, 
  Twitter, 
  Share2, 
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ImageUploader from '../components/ImageUploader';
import { safeJsonParse } from '../utils/json';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ToastNotification } from './components/Toast';
import { getAuthHeaders, handleAuthError } from './utils/api';

const AdminCreators = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name?: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'socials'>('basic');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlatform, setFilterPlatform] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const platformsList = ['ALL', 'YouTube', 'Twitch', 'TikTok', 'Instagram', 'Twitter / X', 'Kick'];

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/creators');
      if (res.ok) {
        const data = await res.json();
        const parsed = data.map((item: any) => ({
          ...item,
          socials: typeof item.socials === 'string' ? safeJsonParse(item.socials, {}) : (item.socials || {}),
          languages: typeof item.languages === 'string' ? safeJsonParse(item.languages, []) : (item.languages || []),
          platforms: typeof item.platforms === 'string' ? safeJsonParse(item.platforms, []) : (item.platforms || []),
          associated_games: typeof item.associated_games === 'string' ? safeJsonParse(item.associated_games, []) : (item.associated_games || []),
          gallery_images: typeof item.gallery_images === 'string' ? safeJsonParse(item.gallery_images, []) : (item.gallery_images || [])
        }));
        setItems(parsed);
      }
    } catch (err) {
      console.error('Failed to fetch creators:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleOpenNew = () => {
    setEditingItem({
      name: '',
      alias: '',
      username: '',
      photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500&h=600',
      cover_image: '',
      short_bio: '',
      bio: '',
      country: 'Saudi Arabia',
      nationality: 'Saudi',
      languages: ['Arabic', 'English'],
      primary_platform: 'Twitch',
      category: 'Gaming',
      role: 'Content Creator',
      joined_date: new Date().toISOString().split('T')[0],
      featured: 0,
      verified: 1,
      status: 'active',
      published: 1,
      display_order: items.length + 1,
      followers: '500K FOLLOWERS',
      total_reach: '1.4M+',
      focus: 'ROCKET LEAGUE LIVE STREAMS',
      socials: {
        youtube: 'https://youtube.com',
        twitch: 'https://twitch.tv',
        twitter: 'https://x.com',
        tiktok: '',
        instagram: '',
        kick: ''
      },
      gallery_images: [],
      intro_video: '',
      seo_title: '',
      meta_description: '',
      seo_slug: ''
    });
    setActiveTab('basic');
  };

  const handleOpenEdit = (item: any) => {
    const parsedSocials = typeof item.socials === 'object' && item.socials ? item.socials : safeJsonParse(item.socials, {});
    const parsedMetrics = typeof item.metrics === 'object' && item.metrics ? item.metrics : safeJsonParse(item.metrics, {});

    setEditingItem({
      ...item,
      alias: item.alias || item.name || '',
      followers: item.followers || parsedMetrics.followers || '500K FOLLOWERS',
      total_reach: item.total_reach || parsedMetrics.totalReach || parsedMetrics.total_reach || '1.4M+',
      focus: item.focus || 'GAMING',
      socials: parsedSocials,
      display_order: item.display_order ?? 1,
      published: item.published ?? 1,
      languages: Array.isArray(item.languages) ? item.languages : safeJsonParse(item.languages, []),
      gallery_images: Array.isArray(item.gallery_images) ? item.gallery_images : safeJsonParse(item.gallery_images, [])
    });
    setActiveTab('basic');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.alias && !editingItem.name) {
      alert('Creator Alias / Stage Name is required');
      return;
    }

    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const method = editingItem.id ? 'PUT' : 'POST';
      const url = editingItem.id ? `/api/creators/${editingItem.id}` : '/api/creators';
      
      const socialsObj = typeof editingItem.socials === 'object' && editingItem.socials ? editingItem.socials : safeJsonParse(editingItem.socials, {});
      
      // Auto-generate platforms JSON array for DB
      const platformsArray = Object.entries(socialsObj)
        .filter(([_, u]) => u && String(u).trim() !== '')
        .map(([key, u]) => ({
          type: key,
          platform: key,
          url: String(u),
          handle: key
        }));

      // Auto-generate metrics JSON object for DB
      const metricsObj = {
        followers: editingItem.followers || '500K FOLLOWERS',
        totalReach: editingItem.total_reach || '1.4M+'
      };

      const creatorAlias = editingItem.alias || editingItem.name || 'CREATOR';

      const payload = {
        ...editingItem,
        alias: creatorAlias,
        name: editingItem.name || creatorAlias,
        photo: editingItem.photo,
        total_reach: editingItem.total_reach || '1.4M+',
        focus: editingItem.focus || 'GAMING',
        display_order: Number(editingItem.display_order || 1),
        published: editingItem.published ? 1 : 0,
        seo_slug: editingItem.seo_slug || creatorAlias.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-'),
        languages: typeof editingItem.languages === 'string' ? editingItem.languages : JSON.stringify(editingItem.languages || []),
        socials: JSON.stringify(socialsObj),
        platforms: JSON.stringify(platformsArray),
        metrics: JSON.stringify(metricsObj),
        gallery_images: typeof editingItem.gallery_images === 'string' ? editingItem.gallery_images : JSON.stringify(editingItem.gallery_images || [])
      };

      const res = await fetch(url, {
        method,
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(payload),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        if (res.status === 401) {
          handleAuthError(res);
          throw new Error('انتهت صلاحية الجلسة، يرجى إعادة تسجيل الدخول / Session expired. Please log in again.');
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save creator');
      }
      
      setEditingItem(null);
      setToastMsg('تم حفظ وتحديث بيانات صانع المحتوى بنجاح! / Creator saved successfully!');
      fetchItems();
    } catch (err: any) {
      console.error('Save creator error:', err);
      if (err.name === 'AbortError') {
        alert('Request timed out. Please try again.');
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
      setItems((prev: any[]) => prev.filter((item: any) => String(item.id) !== String(id)));
      await fetch(`/api/creators/${id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
      fetchItems();
    } catch (err) {
      fetchItems();
    }
  };

  const handleToggleStatus = async (item: any, newStatus: string) => {
    try {
      await fetch(`/api/creators/${item.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ ...item, status: newStatus })
      });
      fetchItems();
    } catch (err) {
      console.error('Status update failed:', err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.alias || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.username || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.country || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesPlatform = filterPlatform === 'ALL' || item.primary_platform === filterPlatform;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;

    return matchesSearch && matchesPlatform && matchesStatus;
  });

  if (loading) return <div className="p-8 font-syncopate text-[#FFC400] text-xs font-bold">LOADING_CREATORS...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-2 block uppercase">TALENT_ROSTER</span>
          <h1 className="font-syncopate text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            CONTENT <span className="text-[#FFC400]">CREATORS</span>
          </h1>
          <p className="text-slate-400 font-inter text-xs mt-1">
            Manage global gaming creators, ambassadors, social channels, media assets & SEO metadata.
          </p>
        </div>
        <ArenaButton onClick={handleOpenNew}>
          <Plus size={18} className="mr-2" /> ADD_CREATOR
        </ArenaButton>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-[#081B3A] border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
          <input 
            type="text" 
            placeholder="Search creator, username, country..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#040E1E] border border-slate-800 pl-11 pr-4 py-2.5 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-syncopate text-[9px] font-bold uppercase">Platform:</span>
            <select 
              value={filterPlatform}
              onChange={e => setFilterPlatform(e.target.value)}
              className="bg-[#040E1E] border border-slate-800 text-white font-syncopate text-[10px] font-bold px-3 py-2 focus:outline-none focus:border-[#FFC400]"
            >
              {platformsList.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-syncopate text-[9px] font-bold uppercase">Status:</span>
            <select 
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-[#040E1E] border border-slate-800 text-white font-syncopate text-[10px] font-bold px-3 py-2 focus:outline-none focus:border-[#FFC400]"
            >
              <option value="ALL">ALL STATUS</option>
              <option value="active">ACTIVE</option>
              <option value="inactive">INACTIVE</option>
              <option value="archived">ARCHIVED</option>
            </select>
          </div>
        </div>
      </div>

      {/* Creators Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredItems.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/5 p-6 group relative overflow-hidden flex flex-col justify-between"
          >
            <div className="absolute top-0 left-0 w-1 h-0 bg-[#FFC400] group-hover:h-full transition-all duration-500" />
            
            <div>
              <div className="relative aspect-square bg-[#040E1E] border border-white/5 mb-4 flex items-center justify-center overflow-hidden group">
                {item.photo ? (
                  <img src={item.photo} alt={item.alias} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                ) : (
                  <Video className="text-slate-700" size={40} />
                )}
                {item.featured === 1 && (
                  <span className="absolute top-3 left-3 bg-[#FFC400] text-black font-syncopate text-[8px] font-black px-2 py-0.5 tracking-widest flex items-center gap-1">
                    <Sparkles size={10} /> FEATURED
                  </span>
                )}
                <span className={`absolute top-3 right-3 text-[8px] font-syncopate font-black px-2 py-0.5 uppercase ${
                  item.status === 'active' ? 'bg-emerald-500 text-black' :
                  item.status === 'inactive' ? 'bg-amber-500 text-black' : 'bg-slate-700 text-slate-300'
                }`}>
                  {item.status}
                </span>
              </div>

              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-1.5">
                  <h3 className="font-syncopate text-lg font-black text-white uppercase tracking-tighter">{item.alias}</h3>
                  {item.verified === 1 && <CheckCircle size={14} className="text-[#FFC400] fill-current" />}
                </div>
                {item.name && <p className="text-slate-400 font-mono text-xs mt-0.5">{item.name}</p>}
                {item.username && <p className="text-slate-500 font-mono text-[11px]">@{item.username}</p>}
                
                <div className="flex items-center justify-center gap-2 mt-2">
                  <span className="bg-[#FFC400]/10 text-[#FFC400] border border-[#FFC400]/20 font-syncopate text-[8px] font-bold px-2 py-0.5 uppercase">
                    {item.primary_platform || 'YouTube'}
                  </span>
                  {item.category && (
                    <span className="bg-slate-800 text-slate-300 font-syncopate text-[8px] font-bold px-2 py-0.5 uppercase">
                      {item.category}
                    </span>
                  )}
                </div>

                {item.total_reach && (
                  <span className="inline-block mt-3 bg-slate-900 border border-slate-800 text-slate-300 font-mono text-[10px] px-3 py-1">
                    Reach: {item.total_reach}
                  </span>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-white/5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <button 
                    onClick={() => handleToggleStatus(item, item.status === 'active' ? 'inactive' : 'active')}
                    className={`text-[9px] font-syncopate font-bold px-2 py-1 transition-colors ${
                      item.status === 'active' ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20' : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                    }`}
                  >
                    {item.status === 'active' ? 'DEACTIVATE' : 'ACTIVATE'}
                  </button>
                  <button 
                    onClick={() => handleToggleStatus(item, item.status === 'archived' ? 'active' : 'archived')}
                    className="p-1.5 bg-white/5 text-slate-400 hover:text-amber-400 transition-colors"
                    title="Archive Creator"
                  >
                    <Archive size={14} />
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button onClick={() => handleOpenEdit(item)} className="p-2 bg-white/5 text-slate-400 hover:text-[#FFC400] transition-colors">
                    <Edit2 size={16} />
                  </button>
                  <button onClick={() => setDeleteTarget({ id: item.id, name: item.alias || item.name })} className="p-2 bg-white/5 text-slate-400 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-16 bg-[#081B3A] border border-white/5 text-slate-500 font-syncopate text-xs uppercase">
          No creators found matching criteria.
        </div>
      )}

      {/* Full Creator Modal with Live Preview */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setEditingItem(null)} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-5xl relative z-10 my-8 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[#FFC400] font-syncopate text-[9px] font-bold tracking-widest block uppercase">CREATOR_PROFILE_EDITOR</span>
                <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                  {editingItem.id ? `EDIT CREATOR — ${editingItem.alias}` : 'CREATE NEW CREATOR'}
                </h2>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>

            {/* Modal Navigation Tabs */}
            <div className="flex border-b border-white/5 bg-[#040E1E] px-6">
              {[
                { id: 'basic', label: 'CARD & BASIC INFO' },
                { id: 'socials', label: 'SOCIAL CHANNELS' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-4 py-3 font-syncopate text-[10px] font-bold tracking-widest uppercase border-b-2 transition-all ${
                    activeTab === tab.id ? 'border-[#FFC400] text-[#FFC400] bg-white/5' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form Content + Live Preview Grid */}
            <form onSubmit={handleSave} className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 max-h-[75vh] overflow-y-auto">
              
              {/* Form Inputs (Left Column) */}
              <div className="lg:col-span-7 space-y-6">
                {activeTab === 'basic' && (
                  <div className="space-y-6">
                    {/* Primary Display Fields */}
                    <div className="bg-[#040E1E] p-4 border border-[#FFC400]/20 space-y-4">
                      <span className="text-[#FFC400] font-syncopate text-[9px] font-bold tracking-widest block uppercase">
                        ⚡ CARD DISPLAY FIELDS (AS SHOWN ON WEBSITE)
                      </span>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Creator Alias / Stage Name *
                          </label>
                          <input 
                            type="text" 
                            value={editingItem.alias || ''}
                            onChange={e => setEditingItem({...editingItem, alias: e.target.value})}
                            placeholder="e.g. M7SN"
                            className="w-full bg-[#081B3A] border border-slate-700 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                            required
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Followers Count Subtitle
                          </label>
                          <input 
                            type="text" 
                            value={editingItem.followers || ''}
                            onChange={e => setEditingItem({...editingItem, followers: e.target.value})}
                            placeholder="e.g. 500K FOLLOWERS"
                            className="w-full bg-[#081B3A] border border-slate-700 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <label className="font-syncopate text-[9px] text-[#FFC400] font-bold uppercase tracking-widest">
                            Highlighted Metric (Gold Font)
                          </label>
                          <input 
                            type="text" 
                            value={editingItem.total_reach || ''}
                            onChange={e => setEditingItem({...editingItem, total_reach: e.target.value})}
                            placeholder="e.g. 1.4M+"
                            className="w-full bg-[#081B3A] border border-slate-700 p-3 text-[#FFC400] font-syncopate font-bold text-xs focus:outline-none focus:border-[#FFC400]"
                          />
                        </div>

                        <div className="space-y-2">
                          <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Focus / Stream Description
                          </label>
                          <input 
                            type="text" 
                            value={editingItem.focus || ''}
                            onChange={e => setEditingItem({...editingItem, focus: e.target.value})}
                            placeholder="e.g. ROCKET LEAGUE LIVE STREAMS"
                            className="w-full bg-[#081B3A] border border-slate-700 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                          />
                        </div>
                      </div>

                      {/* Photo Image Uploader */}
                      <div className="space-y-3 pt-2 border-t border-slate-800">
                        <ImageUploader 
                          label="Creator Profile Photo File" 
                          value={editingItem.photo || ''} 
                          onChange={(url) => setEditingItem({ ...editingItem, photo: url })}
                          aspectRatio="square"
                        />

                        <div className="space-y-2">
                          <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Photo Direct Image URL
                          </label>
                          <input 
                            type="text" 
                            value={editingItem.photo || ''}
                            onChange={e => setEditingItem({...editingItem, photo: e.target.value})}
                            placeholder="https://images.unsplash.com/photo-..."
                            className="w-full bg-[#081B3A] border border-slate-700 p-3 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Display Priority & Settings */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Display Order Priority</label>
                        <input 
                          type="number" 
                          value={editingItem.display_order ?? 1}
                          onChange={e => setEditingItem({...editingItem, display_order: parseInt(e.target.value) || 1})}
                          className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                        />
                      </div>

                      <div className="flex items-center gap-6 p-3 bg-[#040E1E] border border-white/5 h-full">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={editingItem.published === 1}
                            onChange={e => setEditingItem({...editingItem, published: e.target.checked ? 1 : 0})}
                            className="w-4 h-4 bg-slate-900 border-slate-700 checked:bg-[#FFC400]"
                          />
                          <span className="font-syncopate text-[10px] font-bold text-white uppercase">Published (Show on Website)</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'socials' && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[
                        { key: 'twitch', label: 'Twitch Channel URL', icon: <Twitch size={16} className="text-purple-400" /> },
                        { key: 'youtube', label: 'YouTube Profile URL', icon: <Youtube size={16} className="text-red-500" /> },
                        { key: 'twitter', label: 'Twitter / X Handle or URL', icon: <Twitter size={16} className="text-sky-400" /> },
                        { key: 'tiktok', label: 'TikTok Profile URL', icon: <Share2 size={16} className="text-cyan-400" /> },
                        { key: 'instagram', label: 'Instagram Profile URL', icon: <Instagram size={16} className="text-pink-500" /> },
                        { key: 'kick', label: 'Kick Channel URL', icon: <Globe size={16} className="text-emerald-400" /> }
                      ].map(social => (
                        <div key={social.key} className="space-y-1.5 bg-[#040E1E] p-3 border border-white/5">
                          <div className="flex items-center gap-2">
                            {social.icon}
                            <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase">{social.label}</label>
                          </div>
                          <input 
                            type="text" 
                            value={editingItem.socials?.[social.key] || ''}
                            onChange={e => setEditingItem({
                              ...editingItem,
                              socials: { ...(editingItem.socials || {}), [social.key]: e.target.value }
                            })}
                            placeholder={`https://...`}
                            className="w-full bg-slate-900 border border-slate-800 p-2.5 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Live Preview Card (Right Column) */}
              <div className="lg:col-span-5 flex flex-col items-center">
                <div className="w-full mb-3 flex items-center justify-between">
                  <span className="font-syncopate text-[9px] text-[#FFC400] font-bold tracking-widest uppercase">
                    LIVE CARD PREVIEW
                  </span>
                  <span className="font-syncopate text-[9px] text-slate-500 font-bold uppercase">
                    WEBSITE RENDERING
                  </span>
                </div>

                <div className="w-full max-w-[280px] aspect-[2/3] bg-[#040E1E] border border-slate-800 overflow-hidden relative shadow-2xl">
                  {/* Top Left Target Reticle */}
                  <div className="absolute top-4 left-4 z-30 pointer-events-none">
                    <svg width="26" height="26" viewBox="0 0 28 28" fill="none" className="text-[#FFC400]">
                      <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="14" y1="0" x2="14" y2="28" stroke="currentColor" strokeWidth="1.2" />
                      <line x1="0" y1="14" x2="28" y2="14" stroke="currentColor" strokeWidth="1.2" />
                    </svg>
                  </div>

                  <img
                    src={editingItem.photo || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500&h=600'}
                    alt={editingItem.alias || 'CREATOR'}
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-[#040E1E] via-[#040E1E]/50 to-transparent opacity-90" />
                  
                  <div className="absolute bottom-0 left-0 right-0 p-6 z-20">
                    <h3 className="font-syncopate text-2xl font-black text-white uppercase mb-1 tracking-tighter">
                      {editingItem.alias || 'ALIAS'}
                    </h3>
                    <p className="text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-4">
                      {editingItem.followers || '500K FOLLOWERS'}
                    </p>
                    
                    {/* Socials */}
                    <div className="flex gap-3 mb-4">
                      {Object.entries(editingItem.socials || {})
                        .filter(([_, url]) => url && String(url).trim() !== '')
                        .slice(0, 4)
                        .map(([type], i) => (
                          <div key={i} className="text-slate-400 text-xs font-bold uppercase border border-slate-700 px-1.5 py-0.5 rounded">
                            {type}
                          </div>
                        ))}
                    </div>

                    <div className="pt-3 border-t border-white/20 space-y-1">
                      <p className="text-[#FFC400] font-syncopate text-xl font-black uppercase tracking-tight">
                        {editingItem.total_reach || '1.4M+'}
                      </p>
                      <p className="text-white font-syncopate text-[10px] font-extrabold uppercase leading-snug tracking-wider">
                        {editingItem.focus || 'ROCKET LEAGUE LIVE STREAMS'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="lg:col-span-12 pt-6 border-t border-white/5 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="px-6 py-3 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <ArenaButton type="submit" disabled={saving}>
                  <Save size={16} className="mr-2" />
                  {saving ? 'SAVING...' : 'SAVE_CREATOR'}
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
        title="DELETE_CREATOR"
        itemName={deleteTarget?.name}
        description="Are you sure you want to delete this content creator? This action cannot be undone."
      />
    </div>
  );
};

export default AdminCreators;

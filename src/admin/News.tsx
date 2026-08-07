import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Save, 
  X, 
  Image as ImageIcon, 
  Search, 
  Eye, 
  EyeOff, 
  FileText, 
  Sparkles, 
  Bold, 
  Italic, 
  Heading, 
  Quote, 
  List, 
  Code, 
  Video, 
  Tag as TagIcon, 
  FolderPlus, 
  UserCheck, 
  Flame, 
  Globe, 
  Layers
} from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ImageUploader from '../components/ImageUploader';
import { safeJsonParse } from '../utils/json';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ToastNotification } from './components/Toast';

const AdminNews = () => {
  const [items, setItems] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [authors, setAuthors] = useState<any[]>([]);
  const [tagsList, setTagsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; type: 'article' | 'category' | 'author' | 'tag'; name?: string } | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const [modalTab, setModalTab] = useState<'content' | 'meta' | 'media' | 'seo' | 'preview'>('content');
  
  // Management View Toggles
  const [activeSubView, setActiveSubView] = useState<'news' | 'categories'>('news');
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingTag, setEditingTag] = useState<any>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [filterStatus, setFilterStatus] = useState('ALL');

  const safeFetchJson = async (url: string) => {
    try {
      const res = await fetch(url);
      if (!res.ok) return [];
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await res.json();
      }
      return [];
    } catch {
      return [];
    }
  };

  const fetchData = async () => {
    try {
      const [newsData, catData, authData, tagData] = await Promise.all([
        safeFetchJson('/api/news'),
        safeFetchJson('/api/news_categories'),
        safeFetchJson('/api/news_authors'),
        safeFetchJson('/api/news_tags')
      ]);

      if (Array.isArray(newsData)) {
        setItems(newsData.map((item: any) => ({
          ...item,
          tags: typeof item.tags === 'string' ? safeJsonParse(item.tags, []) : (item.tags || []),
          gallery_images: typeof item.gallery_images === 'string' ? safeJsonParse(item.gallery_images, []) : (item.gallery_images || [])
        })));
      }
      if (Array.isArray(catData)) setCategories(catData);
      if (Array.isArray(authData)) setAuthors(authData);
      if (Array.isArray(tagData)) setTagsList(tagData);
    } catch (err) {
      console.error('Failed to load news data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSlugify = (str: string) => {
    return str
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleOpenNewArticle = () => {
    setEditingItem({
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      image: '',
      category: categories.length > 0 ? categories[0].name : 'ANNOUNCEMENT',
      category_id: categories.length > 0 ? categories[0].id : null,
      author: 'GEEKAY HQ',
      author_id: null,
      date: new Date().toISOString().split('T')[0],
      read_time: '4 MIN READ',
      featured: 0,
      breaking_news: 0,
      published: 1,
      status: 'published',
      tags: ['ANNOUNCEMENT'],
      display_order: items.length + 1,
      gallery_images: [],
      seo_title: '',
      meta_description: '',
      meta_keywords: '',
      canonical_url: '',
      og_title: '',
      og_description: '',
      og_image: '',
      twitter_image: '',
      index_robot: 1,
      follow_robot: 1
    });
    setModalTab('content');
  };

  const handleOpenEditArticle = (item: any) => {
    setEditingItem({
      ...item,
      tags: Array.isArray(item.tags) ? item.tags : safeJsonParse(item.tags, []),
      gallery_images: Array.isArray(item.gallery_images) ? item.gallery_images : safeJsonParse(item.gallery_images, [])
    });
    setModalTab('content');
  };

  const handleInsertFormat = (prefix: string, suffix: string = '') => {
    if (!editingItem) return;
    const currentText = editingItem.content || '';
    setEditingItem({
      ...editingItem,
      content: currentText + `\n${prefix}Text here${suffix}\n`
    });
  };

  const handleSaveArticle = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.title || !editingItem.category) {
      alert('Article Title and Category are required!');
      return;
    }

    setSaving(true);
    try {
      const method = editingItem.id ? 'PUT' : 'POST';
      const url = editingItem.id ? `/api/news/${editingItem.id}` : '/api/news';

      const slug = editingItem.slug || handleSlugify(editingItem.title);
      const readTimeVal = editingItem.read_time || editingItem.readTime || '4 MIN READ';
      
      let tagsArr: string[] = [];
      if (Array.isArray(editingItem.tags)) {
        tagsArr = editingItem.tags;
      } else if (typeof editingItem.tags === 'string') {
        tagsArr = editingItem.tags.split(',').map((t: string) => t.trim()).filter(Boolean);
      }

      const payload = {
        ...editingItem,
        slug,
        read_time: readTimeVal,
        readTime: readTimeVal,
        updated_at: new Date().toISOString(),
        tags: JSON.stringify(tagsArr),
        gallery_images: typeof editingItem.gallery_images === 'string' ? editingItem.gallery_images : JSON.stringify(editingItem.gallery_images || [])
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save news article');
      }

      setEditingItem(null);
      setToastMsg('تم حفظ المقال والخبر بنجاح! / Article saved successfully!');
      fetchData();
    } catch (err: any) {
      console.error('Save news error:', err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;
    const { id, type } = deleteTarget;
    setDeleteTarget(null);
    if (type === 'article') {
      try {
        setItems((prev: any[]) => prev.filter((item: any) => String(item.id) !== String(id)));
        await fetch(`/api/news/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        fetchData();
      }
    } else if (type === 'category') {
      try {
        setCategories((prev: any[]) => prev.filter((c: any) => String(c.id) !== String(id)));
        await fetch(`/api/news_categories/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        fetchData();
      }
    } else if (type === 'author') {
      try {
        setAuthors((prev: any[]) => prev.filter((a: any) => String(a.id) !== String(id)));
        await fetch(`/api/news_authors/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        fetchData();
      }
    } else if (type === 'tag') {
      try {
        setTagsList((prev: any[]) => prev.filter((t: any) => String(t.id) !== String(id)));
        await fetch(`/api/news_tags/${id}`, { method: 'DELETE' });
        fetchData();
      } catch (err) {
        fetchData();
      }
    }
  };

  const handleQuickToggle = async (item: any, field: string, val: any) => {
    try {
      await fetch(`/api/news/${item.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, [field]: val })
      });
      fetchData();
    } catch (err) {
      console.error('Toggle failed:', err);
    }
  };

  // Category Save
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory.name) return;
    try {
      const method = editingCategory.id ? 'PUT' : 'POST';
      const url = editingCategory.id ? `/api/news_categories/${editingCategory.id}` : '/api/news_categories';
      const payload = {
        ...editingCategory,
        slug: editingCategory.slug || handleSlugify(editingCategory.name)
      };
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditingCategory(null);
      fetchData();
    } catch (err) {
      alert('Failed to save category');
    }
  };

  // Tag Save
  const handleSaveTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTag.name) return;
    try {
      const method = editingTag.id ? 'PUT' : 'POST';
      const url = editingTag.id ? `/api/news_tags/${editingTag.id}` : '/api/news_tags';
      const payload = {
        ...editingTag,
        slug: editingTag.slug || handleSlugify(editingTag.name)
      };
      await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      setEditingTag(null);
      fetchData();
    } catch (err) {
      alert('Failed to save tag');
    }
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = 
      (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.excerpt || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.author || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesStatus = filterStatus === 'ALL' || item.status === filterStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  if (loading) return <div className="p-8 font-syncopate text-[#FFC400] text-xs font-bold">LOADING_NEWS_DESK...</div>;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-2 block uppercase">PRESS_ROOM</span>
          <h1 className="font-syncopate text-3xl md:text-5xl font-black text-white uppercase tracking-tighter">
            NEWS & <span className="text-[#FFC400]">BLOGS</span>
          </h1>
          <p className="text-slate-400 font-inter text-xs mt-1">
            Publish articles, press releases, and categories.
          </p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex bg-[#040E1E] p-1 border border-white/5">
            {[
              { id: 'news', label: 'ARTICLES', icon: <FileText size={14} /> },
              { id: 'categories', label: 'CATEGORIES', icon: <FolderPlus size={14} /> }
            ].map(sub => (
              <button
                key={sub.id}
                onClick={() => setActiveSubView(sub.id as any)}
                className={`flex items-center gap-1.5 px-3 py-2 font-syncopate text-[9px] font-bold tracking-widest transition-colors ${
                  activeSubView === sub.id ? 'bg-[#FFC400] text-black' : 'text-slate-400 hover:text-white'
                }`}
              >
                {sub.icon} {sub.label}
              </button>
            ))}
          </div>

          {activeSubView === 'news' && (
            <ArenaButton onClick={handleOpenNewArticle}>
              <Plus size={18} className="mr-2" /> NEW_ARTICLE
            </ArenaButton>
          )}
          {activeSubView === 'categories' && (
            <ArenaButton onClick={() => setEditingCategory({ name: '', slug: '', description: '', display_order: categories.length + 1 })}>
              <Plus size={18} className="mr-2" /> ADD_CATEGORY
            </ArenaButton>
          )}
        </div>
      </div>

      {/* ARTICLES MAIN VIEW */}
      {activeSubView === 'news' && (
        <>
          {/* Search & Filter Bar */}
          <div className="bg-[#081B3A] border border-white/5 p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:w-80">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search news, author, excerpt..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full bg-[#040E1E] border border-slate-800 pl-11 pr-4 py-2.5 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <span className="text-slate-500 font-syncopate text-[9px] font-bold uppercase">Category:</span>
                <select 
                  value={filterCategory}
                  onChange={e => setFilterCategory(e.target.value)}
                  className="bg-[#040E1E] border border-slate-800 text-white font-syncopate text-[10px] font-bold px-3 py-2 focus:outline-none focus:border-[#FFC400]"
                >
                  <option value="ALL">ALL CATEGORIES</option>
                  {categories.map(c => (
                    <option key={c.id || c.name} value={c.name}>{c.name}</option>
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
                  <option value="published">PUBLISHED</option>
                  <option value="draft">DRAFT</option>
                  <option value="archived">ARCHIVED</option>
                </select>
              </div>
            </div>
          </div>

          {/* Articles Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#081B3A] border border-white/5 overflow-hidden flex flex-col justify-between group relative"
              >
                <div>
                  <div className="relative aspect-video bg-[#040E1E] overflow-hidden">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-700">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 flex-wrap">
                      <span className="bg-[#FFC400] text-black font-syncopate text-[8px] font-black px-2 py-0.5 tracking-widest">
                        {item.category}
                      </span>
                      {item.breaking_news === 1 && (
                        <span className="bg-red-600 text-white font-syncopate text-[8px] font-black px-2 py-0.5 tracking-widest flex items-center gap-1">
                          <Flame size={10} /> BREAKING
                        </span>
                      )}
                      {item.featured === 1 && (
                        <span className="bg-amber-400 text-black font-syncopate text-[8px] font-black px-2 py-0.5 tracking-widest flex items-center gap-1">
                          <Sparkles size={10} /> FEATURED
                        </span>
                      )}
                    </div>

                    <span className={`absolute top-3 right-3 text-[8px] font-syncopate font-black px-2 py-0.5 uppercase ${
                      item.status === 'published' ? 'bg-emerald-500 text-black' : 'bg-amber-500 text-black'
                    }`}>
                      {item.status || (item.published ? 'published' : 'draft')}
                    </span>
                  </div>

                  <div className="p-6 space-y-3">
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span>{item.date}</span>
                      <span>{item.read_time || '3 MIN READ'}</span>
                    </div>

                    <h3 className="font-syncopate text-base font-bold text-white line-clamp-2 leading-snug group-hover:text-[#FFC400] transition-colors">
                      {item.title}
                    </h3>

                    {item.excerpt && (
                      <p className="text-slate-400 font-inter text-xs line-clamp-2 leading-relaxed">
                        {item.excerpt}
                      </p>
                    )}

                    <div className="flex items-center gap-2 pt-2 text-[11px] font-inter text-slate-400">
                      <span className="font-semibold text-white">By: {item.author || 'GEEKAY HQ'}</span>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-900/40 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleQuickToggle(item, 'published', item.published === 1 ? 0 : 1)}
                      className={`text-[9px] font-syncopate font-bold px-2.5 py-1 transition-colors ${
                        item.published === 1 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.published === 1 ? 'PUBLISHED' : 'DRAFT'}
                    </button>
                    <button 
                      onClick={() => handleQuickToggle(item, 'featured', item.featured === 1 ? 0 : 1)}
                      className={`p-1.5 transition-colors ${item.featured === 1 ? 'text-[#FFC400]' : 'text-slate-600 hover:text-slate-400'}`}
                      title="Toggle Featured"
                    >
                      <Sparkles size={14} />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button onClick={() => handleOpenEditArticle(item)} className="p-2 bg-white/5 text-slate-400 hover:text-[#FFC400] transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button onClick={() => setDeleteTarget({ id: item.id, type: 'article', name: item.title })} className="p-2 bg-white/5 text-slate-400 hover:text-red-500 transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="text-center py-16 bg-[#081B3A] border border-white/5 text-slate-500 font-syncopate text-xs uppercase">
              No news articles found.
            </div>
          )}
        </>
      )}

      {/* CATEGORIES VIEW */}
      {activeSubView === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((cat) => (
            <div key={cat.id} className="bg-[#081B3A] border border-white/5 p-6 space-y-4">
              <div className="flex items-center justify-between">
                <span className="bg-[#FFC400] text-black font-syncopate text-[9px] font-black px-2 py-0.5">{cat.slug}</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setEditingCategory(cat)} className="text-slate-400 hover:text-[#FFC400]"><Edit2 size={16} /></button>
                  <button onClick={() => setDeleteTarget({ id: cat.id, type: 'category', name: cat.name })} className="text-slate-400 hover:text-red-500"><Trash2 size={16} /></button>
                </div>
              </div>
              <h3 className="font-syncopate text-lg font-bold text-white uppercase">{cat.name}</h3>
              {cat.description && <p className="text-slate-400 font-inter text-xs">{cat.description}</p>}
            </div>
          ))}
        </div>
      )}

      {/* ARTICLE EDITOR MODAL */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="absolute inset-0 bg-black/85 backdrop-blur-md" onClick={() => setEditingItem(null)} />
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-4xl relative z-10 my-8 overflow-hidden shadow-2xl"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            
            {/* Modal Header */}
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <div>
                <span className="text-[#FFC400] font-syncopate text-[9px] font-bold tracking-widest block uppercase">ARTICLE_EDITOR</span>
                <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                  {editingItem.id ? 'EDIT ARTICLE' : 'CREATE NEW ARTICLE'}
                </h2>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white p-2">
                <X size={24} />
              </button>
            </div>

            {/* Modal Tabs */}
            <div className="flex border-b border-white/5 bg-[#040E1E] px-6 overflow-x-auto">
              {[
                { id: 'content', label: 'CONTENT & EDITOR' },
                { id: 'meta', label: 'CLASSIFICATION' },
                { id: 'media', label: 'HEADER & MEDIA' },
                { id: 'seo', label: 'SEO & METADATA' },
                { id: 'preview', label: 'LIVE PREVIEW' }
              ].map(tab => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setModalTab(tab.id as any)}
                  className={`px-4 py-3 font-syncopate text-[10px] font-bold tracking-widest uppercase border-b-2 transition-all shrink-0 ${
                    modalTab === tab.id ? 'border-[#FFC400] text-[#FFC400] bg-white/5' : 'border-transparent text-slate-400 hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Modal Form Content */}
            <form onSubmit={handleSaveArticle} className="p-6 md:p-8 space-y-6 max-h-[75vh] overflow-y-auto">
              {modalTab === 'content' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Article Title *</label>
                    <input 
                      type="text" 
                      value={editingItem.title || ''}
                      onChange={e => {
                        const title = e.target.value;
                        setEditingItem({
                          ...editingItem,
                          title,
                          slug: editingItem.id ? editingItem.slug : handleSlugify(title)
                        });
                      }}
                      placeholder="e.g. GEEKAY QUALIFIES FOR RLCS LONDON MAJOR 2026"
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-sm focus:outline-none focus:border-[#FFC400]"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Short Excerpt / Summary</label>
                    <textarea 
                      rows={2}
                      value={editingItem.excerpt || ''}
                      onChange={e => setEditingItem({...editingItem, excerpt: e.target.value})}
                      placeholder="Catchy headline summary for article cards and social previews..."
                      className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>

                  {/* Rich Formatting Toolbar */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Main Article Body Content</label>
                      <div className="flex items-center gap-1 bg-[#040E1E] p-1 border border-white/5">
                        <button type="button" onClick={() => handleInsertFormat('## ')} className="p-1.5 text-slate-400 hover:text-[#FFC400]" title="Heading H2"><Heading size={14} /></button>
                        <button type="button" onClick={() => handleInsertFormat('**', '**')} className="p-1.5 text-slate-400 hover:text-[#FFC400]" title="Bold Text"><Bold size={14} /></button>
                        <button type="button" onClick={() => handleInsertFormat('*', '*')} className="p-1.5 text-slate-400 hover:text-[#FFC400]" title="Italic Text"><Italic size={14} /></button>
                        <button type="button" onClick={() => handleInsertFormat('> ')} className="p-1.5 text-slate-400 hover:text-[#FFC400]" title="Quote Block"><Quote size={14} /></button>
                        <button type="button" onClick={() => handleInsertFormat('- ')} className="p-1.5 text-slate-400 hover:text-[#FFC400]" title="Bullet Item"><List size={14} /></button>
                        <button type="button" onClick={() => handleInsertFormat('```\n', '\n```')} className="p-1.5 text-slate-400 hover:text-[#FFC400]" title="Code Block"><Code size={14} /></button>
                      </div>
                    </div>

                    <textarea 
                      rows={12}
                      value={editingItem.content || ''}
                      onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                      placeholder="Write full article body content here..."
                      className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400] leading-relaxed"
                    />
                  </div>
                </div>
              )}

              {modalTab === 'meta' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Category</label>
                      <select 
                        value={editingItem.category || ''}
                        onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                        className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      >
                        {categories.map(c => (
                          <option key={c.id || c.name} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="space-y-2">
                      <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Author</label>
                      <input 
                        type="text"
                        value={editingItem.author || ''}
                        onChange={e => setEditingItem({...editingItem, author: e.target.value})}
                        placeholder="e.g. GEEKAY HQ or Author Name"
                        className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-2">
                      <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Publication Date</label>
                      <input 
                        type="date" 
                        value={editingItem.date || ''}
                        onChange={e => setEditingItem({...editingItem, date: e.target.value})}
                        className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Estimated Read Time</label>
                      <input 
                        type="text" 
                        value={editingItem.read_time || ''}
                        onChange={e => setEditingItem({...editingItem, read_time: e.target.value})}
                        placeholder="e.g. 4 MIN READ"
                        className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Publish Status</label>
                      <select 
                        value={editingItem.status || 'published'}
                        onChange={e => setEditingItem({...editingItem, status: e.target.value, published: e.target.value === 'published' ? 1 : 0})}
                        className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      >
                        <option value="published">PUBLISHED</option>
                        <option value="draft">DRAFT</option>
                        <option value="archived">ARCHIVED</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Assigned Team (Optional)</label>
                      <input 
                        type="text" 
                        value={editingItem.related_team || ''}
                        onChange={e => setEditingItem({...editingItem, related_team: e.target.value})}
                        placeholder="e.g. GEEKAY VALORANT"
                        className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>

                    <div className="space-y-2">
                      <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Game Division (Optional)</label>
                      <input 
                        type="text" 
                        value={editingItem.related_game || ''}
                        onChange={e => setEditingItem({...editingItem, related_game: e.target.value})}
                        placeholder="e.g. VALORANT / ROCKET LEAGUE"
                        className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest block">Article Tags</label>
                    <div className="flex flex-wrap gap-2 items-center bg-[#040E1E] border border-slate-800 p-3.5">
                      {(Array.isArray(editingItem.tags) ? editingItem.tags : (typeof editingItem.tags === 'string' ? editingItem.tags.split(',') : [])).map((t: string, idx: number) => {
                        const tagStr = t.trim();
                        if (!tagStr) return null;
                        return (
                          <span key={idx} className="bg-slate-900 border border-slate-700 text-[#FFC400] text-[9px] font-mono px-2.5 py-1 flex items-center gap-1.5 uppercase">
                            #{tagStr}
                            <button 
                              type="button" 
                              onClick={() => {
                                const currentArr: string[] = Array.isArray(editingItem.tags) ? editingItem.tags : (typeof editingItem.tags === 'string' ? editingItem.tags.split(',').map((x: string) => x.trim()) : []);
                                const filtered = currentArr.filter((_: string, i: number) => i !== idx);
                                setEditingItem({...editingItem, tags: filtered});
                              }}
                              className="hover:text-red-400 font-bold ml-1"
                            >
                              ×
                            </button>
                          </span>
                        );
                      })}
                      <input 
                        type="text"
                        placeholder="+ Add tag (press Enter or comma)"
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ',') {
                            e.preventDefault();
                            const val = e.currentTarget.value.trim().replace(/^#/, '');
                            if (val) {
                              const currentArr: string[] = Array.isArray(editingItem.tags) ? editingItem.tags : (typeof editingItem.tags === 'string' ? editingItem.tags.split(',').map((x: string) => x.trim()) : []);
                              if (!currentArr.includes(val)) {
                                setEditingItem({...editingItem, tags: [...currentArr, val]});
                              }
                              e.currentTarget.value = '';
                            }
                          }
                        }}
                        className="bg-transparent border-none text-white text-xs font-mono focus:outline-none min-w-[150px]"
                      />
                    </div>
                    {tagsList.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 items-center pt-1">
                        <span className="text-slate-500 text-[8px] font-syncopate uppercase mr-1">Quick Select:</span>
                        {tagsList.map(t => (
                          <button
                            key={t.id || t.name}
                            type="button"
                            onClick={() => {
                              const currentArr: string[] = Array.isArray(editingItem.tags) ? editingItem.tags : (typeof editingItem.tags === 'string' ? editingItem.tags.split(',').map((x: string) => x.trim()) : []);
                              if (!currentArr.includes(t.name)) {
                                setEditingItem({...editingItem, tags: [...currentArr, t.name]});
                              }
                            }}
                            className="text-[8px] font-mono bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-[#FFC400] hover:border-[#FFC400]/40 px-2 py-0.5 uppercase transition-colors"
                          >
                            +{t.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-[#040E1E] border border-white/5">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingItem.featured === 1}
                        onChange={e => setEditingItem({...editingItem, featured: e.target.checked ? 1 : 0})}
                        className="w-4 h-4 bg-slate-900 border-slate-700 checked:bg-[#FFC400]"
                      />
                      <span className="font-syncopate text-[9px] font-bold text-white uppercase">Featured Article</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingItem.breaking_news === 1}
                        onChange={e => setEditingItem({...editingItem, breaking_news: e.target.checked ? 1 : 0})}
                        className="w-4 h-4 bg-slate-900 border-slate-700 checked:bg-red-600"
                      />
                      <span className="font-syncopate text-[9px] font-bold text-white uppercase">Breaking News</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={editingItem.published === 1}
                        onChange={e => setEditingItem({...editingItem, published: e.target.checked ? 1 : 0, status: e.target.checked ? 'published' : 'draft'})}
                        className="w-4 h-4 bg-slate-900 border-slate-700 checked:bg-emerald-500"
                      />
                      <span className="font-syncopate text-[9px] font-bold text-white uppercase">Visible / Published</span>
                    </label>
                  </div>
                </div>
              )}

              {modalTab === 'media' && (
                <div className="space-y-6">
                  <ImageUploader 
                    label="Header Featured Banner Image" 
                    value={editingItem.image || ''} 
                    onChange={(url) => setEditingItem({ ...editingItem, image: url })}
                    aspectRatio="banner"
                  />
                </div>
              )}

              {modalTab === 'seo' && (
                <div className="space-y-6">
                  <div className="space-y-2">
                    <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">URL Slug *</label>
                    <input 
                      type="text" 
                      value={editingItem.slug || ''}
                      onChange={e => setEditingItem({...editingItem, slug: e.target.value})}
                      placeholder="e.g. geekay-qualifies-for-rlcs-major"
                      className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">SEO Title Tag</label>
                    <input 
                      type="text" 
                      value={editingItem.seo_title || ''}
                      onChange={e => setEditingItem({...editingItem, seo_title: e.target.value})}
                      placeholder="Geekay Esports Qualifies For International Championship | Geekay News"
                      className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">Meta Description</label>
                    <textarea 
                      rows={3}
                      value={editingItem.meta_description || ''}
                      onChange={e => setEditingItem({...editingItem, meta_description: e.target.value})}
                      placeholder="Read official breakdown of Geekay Esports tournament qualification..."
                      className="w-full bg-[#040E1E] border border-slate-800 p-3.5 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400]"
                    />
                  </div>
                </div>
              )}

              {modalTab === 'preview' && (
                <div className="space-y-6 bg-[#040E1E] p-6 border border-white/5">
                  {editingItem.image && (
                    <img src={editingItem.image} alt="Preview" className="w-full h-56 object-cover border border-white/10 mb-4" />
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="bg-[#FFC400] text-black font-syncopate text-[9px] font-black px-2.5 py-1 inline-block">
                      {editingItem.category || 'ANNOUNCEMENT'}
                    </span>
                    {editingItem.related_game && (
                      <span className="bg-slate-900 border border-slate-700 text-[#FFC400] font-mono text-[9px] px-2 py-0.5 uppercase">
                        {editingItem.related_game}
                      </span>
                    )}
                    {editingItem.related_team && (
                      <span className="bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[9px] px-2 py-0.5 uppercase">
                        {editingItem.related_team}
                      </span>
                    )}
                  </div>

                  <h1 className="font-syncopate text-2xl font-black text-white uppercase mt-2">
                    {editingItem.title || 'UNTITLED ARTICLE'}
                  </h1>

                  <p className="text-slate-400 font-mono text-xs">
                    By {editingItem.author || 'GEEKAY HQ'} — {editingItem.date} ({editingItem.read_time || editingItem.readTime || '4 MIN READ'})
                  </p>

                  {editingItem.excerpt && (
                    <div className="border-l-2 border-[#FFC400] pl-4 italic text-slate-300 font-inter text-xs bg-white/5 py-2">
                      "{editingItem.excerpt}"
                    </div>
                  )}

                  <div className="border-t border-white/10 pt-4 text-slate-300 font-inter text-sm whitespace-pre-wrap leading-relaxed">
                    {editingItem.content || 'No body content written yet.'}
                  </div>

                  {(Array.isArray(editingItem.tags) ? editingItem.tags : (typeof editingItem.tags === 'string' ? editingItem.tags.split(',') : [])).length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-4 border-t border-white/5">
                      <span className="text-slate-500 text-[9px] font-syncopate uppercase mr-2">TAGS:</span>
                      {(Array.isArray(editingItem.tags) ? editingItem.tags : (typeof editingItem.tags === 'string' ? editingItem.tags.split(',') : [])).map((t: string, idx: number) => {
                        const tagStr = t.trim();
                        if (!tagStr) return null;
                        return (
                          <span key={idx} className="bg-slate-900 text-[#FFC400] border border-slate-800 text-[8px] font-mono px-2 py-0.5 uppercase">
                            #{tagStr}
                          </span>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Save Bar */}
              <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="px-6 py-3 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <ArenaButton type="submit" disabled={saving}>
                  <Save size={16} className="mr-2" />
                  {saving ? 'SAVING...' : 'SAVE_ARTICLE'}
                </ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* CATEGORY MODAL */}
      {editingCategory && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setEditingCategory(null)} />
          <div className="bg-[#081B3A] border border-white/10 w-full max-w-md relative z-10 p-6 space-y-4">
            <h3 className="font-syncopate text-lg font-bold text-white uppercase">{editingCategory.id ? 'EDIT CATEGORY' : 'ADD CATEGORY'}</h3>
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <input type="text" placeholder="Category Name (e.g. TOURNAMENT)" value={editingCategory.name || ''} onChange={e => setEditingCategory({...editingCategory, name: e.target.value})} className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs" required />
              <input type="text" placeholder="Category Slug" value={editingCategory.slug || ''} onChange={e => setEditingCategory({...editingCategory, slug: e.target.value})} className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-mono text-xs" />
              <textarea placeholder="Category Description" value={editingCategory.description || ''} onChange={e => setEditingCategory({...editingCategory, description: e.target.value})} className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-inter text-xs" rows={2} />
              <div className="flex justify-end gap-3 pt-4">
                <button type="button" onClick={() => setEditingCategory(null)} className="px-4 py-2 text-slate-400 text-xs">Cancel</button>
                <ArenaButton type="submit">SAVE</ArenaButton>
              </div>
            </form>
          </div>
        </div>
      )}

      <ToastNotification message={toastMsg} onClose={() => setToastMsg(null)} />

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title={`DELETE_${deleteTarget?.type?.toUpperCase() || 'ITEM'}`}
        itemName={deleteTarget?.name}
        description={`Are you sure you want to delete this ${deleteTarget?.type || 'item'}? This action cannot be undone.`}
      />
    </div>
  );
};

export default AdminNews;

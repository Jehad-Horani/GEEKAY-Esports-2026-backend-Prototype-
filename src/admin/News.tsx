import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon, Search, Eye, EyeOff, Award, FileText, ArrowRight, Upload } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';

const AdminNews = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState('ALL');
  const [uploading, setUploading] = useState(false);

  const categories = ['ALL', 'ANNOUNCEMENT', 'ROSTER', 'TOURNAMENT', 'COMMUNITY', 'PARTNERSHIP'];

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/news');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch news:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleSlugify = (title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (title: string) => {
    if (!editingItem.id) {
      setEditingItem({
        ...editingItem,
        title,
        slug: handleSlugify(title)
      });
    } else {
      setEditingItem({
        ...editingItem,
        title
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setEditingItem({
          ...editingItem,
          image: data.url
        });
      } else {
        alert('Failed to upload image');
      }
    } catch (err) {
      console.error('Upload error:', err);
      alert('Error uploading image');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem.title || !editingItem.slug || !editingItem.category) {
      alert('Title, Slug and Category are required!');
      return;
    }

    setSaving(true);
    try {
      const method = editingItem.id ? 'PUT' : 'POST';
      const url = editingItem.id ? `/api/news/${editingItem.id}` : '/api/news';

      // Ensure fields are clean
      const payload = {
        ...editingItem,
        featured: editingItem.featured ? 1 : 0,
        published: editingItem.published ? 1 : 0,
        // Make sure tags is a valid JSON string
        tags: typeof editingItem.tags === 'string' ? editingItem.tags : JSON.stringify(editingItem.tags || [])
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
      fetchItems();
    } catch (err: any) {
      console.error('Save news error:', err);
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you absolutely sure you want to delete this news article? This action cannot be undone.')) return;
    try {
      const res = await fetch(`/api/news/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchItems();
      } else {
        alert('Failed to delete news article');
      }
    } catch (err) {
      console.error('Delete news error:', err);
    }
  };

  const filteredItems = items.filter(item => {
    const matchesCategory = filterCategory === 'ALL' || item.category === filterCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.author?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#FFC400] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">MEDIA_HQ // NEWS</span>
          <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">NEWS & BLOGS</h1>
        </div>
        <ArenaButton onClick={() => setEditingItem({
          title: '',
          slug: '',
          category: 'ANNOUNCEMENT',
          excerpt: '',
          image: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=1200&h=800',
          content: '',
          author: 'GEEKAY COMMAND',
          date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase(),
          tags: JSON.stringify(['GEEKAY']),
          featured: 0,
          published: 1,
          readTime: '4 MIN READ',
          related_team: '',
          related_game: '',
          display_order: 0
        })}>
          <Plus size={18} className="mr-2" /> CREATE_ARTICLE
        </ArenaButton>
      </header>

      {/* Filters and Search controls */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center bg-[#081B3A] border border-white/5 p-6 rounded-sm">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`px-4 py-2 font-syncopate text-[9px] font-bold tracking-widest transition-all skew-x-[-15deg] border
                ${filterCategory === cat 
                  ? 'bg-[#FFC400] text-black border-[#FFC400]' 
                  : 'bg-transparent text-slate-400 border-slate-800 hover:border-slate-600'}`}
            >
              <span className="block skew-x-[15deg]">{cat}</span>
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-80 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-[#FFC400] transition-colors" size={16} />
          <input
            type="text"
            placeholder="SEARCH ARTICLES..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#040E1E] border border-slate-800 py-3 pl-12 pr-6 font-syncopate text-[10px] text-white tracking-widest focus:outline-none focus:border-[#FFC400] transition-all"
          />
        </div>
      </div>

      {/* Grid listing */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item) => {
            let itemTags: string[] = [];
            try {
              if (item.tags) {
                itemTags = typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags;
              }
            } catch (e) {
              itemTags = typeof item.tags === 'string' ? item.tags.split(',') : [];
            }

            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#081B3A] border border-white/5 group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 w-1 h-0 bg-[#FFC400] group-hover:h-full transition-all duration-500" />
                
                <div>
                  <div className="relative aspect-video overflow-hidden border-b border-white/5 bg-[#040E1E]">
                    {item.image ? (
                      <img src={item.image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-all duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ImageIcon size={48} />
                      </div>
                    )}
                    
                    <div className="absolute top-4 left-4 flex gap-2">
                      <span className="bg-black/80 text-[#FFC400] px-3 py-1 text-[8px] font-syncopate font-bold border border-[#FFC400]/20 tracking-widest uppercase">
                        {item.category}
                      </span>
                      {item.featured === 1 && (
                        <span className="bg-[#FFC400] text-black px-3 py-1 text-[8px] font-syncopate font-bold tracking-widest uppercase">
                          FEATURED
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-4 right-4 bg-black/80 px-3 py-1 text-[8px] font-syncopate font-bold text-slate-300">
                      {item.readTime || '4 MIN READ'}
                    </div>
                  </div>

                  <div className="p-8">
                    <div className="flex items-center justify-between text-slate-500 font-syncopate text-[8px] tracking-widest mb-4">
                      <span>{item.date}</span>
                      <span>BY {item.author || 'HQ'}</span>
                    </div>

                    <h3 className="font-syncopate text-lg font-bold text-white mb-4 line-clamp-2 uppercase group-hover:text-[#FFC400] transition-colors leading-snug">
                      {item.title}
                    </h3>

                    <p className="text-slate-400 text-xs font-light line-clamp-3 mb-6 leading-relaxed">
                      {item.excerpt}
                    </p>

                    {itemTags.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {itemTags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="bg-white/5 text-slate-400 px-2 py-0.5 text-[8px] font-mono tracking-widest uppercase rounded-sm">
                            #{tag.trim()}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="p-8 pt-0 border-t border-white/5 flex items-center justify-between mt-6">
                  <div className="flex items-center gap-2">
                    {item.published === 1 ? (
                      <span className="flex items-center gap-1.5 text-emerald-500 text-[8px] font-syncopate tracking-widest font-bold">
                        <Eye size={12} /> PUBLISHED
                      </span>
                    ) : (
                      <span className="flex items-center gap-1.5 text-slate-500 text-[8px] font-syncopate tracking-widest font-bold">
                        <EyeOff size={12} /> DRAFT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => setEditingItem(item)} 
                      className="text-slate-400 hover:text-[#FFC400] p-2 hover:bg-white/5 transition-all"
                      title="Edit Article"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(item.id)} 
                      className="text-slate-400 hover:text-red-500 p-2 hover:bg-white/5 transition-all"
                      title="Delete Article"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="py-24 text-center border border-dashed border-white/10 rounded-sm">
          <FileText className="mx-auto text-slate-700 mb-6 animate-pulse" size={48} />
          <h3 className="font-syncopate text-lg font-bold text-slate-500 uppercase tracking-widest">NO ARTICLES FOUND</h3>
          <p className="text-slate-600 mt-2 text-[10px] tracking-widest uppercase">Create a new article or change filter conditions</p>
        </div>
      )}

      {/* Editor Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-[#040E1E]/90 flex items-center justify-center p-6 backdrop-blur-md">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-3xl relative z-10 overflow-hidden max-h-[90vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-lg font-black text-white uppercase tracking-widest">
                {editingItem.id ? 'EDIT ARTICLE' : 'CREATE ARTICLE'}
              </h2>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 overflow-y-auto flex-grow">
              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Article Title</label>
                <input 
                  type="text" 
                  value={editingItem.title}
                  onChange={e => handleTitleChange(e.target.value)}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  placeholder="e.g. GEEKAY ACQUIRES NEW CHAMPIONSHIP ROSTER"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Slug URL identifier</label>
                  <input 
                    type="text" 
                    value={editingItem.slug}
                    onChange={e => setEditingItem({...editingItem, slug: e.target.value.toLowerCase().replace(/\s+/g, '-')})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. geekay-acquires-roster"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Category</label>
                  <select 
                    value={editingItem.category}
                    onChange={e => setEditingItem({...editingItem, category: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  >
                    {categories.filter(c => c !== 'ALL').map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Author / Source</label>
                  <input 
                    type="text" 
                    value={editingItem.author || ''}
                    onChange={e => setEditingItem({...editingItem, author: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. GEEKAY COMMAND"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Publish Date</label>
                  <input 
                    type="text" 
                    value={editingItem.date || ''}
                    onChange={e => setEditingItem({...editingItem, date: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. FEB 26, 2026"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Estimated Read Time</label>
                  <input 
                    type="text" 
                    value={editingItem.readTime || ''}
                    onChange={e => setEditingItem({...editingItem, readTime: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. 5 MIN READ"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Display Order</label>
                  <input 
                    type="number" 
                    value={editingItem.display_order || 0}
                    onChange={e => setEditingItem({...editingItem, display_order: parseInt(e.target.value) || 0})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Short Excerpt (Intro)</label>
                <textarea 
                  value={editingItem.excerpt || ''}
                  onChange={e => setEditingItem({...editingItem, excerpt: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] min-h-[80px]"
                  placeholder="Enter a compelling teaser excerpt of the news story..."
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Cover Image (URL or Upload)</label>
                <div className="flex gap-4">
                  <input 
                    type="text" 
                    value={editingItem.image || ''}
                    onChange={e => setEditingItem({...editingItem, image: e.target.value})}
                    className="flex-grow bg-[#040E1E] border border-slate-800 p-4 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="https://..."
                  />
                  <label className="bg-[#040E1E] border border-slate-800 p-4 hover:border-[#FFC400] transition-colors cursor-pointer text-slate-400 hover:text-white flex items-center justify-center gap-2">
                    <Upload size={16} />
                    <span className="font-syncopate text-[9px] font-bold tracking-widest">
                      {uploading ? 'UPLOADING...' : 'UPLOAD'}
                    </span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleImageUpload} 
                      className="hidden" 
                      disabled={uploading}
                    />
                  </label>
                </div>
                {editingItem.image && (
                  <div className="mt-2 aspect-video w-48 border border-slate-800 overflow-hidden bg-slate-900">
                    <img src={editingItem.image} alt="Preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Main Article Body Content</label>
                <textarea 
                  value={editingItem.content || ''}
                  onChange={e => setEditingItem({...editingItem, content: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-sans text-xs focus:outline-none focus:border-[#FFC400] min-h-[250px] leading-relaxed"
                  placeholder="Write the full body content here. You can use standard formatting or multi-paragraph entries..."
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Related Team / Division</label>
                  <input 
                    type="text" 
                    value={editingItem.related_team || ''}
                    onChange={e => setEditingItem({...editingItem, related_team: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. Rocket League Squad"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Related Game / Title (Code)</label>
                  <input 
                    type="text" 
                    value={editingItem.related_game || ''}
                    onChange={e => setEditingItem({...editingItem, related_game: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="e.g. RL, VALORANT, PUBG"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Tags (JSON string or Comma-separated list)</label>
                <input 
                  type="text" 
                  value={editingItem.tags || ''}
                  onChange={e => setEditingItem({...editingItem, tags: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                  placeholder='["QUALIFIERS", "LONDON", "MENA"] or GEEKAY, ROSTER, 2026'
                />
              </div>

              <div className="flex items-center gap-8 pt-4">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={editingItem.featured === 1}
                    onChange={e => setEditingItem({...editingItem, featured: e.target.checked ? 1 : 0})}
                    className="accent-[#FFC400] h-4 w-4 rounded bg-[#040E1E] border-slate-800"
                  />
                  <span className="font-syncopate text-[10px] font-bold tracking-widest text-slate-400 group-hover:text-white transition-colors">FEATURED STORY</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={editingItem.published === 1}
                    onChange={e => setEditingItem({...editingItem, published: e.target.checked ? 1 : 0})}
                    className="accent-[#FFC400] h-4 w-4 rounded bg-[#040E1E] border-slate-800"
                  />
                  <span className="font-syncopate text-[10px] font-bold tracking-widest text-slate-400 group-hover:text-white transition-colors">PUBLISH IMMEDIATELY</span>
                </label>
              </div>

              <div className="flex justify-end gap-4 pt-8 border-t border-white/5">
                <button 
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="px-6 py-4 font-syncopate text-[10px] font-bold tracking-widest text-slate-400 hover:text-white transition-all skew-x-[-15deg] border border-slate-800 hover:border-slate-600 bg-transparent"
                >
                  <span className="block skew-x-[15deg]">CANCEL</span>
                </button>
                <ArenaButton 
                  type="submit" 
                  disabled={saving}
                  icon={<Save size={16} />}
                >
                  {saving ? 'SAVING...' : 'SAVE_ARTICLE'}
                </ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminNews;

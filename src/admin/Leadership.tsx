
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ImageUploader from '../components/ImageUploader';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

const AdminLeadership = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name?: string } | null>(null);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/leadership');
      if (res.ok) {
        const data = await res.json();
        setItems(data);
      }
    } catch (err) {
      console.error('Failed to fetch leadership:', err);
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
      const url = editingItem.id ? `/api/leadership/${editingItem.id}` : '/api/leadership';
      
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Failed to save leadership member');
      }
      
      setEditingItem(null);
      fetchItems();
    } catch (err: any) {
      console.error('Save leadership error:', err);
      if (err.name === 'AbortError') {
        alert('Request timed out. The server might be busy. Please check the dashboard status.');
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
      await fetch(`/api/leadership/${id}`, { method: 'DELETE' });
      fetchItems();
    } catch (err: any) {
      fetchItems();
    }
  };

  if (loading) return <div>Loading leadership...</div>;

  return (
    <div className="space-y-12">
      <header className="flex items-center justify-between">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">COMMAND_STRUCTURE</span>
          <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">LEADERSHIP</h1>
        </div>
        <ArenaButton onClick={() => setEditingItem({ name: '', role: '', description: '', linkedin: '', twitter: '', instagram: '', image: '', display_order: 0, published: 1 })}>
          <Plus size={18} className="mr-2" /> ADD_MEMBER
        </ArenaButton>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((item) => (
          <motion.div 
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#081B3A] border border-white/5 p-8 group relative overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-1 h-0 bg-[#FFC400] group-hover:h-full transition-all duration-500" />
            
            <div className="flex items-center gap-6 mb-8">
              <div className="w-20 h-20 bg-[#040E1E] border border-white/5 flex items-center justify-center overflow-hidden">
                {item.image ? <img src={item.image} className="w-full h-full object-cover" /> : <ImageIcon className="text-slate-700" />}
              </div>
              <div>
                <h3 className="font-syncopate text-lg font-black text-white uppercase tracking-tighter">{item.name}</h3>
                <p className="text-[#FFC400] font-syncopate text-[8px] font-bold tracking-widest uppercase">{item.role}</p>
              </div>
            </div>

            <p className="text-slate-500 font-inter text-xs mb-4 line-clamp-3 leading-relaxed">
              {item.description}
            </p>

            <div className="flex items-center gap-2 mb-6 min-h-[22px]">
              {item.linkedin && <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-mono rounded uppercase">LinkedIn</span>}
              {(item.twitter || item.x) && <span className="px-2 py-0.5 bg-sky-500/10 text-sky-400 text-[9px] font-mono rounded uppercase">X</span>}
              {item.instagram && <span className="px-2 py-0.5 bg-pink-500/10 text-pink-400 text-[9px] font-mono rounded uppercase">Instagram</span>}
            </div>

            <div className="flex items-center justify-between pt-8 border-t border-white/5">
              <span className={`px-3 py-1 rounded-full text-[8px] font-black ${item.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {item.published ? 'PUBLISHED' : 'DRAFT'}
              </span>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditingItem(item)} className="p-3 bg-white/5 text-slate-400 hover:text-blue-500 transition-colors"><Edit2 size={18} /></button>
                <button onClick={() => setDeleteTarget({ id: item.id, name: item.name })} className="p-3 bg-white/5 text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmDeleteModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={executeDelete}
        title="DELETE_LEADERSHIP_MEMBER"
        itemName={deleteTarget?.name}
        description="Are you sure you want to delete this executive leadership member? This action cannot be undone."
      />

      {/* Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
          <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-xl relative z-10 overflow-hidden"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                {editingItem.id ? 'EDIT_MEMBER' : 'ADD_MEMBER'}
              </h2>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white"><X size={24} /></button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Name</label>
                  <input 
                    type="text" 
                    value={editingItem.name}
                    onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Role</label>
                  <input 
                    type="text" 
                    value={editingItem.role}
                    onChange={e => setEditingItem({...editingItem, role: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Description</label>
                <textarea 
                  value={editingItem.description}
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400] h-32 resize-none"
                />
              </div>

              <ImageUploader 
                label="Executive Headshot Photo" 
                value={editingItem.image || ''} 
                onChange={(url) => setEditingItem({ ...editingItem, image: url })}
                aspectRatio="square"
              />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">LinkedIn URL</label>
                  <input 
                    type="text" 
                    value={editingItem.linkedin || ''}
                    onChange={e => setEditingItem({...editingItem, linkedin: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">X (Twitter) URL</label>
                  <input 
                    type="text" 
                    value={editingItem.twitter || editingItem.x || ''}
                    onChange={e => setEditingItem({...editingItem, twitter: e.target.value, x: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="https://x.com/..."
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Instagram URL</label>
                  <input 
                    type="text" 
                    value={editingItem.instagram || ''}
                    onChange={e => setEditingItem({...editingItem, instagram: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="https://instagram.com/..."
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
                  {saving ? 'SAVING...' : 'SAVE_MEMBER'}
                </ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default AdminLeadership;

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, X as CloseIcon, Image as ImageIcon, ExternalLink, Instagram, Linkedin } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ImageUploader from '../components/ImageUploader';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import { ToastNotification } from './components/Toast';
import { getAuthHeaders, handleAuthError } from './utils/api';

const AdminLeadership = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name?: string } | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/leadership');
      if (res.ok) {
        const data = await res.json();
        setItems(Array.isArray(data) ? data : []);
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

  const handleOpenAdd = () => {
    setEditingItem({
      name: '',
      role: '',
      description: '',
      linkedin: '',
      twitter: '',
      x: '',
      instagram: '',
      image: '',
      display_order: items.length + 1,
      published: 1
    });
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem({
      ...item,
      x: item.x || item.twitter || '',
      twitter: item.twitter || item.x || '',
      instagram: item.instagram || '',
      linkedin: item.linkedin || '',
      display_order: item.display_order ?? 0,
      published: item.published ?? 1
    });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const method = editingItem.id ? 'PUT' : 'POST';
      const url = editingItem.id ? `/api/leadership/${editingItem.id}` : '/api/leadership';
      
      const payload = {
        ...editingItem,
        twitter: editingItem.x || editingItem.twitter || '',
        x: editingItem.x || editingItem.twitter || '',
        instagram: editingItem.instagram || '',
        linkedin: editingItem.linkedin || ''
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
          throw new Error('انتهت الجلسة، يرجى إعادة تسجيل الدخول / Session expired.');
        }
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Failed to save leadership member');
      }
      
      showToast(editingItem.id ? 'تم تحديث بيانات القائد بنجاح' : 'تمت إضافة القائد بنجاح', 'success');
      setEditingItem(null);
      fetchItems();
    } catch (err: any) {
      console.error('Save leadership error:', err);
      if (err.name === 'AbortError') {
        showToast('انتهت مهلة الطلب، يرجى المحاولة مرة أخرى', 'error');
      } else {
        showToast(err.message, 'error');
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
      const res = await fetch(`/api/leadership/${id}`, { method: 'DELETE', headers: getAuthHeaders(), credentials: 'include' });
      if (res.status === 401) {
        handleAuthError(res);
        return;
      }
      showToast('تم حذف العضو بنجاح', 'success');
      fetchItems();
    } catch (err: any) {
      showToast('تعذر حذف العضو', 'error');
      fetchItems();
    }
  };

  const getLinkHref = (urlOrHandle: string, platform: 'x' | 'instagram' | 'linkedin') => {
    if (!urlOrHandle) return '#';
    const clean = urlOrHandle.trim();
    if (clean.startsWith('http://') || clean.startsWith('https://')) return clean;
    const handle = clean.replace(/^@/, '');
    if (platform === 'x') return `https://x.com/${handle}`;
    if (platform === 'instagram') return `https://instagram.com/${handle}`;
    if (platform === 'linkedin') return clean.includes('linkedin.com') ? `https://${clean}` : `https://linkedin.com/in/${handle}`;
    return `https://${clean}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-[#FFC400] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <AnimatePresence>
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">
            COMMAND_STRUCTURE
          </span>
          <h1 className="font-syncopate text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            LEADERSHIP
          </h1>
          <p className="text-slate-400 font-inter text-xs mt-2">
            إدارة قيادات المنظمة، حسابات X، وInstagram، والصور الشخصية
          </p>
        </div>
        <ArenaButton onClick={handleOpenAdd}>
          <Plus size={18} className="mr-2" /> ADD_MEMBER
        </ArenaButton>
      </header>

      {items.length === 0 ? (
        <div className="p-12 text-center border border-white/5 bg-[#081B3A] text-slate-400 font-inter text-sm">
          لا يوجد أعضاء قيادة حالياً. اضغط على <strong className="text-[#FFC400]">ADD_MEMBER</strong> لإضافة أول عضو.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {items.map((item) => {
            const xVal = item.x || item.twitter;
            const instaVal = item.instagram;
            const linkedinVal = item.linkedin;

            return (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#081B3A] border border-white/5 p-8 group relative overflow-hidden flex flex-col justify-between"
              >
                <div className="absolute top-0 left-0 w-1 h-0 bg-[#FFC400] group-hover:h-full transition-all duration-500" />
                
                <div>
                  <div className="flex items-center gap-6 mb-6">
                    <div className="w-20 h-20 bg-[#040E1E] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <ImageIcon className="text-slate-700" size={28} />
                      )}
                    </div>
                    <div>
                      <h3 className="font-syncopate text-lg font-black text-white uppercase tracking-tighter">{item.name}</h3>
                      <p className="text-[#FFC400] font-syncopate text-[9px] font-bold tracking-widest uppercase mt-0.5">{item.role}</p>
                      {item.display_order !== undefined && (
                        <span className="text-slate-500 font-mono text-[9px] block mt-1">Order: #{item.display_order}</span>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-400 font-inter text-xs mb-6 line-clamp-3 leading-relaxed">
                    {item.description || 'No bio description provided.'}
                  </p>

                  {/* Social Accounts Badges & Links */}
                  <div className="flex flex-wrap items-center gap-2 mb-6 min-h-[28px]">
                    {xVal ? (
                      <a 
                        href={getLinkHref(xVal, 'x')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-sky-500/10 hover:bg-sky-500/20 text-sky-400 border border-sky-500/20 text-[10px] font-mono rounded transition-colors"
                        title={xVal}
                      >
                        <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                        <span>X: {xVal.replace(/^https?:\/\/(www\.)?(x|twitter)\.com\//, '@')}</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-800/40 text-slate-600 text-[9px] font-mono rounded">NO X</span>
                    )}

                    {instaVal ? (
                      <a 
                        href={getLinkHref(instaVal, 'instagram')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-pink-500/10 hover:bg-pink-500/20 text-pink-400 border border-pink-500/20 text-[10px] font-mono rounded transition-colors"
                        title={instaVal}
                      >
                        <Instagram size={11} />
                        <span>IG: {instaVal.replace(/^https?:\/\/(www\.)?instagram\.com\//, '@')}</span>
                        <ExternalLink size={10} />
                      </a>
                    ) : (
                      <span className="px-2 py-0.5 bg-slate-800/40 text-slate-600 text-[9px] font-mono rounded">NO INSTA</span>
                    )}

                    {linkedinVal && (
                      <a 
                        href={getLinkHref(linkedinVal, 'linkedin')}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 text-[10px] font-mono rounded transition-colors"
                        title={linkedinVal}
                      >
                        <Linkedin size={11} />
                        <span>LinkedIn</span>
                        <ExternalLink size={10} />
                      </a>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-2">
                  <span className={`px-3 py-1 rounded-full text-[8px] font-black tracking-widest ${item.published ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                    {item.published ? 'PUBLISHED' : 'DRAFT'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => handleOpenEdit(item)} 
                      className="p-3 bg-white/5 hover:bg-blue-500/20 text-slate-400 hover:text-blue-400 transition-colors"
                      title="Edit Member"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => setDeleteTarget({ id: item.id, name: item.name })} 
                      className="p-3 bg-white/5 hover:bg-red-500/20 text-slate-400 hover:text-red-400 transition-colors"
                      title="Delete Member"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

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
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 overflow-y-auto">
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm" onClick={() => setEditingItem(null)} />
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#081B3A] border border-white/10 w-full max-w-2xl relative z-10 overflow-hidden my-auto max-h-[92vh] flex flex-col"
          >
            <div className="absolute top-0 left-0 w-full h-1 bg-[#FFC400]" />
            <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between shrink-0">
              <div>
                <h2 className="font-syncopate text-xl font-black text-white uppercase tracking-tighter">
                  {editingItem.id ? 'EDIT_LEADERSHIP_MEMBER' : 'ADD_LEADERSHIP_MEMBER'}
                </h2>
                <p className="text-slate-400 font-inter text-xs mt-1">
                  أدخل تفاصيل القائد بما فيها حسابات X (تويتر) و Instagram
                </p>
              </div>
              <button onClick={() => setEditingItem(null)} className="text-slate-500 hover:text-white p-2">
                <CloseIcon size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 md:p-8 space-y-6 overflow-y-auto">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Full Name *</label>
                  <input 
                    type="text" 
                    value={editingItem.name || ''}
                    onChange={e => setEditingItem({...editingItem, name: e.target.value})}
                    placeholder="e.g. KISHAN"
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Executive Role / Title *</label>
                  <input 
                    type="text" 
                    value={editingItem.role || ''}
                    onChange={e => setEditingItem({...editingItem, role: e.target.value})}
                    placeholder="e.g. FOUNDER & CEO"
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Bio / Description</label>
                <textarea 
                  value={editingItem.description || ''}
                  onChange={e => setEditingItem({...editingItem, description: e.target.value})}
                  placeholder="Executive bio, strategic vision, or leadership background..."
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-inter text-xs focus:outline-none focus:border-[#FFC400] h-24 resize-none leading-relaxed"
                />
              </div>

              <ImageUploader 
                label="Executive Headshot Photo" 
                value={editingItem.image || ''} 
                onChange={(url) => setEditingItem({ ...editingItem, image: url })}
                aspectRatio="square"
              />

              {/* Social Accounts Section */}
              <div className="border border-white/5 bg-[#040E1E]/50 p-6 space-y-4">
                <span className="text-[#FFC400] font-syncopate text-[9px] font-bold tracking-widest uppercase block mb-2">
                  SOCIAL ACCOUNTS // شبكات التواصل الاجتماعي
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* X (Twitter) Account */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 font-syncopate text-[8px] text-sky-400 font-bold uppercase tracking-widest">
                      <svg className="w-3 h-3 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
                      <span>X Account / URL</span>
                    </label>
                    <input 
                      type="text" 
                      value={editingItem.x || editingItem.twitter || ''}
                      onChange={e => setEditingItem({...editingItem, x: e.target.value, twitter: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="https://x.com/username or @username"
                    />
                  </div>

                  {/* Instagram Account */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 font-syncopate text-[8px] text-pink-400 font-bold uppercase tracking-widest">
                      <Instagram size={12} />
                      <span>Instagram / URL</span>
                    </label>
                    <input 
                      type="text" 
                      value={editingItem.instagram || ''}
                      onChange={e => setEditingItem({...editingItem, instagram: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="https://instagram.com/username or @username"
                    />
                  </div>

                  {/* LinkedIn Account */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-1.5 font-syncopate text-[8px] text-blue-400 font-bold uppercase tracking-widest">
                      <Linkedin size={12} />
                      <span>LinkedIn URL</span>
                    </label>
                    <input 
                      type="text" 
                      value={editingItem.linkedin || ''}
                      onChange={e => setEditingItem({...editingItem, linkedin: e.target.value})}
                      className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                      placeholder="https://linkedin.com/in/..."
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">Display Order (ترتيب الظهور)</label>
                  <input 
                    type="number" 
                    value={editingItem.display_order ?? 0}
                    onChange={e => setEditingItem({...editingItem, display_order: parseInt(e.target.value) || 0})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-mono text-xs focus:outline-none focus:border-[#FFC400]"
                    placeholder="0"
                  />
                </div>

                <div className="flex items-center gap-8 pt-6">
                  <label className="flex items-center gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={editingItem.published === 1}
                      onChange={e => setEditingItem({...editingItem, published: e.target.checked ? 1 : 0})}
                      className="w-5 h-5 bg-[#040E1E] border-slate-800 rounded-none checked:bg-[#FFC400] transition-colors"
                    />
                    <span className="font-syncopate text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-[#FFC400]">
                      Published (ظاهر في الموقع)
                    </span>
                  </label>
                </div>
              </div>

              <div className="pt-6 border-t border-white/5 flex justify-end gap-4">
                <button 
                  type="button" 
                  onClick={() => setEditingItem(null)} 
                  className="px-6 py-3 font-syncopate text-[10px] font-bold uppercase tracking-widest text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
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

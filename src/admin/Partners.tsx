import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Building2, ExternalLink, Eye, EyeOff, CheckCircle2, AlertCircle, Image as ImageIcon } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';
import ImageUploader from '../components/ImageUploader';
import { ToastNotification } from './components/Toast';
import { getAuthHeaders, handleAuthError } from './utils/api';

interface Partner {
  id?: number | string;
  name: string;
  category: string;
  description: string;
  image?: string;
  url?: string;
  display_order?: number;
  published?: boolean | number;
}

const DEFAULT_CATEGORIES = [
  'PARENT COMPANY',
  'GLOBAL PARTNER',
  'OFFICIAL SPONSOR',
  'ENDEMIC SPONSOR',
  'TECHNICAL SPONSOR',
  'PERIPHERAL SPONSOR',
  'MEDIA PARTNER'
];

const AdminPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name?: string } | null>(null);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
  };

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/partners');
      if (res.ok) {
        const data = await res.json();
        setPartners(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('Failed to fetch partners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPartners();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPartner) return;

    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    try {
      const isEdit = !!editingPartner.id;
      const url = isEdit ? `/api/partners/${editingPartner.id}` : '/api/partners';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...editingPartner,
        display_order: Number(editingPartner.display_order ?? 0),
        published: editingPartner.published ? 1 : 0
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
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to save partner');
      }

      showToast(isEdit ? 'تم تحديث الشريك بنجاح' : 'تمت إضافة الشريك بنجاح', 'success');
      setEditingPartner(null);
      fetchPartners();
    } catch (err: any) {
      console.error('Error saving partner:', err);
      if (err.name === 'AbortError') {
        showToast('انتهت مهلة الطلب، يرجى المحاولة مرة أخرى', 'error');
      } else {
        showToast(err.message || 'Error occurred while saving.', 'error');
      }
    } finally {
      setSaving(false);
      clearTimeout(timeoutId);
    }
  };

  const togglePublish = async (partner: Partner) => {
    try {
      const newStatus = partner.published ? 0 : 1;
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify({ ...partner, published: newStatus })
      });
      if (res.status === 401) {
        handleAuthError(res);
        return;
      }
      if (res.ok) {
        setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, published: newStatus } : p));
        showToast(`تم ${newStatus ? 'نشر' : 'إخفاء'} الشريك بنجاح`, 'success');
      }
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/partners/${deleteTarget.id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
        credentials: 'include'
      });

      if (res.status === 401) {
        handleAuthError(res);
        return;
      }

      if (res.ok) {
        showToast('تم حذف الشريك بنجاح', 'success');
        setPartners(prev => prev.filter(p => p.id !== deleteTarget.id));
      } else {
        throw new Error('Failed to delete partner');
      }
    } catch (err: any) {
      showToast(err.message || 'Error deleting partner.', 'error');
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredPartners = partners.filter(p =>
    (p.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
    (p.description || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <AnimatePresence>
        {toast && (
          <ToastNotification
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-2 block uppercase">
            CORPORATE_MANAGEMENT
          </span>
          <h1 className="font-syncopate text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            CORPORATE PARTNERS
          </h1>
          <p className="text-slate-400 font-inter text-xs mt-2">
            إدارة شركاء ورعاة المنظمة الرسميين، الشعارات، والتصنيفات والروابط
          </p>
        </div>
        <ArenaButton
          type="button"
          onClick={() => setEditingPartner({
            name: '',
            category: 'OFFICIAL SPONSOR',
            description: '',
            image: '',
            url: '',
            display_order: partners.length + 1,
            published: 1
          })}
        >
          <Plus size={18} className="mr-2" /> ADD NEW PARTNER
        </ArenaButton>
      </div>

      {/* Search Bar */}
      <div className="bg-[#081B3A] border border-white/5 p-4 flex items-center gap-4">
        <div className="relative flex-grow">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input
            type="text"
            placeholder="Search corporate partners..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-[#040E1E] border border-slate-800 text-white pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-[#FFC400]"
          />
        </div>
      </div>

      {/* Grid of Partners */}
      {loading ? (
        <div className="py-20 text-center text-slate-500 font-syncopate text-xs">
          <div className="w-8 h-8 border-2 border-[#FFC400] border-t-transparent animate-spin mx-auto mb-4" />
          LOADING PARTNERS DATABASE...
        </div>
      ) : filteredPartners.length === 0 ? (
        <div className="py-20 text-center text-slate-500 font-syncopate text-xs bg-[#081B3A] border border-white/5 p-12">
          NO PARTNERS FOUND. CLICK "ADD NEW PARTNER" TO CREATE ONE.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {filteredPartners.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-[#081B3A]/60 border border-slate-800 hover:border-[#FFC400]/40 transition-all duration-300 p-6 flex flex-col justify-between relative group"
            >
              <div>
                <div className="h-20 w-full mb-4 flex items-center justify-center bg-[#040E1E] p-3 border border-slate-800">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center gap-1 text-slate-600">
                      <ImageIcon size={24} />
                      <span className="text-[9px] font-mono">NO LOGO</span>
                    </div>
                  )}
                </div>

                <span className="text-[#FFC400] font-syncopate text-[9px] tracking-[0.2em] uppercase font-bold block mb-1">
                  {item.category}
                </span>
                <h3 className="font-syncopate text-lg font-black text-white uppercase tracking-wider group-hover:text-[#FFC400] transition-colors">
                  {item.name}
                </h3>
                <p className="text-slate-400 font-inter text-xs leading-relaxed mt-2 line-clamp-3">
                  {item.description}
                </p>
                {item.url && (
                  <a
                    href={item.url.startsWith('http') ? item.url : `https://${item.url}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-[#FFC400] hover:underline mt-3 font-mono transition-colors"
                  >
                    <ExternalLink size={12} /> {item.url.replace(/^https?:\/\//, '')}
                  </a>
                )}
              </div>

              <div className="pt-6 mt-6 border-t border-white/5 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => togglePublish(item)}
                  className={`px-2.5 py-1 text-[9px] font-syncopate font-black rounded tracking-widest flex items-center gap-1.5 ${
                    item.published
                      ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                      : 'bg-amber-500/10 text-amber-400 hover:bg-amber-500/20'
                  }`}
                >
                  {item.published ? <Eye size={12} /> : <EyeOff size={12} />}
                  {item.published ? 'PUBLISHED' : 'DRAFT'}
                </button>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setEditingPartner(item)}
                    className="p-2 bg-slate-800/80 hover:bg-[#FFC400] hover:text-black text-white transition-colors"
                    title="Edit Partner"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget({ id: item.id!, name: item.name })}
                    className="p-2 bg-slate-800/80 hover:bg-red-500 hover:text-white text-slate-400 transition-colors"
                    title="Delete Partner"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Edit / Add Modal */}
      {editingPartner && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#081B3A] border border-[#FFC400]/30 w-full max-w-xl p-8 max-h-[90vh] overflow-y-auto space-y-6"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="font-syncopate text-xl font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Building2 className="text-[#FFC400]" size={20} />
                {editingPartner.id ? 'EDIT CORPORATE PARTNER' : 'NEW CORPORATE PARTNER'}
              </h2>
              <button
                onClick={() => setEditingPartner(null)}
                className="text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-5">
              <div>
                <label className="block text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-2">
                  PARTNER NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PREDATOR GAMING"
                  value={editingPartner.name || ''}
                  onChange={e => setEditingPartner({ ...editingPartner, name: e.target.value })}
                  className="w-full bg-[#040E1E] border border-slate-800 text-white p-3 text-sm focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-2">
                  CATEGORY / SPONSORSHIP TYPE *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. OFFICIAL SPONSOR, TECHNICAL SPONSOR"
                  value={editingPartner.category || ''}
                  onChange={e => setEditingPartner({ ...editingPartner, category: e.target.value })}
                  className="w-full bg-[#040E1E] border border-slate-800 text-white p-3 text-sm focus:outline-none focus:border-[#FFC400]"
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  {DEFAULT_CATEGORIES.map(cat => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEditingPartner({ ...editingPartner, category: cat })}
                      className="px-2 py-1 text-[9px] bg-slate-800/60 hover:bg-[#FFC400]/20 text-slate-300 hover:text-[#FFC400] border border-slate-700 font-mono uppercase"
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              <ImageUploader
                label="Partner Official Logo"
                value={editingPartner.image || ''}
                onChange={(url) => setEditingPartner({ ...editingPartner, image: url })}
                aspectRatio="banner"
              />

              <div>
                <label className="block text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-2">
                  DESCRIPTION / TAGLINE *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Official High-Performance PC Partner"
                  value={editingPartner.description || ''}
                  onChange={e => setEditingPartner({ ...editingPartner, description: e.target.value })}
                  className="w-full bg-[#040E1E] border border-slate-800 text-white p-3 text-sm focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-2">
                  WEBSITE URL (OPTIONAL)
                </label>
                <input
                  type="url"
                  placeholder="https://partnerwebsite.com"
                  value={editingPartner.url || ''}
                  onChange={e => setEditingPartner({ ...editingPartner, url: e.target.value })}
                  className="w-full bg-[#040E1E] border border-slate-800 text-white p-3 text-sm focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                <div>
                  <label className="block text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-2">
                    DISPLAY ORDER (ترتيب العرض)
                  </label>
                  <input
                    type="number"
                    value={editingPartner.display_order ?? 0}
                    onChange={e => setEditingPartner({ ...editingPartner, display_order: parseInt(e.target.value) || 0 })}
                    className="w-full bg-[#040E1E] border border-slate-800 text-white p-3 text-sm focus:outline-none focus:border-[#FFC400]"
                  />
                </div>

                <div className="flex items-center gap-3 pt-6">
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!editingPartner.published}
                      onChange={e => setEditingPartner({ ...editingPartner, published: e.target.checked ? 1 : 0 })}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC400]"></div>
                  </label>
                  <span className="font-syncopate text-xs font-bold text-white uppercase">
                    PUBLISH SITE-WIDE (ظاهر بالموقع)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => setEditingPartner(null)}
                  className="px-6 py-3 border border-slate-700 text-slate-300 font-syncopate text-xs tracking-wider uppercase hover:bg-slate-800"
                >
                  CANCEL
                </button>
                <ArenaButton type="submit" disabled={saving}>
                  {saving ? 'SAVING...' : 'SAVE PARTNER'}
                </ArenaButton>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <ConfirmDeleteModal
          isOpen={!!deleteTarget}
          title="DELETE CORPORATE PARTNER"
          itemName={deleteTarget.name}
          description={`Are you sure you want to delete corporate partner "${deleteTarget.name}"? This action cannot be undone.`}
          onConfirm={executeDelete}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
};

export default AdminPartners;

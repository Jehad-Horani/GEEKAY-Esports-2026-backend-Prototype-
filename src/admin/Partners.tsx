import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Search, Building2, ExternalLink, Eye, EyeOff, CheckCircle2, AlertCircle } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import ConfirmDeleteModal from '../components/ConfirmDeleteModal';

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
  'ENDEMIC SPONSOR',
  'TECHNICAL SPONSOR',
  'PERIPHERAL SPONSOR',
  'GLOBAL PARTNER',
  'OFFICIAL SPONSOR'
];

const AdminPartners = () => {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingPartner, setEditingPartner] = useState<Partner | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<{ id: number | string; name?: string } | null>(null);
  const [search, setSearch] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  const fetchPartners = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/partners');
      if (res.ok) {
        const data = await res.json();
        setPartners(data);
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
    setStatusMsg({ type: null, message: '' });

    try {
      const isEdit = !!editingPartner.id;
      const url = isEdit ? `/api/partners/${editingPartner.id}` : '/api/partners';
      const method = isEdit ? 'PUT' : 'POST';

      const payload = {
        ...editingPartner,
        display_order: Number(editingPartner.display_order || 0),
        published: editingPartner.published ? 1 : 0
      };

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Failed to save partner');
      }

      setStatusMsg({
        type: 'success',
        message: `Partner "${editingPartner.name}" ${isEdit ? 'updated' : 'created'} successfully!`
      });

      setEditingPartner(null);
      fetchPartners();
    } catch (err: any) {
      console.error('Error saving partner:', err);
      setStatusMsg({
        type: 'error',
        message: err.message || 'Error occurred while saving.'
      });
    } finally {
      setSaving(false);
    }
  };

  const togglePublish = async (partner: Partner) => {
    try {
      const newStatus = partner.published ? 0 : 1;
      const res = await fetch(`/api/partners/${partner.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...partner, published: newStatus })
      });
      if (res.ok) {
        setPartners(prev => prev.map(p => p.id === partner.id ? { ...p, published: newStatus } : p));
      }
    } catch (err) {
      console.error('Failed to toggle publish status:', err);
    }
  };

  const executeDelete = async () => {
    if (!deleteTarget) return;

    try {
      const res = await fetch(`/api/partners/${deleteTarget.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setStatusMsg({
          type: 'success',
          message: 'Partner removed successfully.'
        });
        setPartners(prev => prev.filter(p => p.id !== deleteTarget.id));
      } else {
        throw new Error('Failed to delete partner');
      }
    } catch (err: any) {
      setStatusMsg({
        type: 'error',
        message: err.message || 'Error deleting partner.'
      });
    } finally {
      setDeleteTarget(null);
    }
  };

  const filteredPartners = partners.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-2 block uppercase">
            CORPORATE_MANAGEMENT
          </span>
          <h1 className="font-syncopate text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
            CORPORATE PARTNERS
          </h1>
        </div>
        <ArenaButton
          type="button"
          onClick={() => setEditingPartner({
            name: '',
            category: 'ENDEMIC SPONSOR',
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

      {statusMsg.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border flex items-center gap-3 font-syncopate text-xs tracking-wider ${
            statusMsg.type === 'success'
              ? 'bg-green-950/60 border-green-500 text-green-300'
              : 'bg-red-950/60 border-red-500 text-red-300'
          }`}
        >
          {statusMsg.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{statusMsg.message}</span>
        </motion.div>
      )}

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
              {item.image && (
                <div className="h-16 w-full mb-4 flex items-center justify-center bg-[#040E1E] p-2 border border-slate-800">
                  <img src={item.image} alt={item.name} className="max-h-full max-w-full object-contain" />
                </div>
              )}

              <div>
                <span className="text-[#FFC400] font-syncopate text-[9px] tracking-[0.2em] uppercase font-bold block mb-1">
                  {item.category}
                </span>
                <h3 className="font-syncopate text-lg font-black text-white uppercase tracking-wider group-hover:text-[#FFC400] transition-colors">
                  {item.name}
                </h3>
                <p className="text-slate-400 font-inter text-xs leading-relaxed mt-3 line-clamp-3">
                  {item.description}
                </p>
                {item.url && (
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-[#FFC400] mt-3 font-mono transition-colors"
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

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-2">
                  PARTNER NAME *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PREDATOR GAMING"
                  value={editingPartner.name}
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
                  placeholder="e.g. ENDEMIC SPONSOR, TECHNICAL SPONSOR"
                  value={editingPartner.category}
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

              <div>
                <label className="block text-slate-400 font-syncopate text-[10px] tracking-widest uppercase mb-2">
                  DESCRIPTION / TAGLINE *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="e.g. Official High-Performance PC Partner"
                  value={editingPartner.description}
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
                    DISPLAY ORDER
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
                    PUBLISH SITE-WIDE
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

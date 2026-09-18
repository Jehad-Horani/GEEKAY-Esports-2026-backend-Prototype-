import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X, PlusCircle, Save, CheckCircle2 } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  actionType?: 'create' | 'edit' | 'delete';
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  actionType = 'delete',
  title,
  description,
  itemName,
  loading = false,
}) => {
  if (!isOpen) return null;

  const isCreate = actionType === 'create';
  const isEdit = actionType === 'edit';
  const isDelete = actionType === 'delete';

  const defaultTitle = isCreate 
    ? 'CONFIRM CREATION' 
    : isEdit 
    ? 'CONFIRM CHANGES' 
    : 'CONFIRM DELETION';

  const defaultDescription = isCreate
    ? 'Are you sure you want to add this new record to the database?'
    : isEdit
    ? 'Are you sure you want to save modifications and update the records?'
    : 'Are you sure you want to permanently delete this item? This action cannot be undone.';

  const modalTitle = title || defaultTitle;
  const modalDescription = description || defaultDescription;

  // Accent styling based on action
  const topAccent = isCreate
    ? 'bg-gradient-to-r from-amber-500 via-[#FFC400] to-amber-500'
    : isEdit
    ? 'bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500'
    : 'bg-gradient-to-r from-red-600 via-rose-500 to-red-600';

  const borderColor = isCreate
    ? 'border-[#FFC400]/40'
    : isEdit
    ? 'border-cyan-500/40'
    : 'border-red-500/40';

  const iconBg = isCreate
    ? 'bg-[#FFC400]/10 border-[#FFC400]/30 text-[#FFC400]'
    : isEdit
    ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400'
    : 'bg-red-500/10 border-red-500/30 text-red-500';

  const badgeColor = isCreate
    ? 'text-[#FFC400]'
    : isEdit
    ? 'text-cyan-400'
    : 'text-red-500';

  const badgeText = isCreate
    ? 'CREATION ACTION'
    : isEdit
    ? 'MODIFICATION ACTION'
    : 'DANGER ZONE';

  const confirmBtnStyle = isCreate
    ? 'bg-[#FFC400] hover:bg-amber-400 text-black shadow-lg shadow-[#FFC400]/20'
    : isEdit
    ? 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-lg shadow-cyan-500/20'
    : 'bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-600/20';

  const confirmBtnLabel = isCreate
    ? (loading ? 'ADDING...' : 'CONFIRM & ADD')
    : isEdit
    ? (loading ? 'SAVING...' : 'CONFIRM & SAVE')
    : (loading ? 'DELETING...' : 'CONFIRM & DELETE');

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          className={`bg-[#081B3A] border ${borderColor} max-w-md w-full p-6 md:p-8 relative shadow-2xl overflow-hidden`}
        >
          {/* Top accent line */}
          <div className={`absolute top-0 left-0 right-0 h-1.5 ${topAccent}`} />

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className={`w-16 h-16 rounded-full border flex items-center justify-center mb-2 ${iconBg}`}>
              {isCreate && <PlusCircle size={32} />}
              {isEdit && <Save size={32} />}
              {isDelete && <AlertTriangle size={32} />}
            </div>

            <div className="space-y-2">
              <span className={`font-syncopate text-[10px] tracking-[0.3em] font-bold block uppercase ${badgeColor}`}>
                {badgeText}
              </span>
              <h3 className="font-syncopate text-lg md:text-xl font-black text-white uppercase tracking-tight">
                {modalTitle}
              </h3>
            </div>

            {itemName && (
              <div className="bg-white/5 border border-white/10 px-4 py-2 text-amber-400 font-mono text-sm tracking-wide max-w-full truncate">
                "{itemName}"
              </div>
            )}

            <p className="text-slate-300 font-inter text-xs leading-relaxed max-w-sm">
              {modalDescription}
            </p>

            <div className="flex items-center gap-3 w-full pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 px-3 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-syncopate text-[10px] sm:text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className={`flex-1 py-3 px-3 font-syncopate text-[10px] sm:text-[11px] font-bold uppercase tracking-wider transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50 ${confirmBtnStyle}`}
              >
                {isCreate && <CheckCircle2 size={15} />}
                {isEdit && <Save size={15} />}
                {isDelete && <Trash2 size={15} />}
                <span>{confirmBtnLabel}</span>
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export const ActionConfirmModal = ConfirmDeleteModal;
export default ConfirmDeleteModal;

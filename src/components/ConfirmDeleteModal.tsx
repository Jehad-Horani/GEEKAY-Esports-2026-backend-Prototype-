import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, AlertTriangle, X } from 'lucide-react';

interface ConfirmDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title?: string;
  description?: string;
  itemName?: string;
  loading?: boolean;
}

export const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title = "CONFIRM_DELETION",
  description = "Are you sure you want to delete this item? This action cannot be undone.",
  itemName,
  loading = false,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-[#081B3A] border border-red-500/30 max-w-md w-full p-6 md:p-8 relative shadow-2xl overflow-hidden"
        >
          {/* Top accent line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-red-600" />

          {/* Close button */}
          <button
            onClick={onClose}
            disabled={loading}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors p-2"
          >
            <X size={20} />
          </button>

          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center text-red-500 mb-2">
              <AlertTriangle size={32} />
            </div>

            <div className="space-y-2">
              <span className="text-red-500 font-syncopate text-[10px] tracking-[0.4em] font-bold block uppercase">
                DANGER_ZONE
              </span>
              <h3 className="font-syncopate text-xl font-black text-white uppercase tracking-tight">
                {title}
              </h3>
            </div>

            {itemName && (
              <div className="bg-white/5 border border-white/10 px-4 py-2 text-amber-400 font-mono text-sm tracking-wide max-w-full truncate">
                "{itemName}"
              </div>
            )}

            <p className="text-slate-300 font-inter text-xs leading-relaxed max-w-xs">
              {description}
            </p>

            <div className="flex items-center gap-4 w-full pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-syncopate text-[11px] font-bold uppercase tracking-widest transition-colors disabled:opacity-50"
              >
                CANCEL
              </button>
              <button
                type="button"
                onClick={onConfirm}
                disabled={loading}
                className="flex-1 py-3 px-4 bg-red-600 hover:bg-red-700 text-white font-syncopate text-[11px] font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-lg shadow-red-600/20"
              >
                <Trash2 size={16} />
                {loading ? 'DELETING...' : 'DELETE'}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ConfirmDeleteModal;

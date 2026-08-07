import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, ExternalLink, X } from 'lucide-react';
import { useSettings } from '../context/SettingsContext';

export const AnnouncementBar: React.FC = () => {
  const { settings } = useSettings();
  const [dismissed, setDismissed] = useState(false);

  const isActive = settings.announcement_active === true || settings.announcement_active === 'true';
  const text = settings.site_announcement;
  const badge = settings.announcement_badge || 'OFFICIAL BRIEFING';
  const link = settings.announcement_link;

  if (!isActive || !text || dismissed) {
    return null;
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 50, opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed bottom-0 left-0 w-full z-[150] bg-[#040E1E]/95 backdrop-blur-md border-t border-[#FFC400]/40 text-white overflow-hidden shadow-[0_-4px_25px_rgba(0,0,0,0.8)]"
      >
        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#FFC400] to-transparent animate-pulse" />
        
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4 text-xs font-syncopate">
          <div className="flex items-center gap-3 overflow-hidden flex-1">
            <span className="shrink-0 px-2.5 py-0.5 bg-[#FFC400] text-black font-bold text-[9px] tracking-widest uppercase flex items-center gap-1.5 shadow-[0_0_10px_rgba(255,196,0,0.4)]">
              <Megaphone size={12} className="animate-bounce" />
              {badge}
            </span>
            
            <span className="text-slate-200 text-[10px] md:text-xs font-medium tracking-wider truncate">
              {text}
            </span>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            {link && (
              <a
                href={link}
                target={link.startsWith('http') ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-[#FFC400] hover:text-white hover:underline transition-colors tracking-widest uppercase"
              >
                DISCOVER <ExternalLink size={12} />
              </a>
            )}

            <button
              onClick={() => setDismissed(true)}
              className="p-1 text-slate-400 hover:text-white transition-colors rounded-sm hover:bg-white/10"
              aria-label="Close Announcement"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AnnouncementBar;

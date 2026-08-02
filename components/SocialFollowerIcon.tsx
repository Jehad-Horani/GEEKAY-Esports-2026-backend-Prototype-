import React from 'react';
import { motion } from 'framer-motion';
import { 
  Twitter, 
  Twitch, 
  Instagram, 
  Youtube, 
  Facebook, 
  Send, 
  Globe,
  Radio
} from 'lucide-react';

const TikTokIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.17-2.86-.6-4.12-1.31a6.417 6.417 0 0 1-1.87-1.55v7.64c-.03 2.34-.84 4.64-2.6 6.12-1.35 1.15-3.11 1.81-4.88 1.87-2.32.14-4.79-.92-6.07-2.84-1.21-1.88-1.16-4.5.43-6.16 1.14-1.18 2.86-1.77 4.47-1.61v4.02c-.69-.06-1.47.11-2.01.54-.54.43-.77 1.18-.57 1.85.17.75.95 1.29 1.71 1.25.75-.02 1.4-.65 1.44-1.39.03-3.3.02-6.6.03-9.91V0h.07z"/>
  </svg>
);

const KickIcon = ({ size = 20, className = "" }) => (
  <span className={`font-syncopate font-black italic ${className}`} style={{ fontSize: size * 0.8 }}>K</span>
);

const SoopIcon = ({ size = 20, className = "" }) => (
  <motion.div
    className={`rounded-full bg-current ${className}`}
    style={{ width: size, height: size }}
  />
);

interface SocialFollowerIconProps {
  platform: string;
  count?: string;
  size?: number;
  className?: string;
}

const SocialFollowerIcon: React.FC<SocialFollowerIconProps> = ({ platform, count, size = 18, className = "" }) => {
  const getIcon = () => {
    switch (platform.toLowerCase()) {
      case 'twitter': return <Twitter size={size} />;
      case 'twitch': return <Twitch size={size} />;
      case 'instagram': return <Instagram size={size} />;
      case 'youtube': return <Youtube size={size} />;
      case 'tiktok': return <TikTokIcon size={size} />;
      case 'facebook': return <Facebook size={size} />;
      case 'telegram': return <Send size={size} />;
      case 'kick': return <KickIcon size={size} />;
      case 'soop': return <SoopIcon size={size} />;
      default: return <Globe size={size} />;
    }
  };

  const getLabel = () => {
    if (!count) return '';
    if (count.toLowerCase().includes('k') || count.toLowerCase().includes('m')) return count;
    const num = parseInt(count.replace(/,/g, ''));
    if (isNaN(num)) return count;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return count;
  };

  return (
    <div className="group/soc relative flex items-center justify-center">
      <div className={`transition-all duration-300 group-hover/soc:text-[#FFC400] group-hover/soc:scale-110 ${className}`}>
        {getIcon()}
      </div>
      
      {/* Follower Count Bubble */}
      {count && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-[#FFC400] text-black px-2 py-1 rounded font-syncopate text-[8px] font-black whitespace-nowrap opacity-0 group-hover/soc:opacity-100 group-hover/soc:-translate-y-1 transition-all duration-300 pointer-events-none z-50 shadow-[0_0_15px_rgba(255,196,0,0.4)]">
          {getLabel()}
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FFC400] rotate-45" />
        </div>
      )}
    </div>
  );
};

export default SocialFollowerIcon;

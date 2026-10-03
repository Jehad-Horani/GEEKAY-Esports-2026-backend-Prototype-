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

const DiscordIcon = ({ size = 20, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.894.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
  </svg>
);

const SoopIcon = ({ size = 20, className = "" }) => (
  <motion.div
    className={`rounded-full bg-current ${className}`}
    style={{ width: size, height: size }}
  />
);

interface SocialFollowerIconProps {
  platform?: string;
  count?: string;
  size?: number;
  className?: string;
}

const SocialFollowerIcon: React.FC<SocialFollowerIconProps> = ({ platform = '', count, size = 18, className = "" }) => {
  const safePlatform = (platform || '').toString().toLowerCase();

  const getIcon = () => {
    switch (safePlatform) {
      case 'twitter':
      case 'x': return <Twitter size={size} />;
      case 'twitch': return <Twitch size={size} />;
      case 'instagram': return <Instagram size={size} />;
      case 'youtube': return <Youtube size={size} />;
      case 'tiktok': return <TikTokIcon size={size} />;
      case 'facebook': return <Facebook size={size} />;
      case 'discord': return <DiscordIcon size={size} />;
      case 'telegram': return <Send size={size} />;
      case 'kick': return <KickIcon size={size} />;
      case 'soop': return <SoopIcon size={size} />;
      default: return <Globe size={size} />;
    }
  };

  const getLabel = () => {
    if (!count) return '';
    const strCount = String(count);
    if (strCount.toLowerCase().includes('k') || strCount.toLowerCase().includes('m')) return strCount;
    const num = parseInt(strCount.replace(/,/g, ''));
    if (isNaN(num)) return strCount;
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return strCount;
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

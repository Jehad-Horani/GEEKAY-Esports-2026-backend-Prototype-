
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Save, Globe, Mail, Share2, Search, Shield } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';

const AdminSettings = () => {
  const [settings, setSettings] = useState<any>({
    general_email: 'general@geekay.com',
    partnerships_email: 'partnerships@geekay.com',
    business_email: 'business@geekay.com',
    careers_email: 'careers@geekay.com',
    twitter_url: 'https://twitter.com/geekayesports',
    twitch_url: 'https://twitch.tv/geekayesports',
    instagram_url: 'https://instagram.com/geekayesports',
    youtube_url: 'https://youtube.com/geekayesports',
    snapchat_url: 'https://snapchat.com/add/geekayesports',
    site_announcement: '',
    announcement_active: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        if (Object.keys(data).length > 0) {
          setSettings((prev: any) => ({ ...prev, ...data }));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    
    try {
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (!res.ok) throw new Error('Failed to save settings');
      
      alert('Settings saved successfully');
    } catch (err: any) {
      console.error('Save settings error:', err);
      if (err.name === 'AbortError') {
        alert('Request timed out. The server might be busy.');
      } else {
        alert(err.message);
      }
    } finally {
      setSaving(false);
      clearTimeout(timeoutId);
    }
  };

  return (
    <div className="space-y-12">
      <header>
        <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-4 block uppercase">GLOBAL_CONFIGURATION</span>
        <h1 className="font-syncopate text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">SETTINGS</h1>
      </header>

      <form onSubmit={handleSave} className="space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Contact Emails */}
          <div className="space-y-8">
            <h2 className="font-syncopate text-xl font-bold text-white tracking-widest uppercase flex items-center gap-4">
              <Mail size={20} className="text-[#FFC400]" />
              CONTACT_CHANNELS
            </h2>
            <div className="bg-[#081B3A] border border-white/5 p-8 space-y-6">
              {['general', 'partnerships', 'business', 'careers'].map(type => (
                <div key={type} className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">{type.toUpperCase()}_EMAIL</label>
                  <input 
                    type="email" 
                    value={settings[`${type}_email`]}
                    onChange={e => setSettings({...settings, [`${type}_email`]: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-8">
            <h2 className="font-syncopate text-xl font-bold text-white tracking-widest uppercase flex items-center gap-4">
              <Share2 size={20} className="text-[#FFC400]" />
              SOCIAL_PROTOCOLS
            </h2>
            <div className="bg-[#081B3A] border border-white/5 p-8 space-y-6">
              {['twitter', 'twitch', 'instagram', 'youtube', 'snapchat'].map(platform => (
                <div key={platform} className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">{platform.toUpperCase()}_URL</label>
                  <input 
                    type="text" 
                    value={settings[`${platform}_url`]}
                    onChange={e => setSettings({...settings, [`${platform}_url`]: e.target.value})}
                    className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Site Announcements */}
          <div className="space-y-8 lg:col-span-2">
            <h2 className="font-syncopate text-xl font-bold text-white tracking-widest uppercase flex items-center gap-4">
              <Globe size={20} className="text-[#FFC400]" />
              SITE_ANNOUNCEMENTS
            </h2>
            <div className="bg-[#081B3A] border border-white/5 p-8 space-y-8">
              <div className="flex items-center gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={settings.announcement_active}
                    onChange={e => setSettings({...settings, announcement_active: e.target.checked})}
                    className="w-5 h-5 bg-[#040E1E] border-slate-800 rounded-none checked:bg-[#FFC400] transition-colors"
                  />
                  <span className="font-syncopate text-[10px] font-bold text-white uppercase tracking-widest group-hover:text-[#FFC400]">Enable Announcement Bar</span>
                </label>
              </div>
              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-500 font-bold uppercase tracking-widest">Announcement Text</label>
                <input 
                  type="text" 
                  value={settings.site_announcement}
                  onChange={e => setSettings({...settings, site_announcement: e.target.value})}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  placeholder="e.g. GEEKAY PRO SHOP NOW OPEN IN UAE!"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/5 flex justify-end">
          <ArenaButton type="submit" disabled={saving || loading}>
            <Save size={18} className="mr-2" /> {saving ? 'SAVING...' : 'SAVE_GLOBAL_SETTINGS'}
          </ArenaButton>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

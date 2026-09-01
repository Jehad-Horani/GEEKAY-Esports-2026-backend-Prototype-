import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Save, Globe, Mail, Share2, MapPin, BarChart2, CheckCircle2, AlertCircle, Building2, ArrowRight } from 'lucide-react';
import ArenaButton from '../../components/ui/ArenaButton';
import { useSettings } from '../context/SettingsContext';

const AdminSettings = () => {
  const { settings: globalSettings, updateSettings } = useSettings();
  const [formData, setFormData] = useState<any>(globalSettings);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({
    type: null,
    message: ''
  });

  useEffect(() => {
    if (globalSettings) {
      setFormData(globalSettings);
    }
  }, [globalSettings]);

  const handleChange = (key: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveStatus({ type: null, message: '' });

    try {
      const success = await updateSettings(formData);
      if (success) {
        setSaveStatus({
          type: 'success',
          message: 'GLOBAL SETTINGS PERSISTED & PROPAGATED SITE-WIDE SUCCESSFULLY!'
        });
        setTimeout(() => setSaveStatus({ type: null, message: '' }), 5000);
      } else {
        throw new Error('Server returned error while saving settings');
      }
    } catch (err: any) {
      setSaveStatus({
        type: 'error',
        message: err.message || 'Failed to save settings. Please try again.'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-12 max-w-7xl mx-auto pb-20">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
        <div>
          <span className="text-[#FFC400] font-syncopate text-[10px] tracking-[0.6em] font-bold mb-2 block uppercase">SYSTEM_CONTROL</span>
          <h1 className="font-syncopate text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">GLOBAL SETTINGS</h1>
        </div>
        <ArenaButton type="button" onClick={handleSave} disabled={saving}>
          <Save size={18} className="mr-2" /> {saving ? 'SAVING...' : 'SAVE & APPLY ALL'}
        </ArenaButton>
      </header>

      {saveStatus.message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 border flex items-center gap-3 font-syncopate text-xs tracking-wider ${
            saveStatus.type === 'success'
              ? 'bg-green-950/60 border-green-500 text-green-300'
              : 'bg-red-950/60 border-red-500 text-red-300'
          }`}
        >
          {saveStatus.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <span>{saveStatus.message}</span>
        </motion.div>
      )}

      <form onSubmit={handleSave} className="space-y-12">
        {/* SECTION 1: SITE ANNOUNCEMENT BAR */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-[#FFC400] pl-4">
            <Globe size={22} className="text-[#FFC400]" />
            <h2 className="font-syncopate text-xl font-bold text-white tracking-wider uppercase">SITE_ANNOUNCEMENTS</h2>
          </div>

          <div className="bg-[#081B3A] border border-white/5 p-8 space-y-6">
            <div className="flex items-center justify-between p-4 bg-[#040E1E] border border-slate-800">
              <div className="space-y-1">
                <span className="font-syncopate text-xs font-bold text-white uppercase tracking-widest">ANNOUNCEMENT BAR STATUS</span>
                <p className="font-inter text-xs text-slate-400">Toggle whether the top notification bar appears site-wide.</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.announcement_active === true || formData.announcement_active === 'true'}
                  onChange={e => handleChange('announcement_active', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#FFC400]"></div>
              </label>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">BADGE TEXT</label>
                <input
                  type="text"
                  value={formData.announcement_badge || ''}
                  onChange={e => handleChange('announcement_badge', e.target.value)}
                  placeholder="e.g. OFFICIAL BRIEFING"
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">ANNOUNCEMENT MESSAGE</label>
                <input
                  type="text"
                  value={formData.site_announcement || ''}
                  onChange={e => handleChange('site_announcement', e.target.value)}
                  placeholder="e.g. GEEKAY PRO SHOP NOW OPEN IN UAE & KSA"
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">DESTINATION URL / LINK (OPTIONAL)</label>
                <input
                  type="text"
                  value={formData.announcement_link || ''}
                  onChange={e => handleChange('announcement_link', e.target.value)}
                  placeholder="e.g. https://www.geekay.com/en/"
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SOCIAL MEDIA CHANNELS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-[#FFC400] pl-4">
            <Share2 size={22} className="text-[#FFC400]" />
            <h2 className="font-syncopate text-xl font-bold text-white tracking-wider uppercase">SOCIAL_PROTOCOLS & URLS</h2>
          </div>

          <div className="bg-[#081B3A] border border-white/5 p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'twitter_url', label: 'X (TWITTER) URL', placeholder: 'https://twitter.com/geekayesports' },
              { id: 'twitch_url', label: 'TWITCH URL', placeholder: 'https://twitch.tv/geekayesports' },
              { id: 'instagram_url', label: 'INSTAGRAM URL', placeholder: 'https://instagram.com/geekayesports' },
              { id: 'youtube_url', label: 'YOUTUBE URL', placeholder: 'https://youtube.com/geekayesports' },
              { id: 'tiktok_url', label: 'TIKTOK URL', placeholder: 'https://tiktok.com/@geekayesports' },
              { id: 'facebook_url', label: 'FACEBOOK URL', placeholder: 'https://facebook.com/geekayesports' },
              { id: 'snapchat_url', label: 'SNAPCHAT URL', placeholder: 'https://snapchat.com/add/geekayesports' },
              { id: 'discord_url', label: 'DISCORD / COMMUNITY URL', placeholder: 'https://discord.gg/geekayesports' },
            ].map(item => (
              <div key={item.id} className="space-y-2">
                <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.label}</label>
                <input
                  type="text"
                  value={formData[item.id] || ''}
                  onChange={e => handleChange(item.id, e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 3: SOCIAL MEDIA METRICS & FOLLOWER COUNTS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-[#FFC400] pl-4">
            <BarChart2 size={22} className="text-[#FFC400]" />
            <h2 className="font-syncopate text-xl font-bold text-white tracking-wider uppercase">PLATFORM METRICS & FOLLOWER COUNTS</h2>
          </div>

          <div className="bg-[#081B3A] border border-white/5 p-8 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { id: 'instagram_count', label: 'INSTAGRAM' },
              { id: 'twitter_count', label: 'X (TWITTER)' },
              { id: 'tiktok_count', label: 'TIKTOK' },
              { id: 'youtube_count', label: 'YOUTUBE' },
              { id: 'twitch_count', label: 'TWITCH' },
              { id: 'facebook_count', label: 'FACEBOOK' },
            ].map(item => (
              <div key={item.id} className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">{item.label}</label>
                <input
                  type="text"
                  value={formData[item.id] || ''}
                  onChange={e => handleChange(item.id, e.target.value)}
                  placeholder=""
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs text-center focus:outline-none focus:border-[#FFC400]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: CONTACT CHANNELS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-[#FFC400] pl-4">
            <Mail size={22} className="text-[#FFC400]" />
            <h2 className="font-syncopate text-xl font-bold text-white tracking-wider uppercase">CONTACT_EMAILS</h2>
          </div>

          <div className="bg-[#081B3A] border border-white/5 p-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { id: 'general_email', label: 'GENERAL INQUIRIES EMAIL', placeholder: 'inquiries@geekay.com' },
              { id: 'partnerships_email', label: 'PARTNERSHIPS EMAIL', placeholder: 'business@geekay.com' },
              { id: 'business_email', label: 'BUSINESS EMAIL', placeholder: 'business@geekay.com' },
              { id: 'careers_email', label: 'CAREERS EMAIL', placeholder: 'careers@geekay.com' },
            ].map(item => (
              <div key={item.id} className="space-y-2">
                <label className="font-syncopate text-[9px] text-slate-400 font-bold uppercase tracking-widest">{item.label}</label>
                <input
                  type="email"
                  value={formData[item.id] || ''}
                  onChange={e => handleChange(item.id, e.target.value)}
                  placeholder={item.placeholder}
                  className="w-full bg-[#040E1E] border border-slate-800 p-4 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: OFFICE LOCATIONS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-[#FFC400] pl-4">
            <MapPin size={22} className="text-[#FFC400]" />
            <h2 className="font-syncopate text-xl font-bold text-white tracking-wider uppercase">OFFICE_LOCATIONS</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* RIYADH */}
            <div className="bg-[#081B3A] border border-white/5 p-8 space-y-4">
              <span className="font-syncopate text-xs font-bold text-[#FFC400] tracking-widest uppercase block mb-2">SAUDI ARABIA (RIYADH HQ)</span>
              
              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">ADDRESS</label>
                <input
                  type="text"
                  value={formData.riyadh_address || ''}
                  onChange={e => handleChange('riyadh_address', e.target.value)}
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">PHONE</label>
                  <input
                    type="text"
                    value={formData.riyadh_phone || ''}
                    onChange={e => handleChange('riyadh_phone', e.target.value)}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">EMAIL</label>
                  <input
                    type="text"
                    value={formData.riyadh_email || ''}
                    onChange={e => handleChange('riyadh_email', e.target.value)}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              </div>
            </div>

            {/* DUBAI */}
            <div className="bg-[#081B3A] border border-white/5 p-8 space-y-4">
              <span className="font-syncopate text-xs font-bold text-[#FFC400] tracking-widest uppercase block mb-2">UAE (DUBAI HUB)</span>

              <div className="space-y-2">
                <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">ADDRESS</label>
                <input
                  type="text"
                  value={formData.dubai_address || ''}
                  onChange={e => handleChange('dubai_address', e.target.value)}
                  className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">PHONE</label>
                  <input
                    type="text"
                    value={formData.dubai_phone || ''}
                    onChange={e => handleChange('dubai_phone', e.target.value)}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
                <div className="space-y-2">
                  <label className="font-syncopate text-[8px] text-slate-400 font-bold uppercase tracking-widest">EMAIL</label>
                  <input
                    type="text"
                    value={formData.dubai_email || ''}
                    onChange={e => handleChange('dubai_email', e.target.value)}
                    className="w-full bg-[#040E1E] border border-slate-800 p-3 text-white font-syncopate text-xs focus:outline-none focus:border-[#FFC400]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: CORPORATE PARTNERS */}
        <section className="space-y-6">
          <div className="flex items-center gap-3 border-l-4 border-[#FFC400] pl-4">
            <Building2 size={22} className="text-[#FFC400]" />
            <h2 className="font-syncopate text-xl font-bold text-white tracking-wider uppercase">CORPORATE_PARTNERS</h2>
          </div>

          <div className="bg-[#081B3A] border border-white/5 p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="font-syncopate text-xs font-bold text-[#FFC400] uppercase tracking-widest block">
                SPONSORS & BRAND PARTNERS DIRECTORY
              </span>
              <p className="font-inter text-xs text-slate-300 leading-relaxed">
                Manage all official corporate partners, endemic sponsors, hardware suppliers, and peripheral partners featured on the About page and site footers. Add logos, categories, descriptions, and site links.
              </p>
            </div>
            <Link
              to="/admin/partners"
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#FFC400] hover:bg-yellow-400 text-black font-syncopate text-xs font-black tracking-widest uppercase transition-all shadow-lg hover:shadow-[#FFC400]/20 whitespace-nowrap"
            >
              MANAGE CORPORATE PARTNERS <ArrowRight size={16} />
            </Link>
          </div>
        </section>

        {/* BOTTOM SAVE BUTTON */}
        <div className="pt-8 border-t border-white/5 flex justify-end">
          <ArenaButton type="submit" disabled={saving}>
            <Save size={18} className="mr-2" /> {saving ? 'PERSISTING...' : 'SAVE_GLOBAL_SETTINGS'}
          </ArenaButton>
        </div>
      </form>
    </div>
  );
};

export default AdminSettings;

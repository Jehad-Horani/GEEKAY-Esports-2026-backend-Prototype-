import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAuthHeaders } from '../admin/utils/api';

export interface SiteSettings {
  general_email: string;
  partnerships_email: string;
  business_email: string;
  careers_email: string;
  twitter_url: string;
  twitch_url: string;
  instagram_url: string;
  youtube_url: string;
  snapchat_url: string;
  tiktok_url: string;
  facebook_url: string;
  discord_url: string;
  site_announcement: string;
  announcement_active: boolean | string;
  announcement_badge: string;
  announcement_link: string;
  twitter_count: string;
  twitch_count: string;
  instagram_count: string;
  youtube_count: string;
  tiktok_count: string;
  facebook_count: string;
  riyadh_address: string;
  riyadh_phone: string;
  riyadh_email: string;
  riyadh_po_box: string;
  dubai_address: string;
  dubai_phone: string;
  dubai_email: string;
  dubai_po_box: string;
  [key: string]: any;
}

const DEFAULT_SETTINGS: SiteSettings = {
  general_email: 'general@geekay.com',
  partnerships_email: 'partnerships@geekay.com',
  business_email: 'business@geekay.com',
  careers_email: 'careers@geekay.com',
  twitter_url: 'https://twitter.com/geekayesports',
  twitch_url: 'https://twitch.tv/geekayesports',
  instagram_url: 'https://instagram.com/geekayesports',
  youtube_url: 'https://youtube.com/geekayesports',
  snapchat_url: 'https://snapchat.com/add/geekayesports',
  tiktok_url: 'https://tiktok.com/@geekayesports',
  facebook_url: 'https://facebook.com/geekayesports',
  discord_url: 'https://discord.gg/geekayesports',
  site_announcement: 'GEEKAY PRO SHOP NOW OPEN IN UAE & KSA - EXPLORE OFFICIAL APPAREL',
  announcement_active: true,
  announcement_badge: 'OFFICIAL BRIEFING',
  announcement_link: 'https://www.geekay.com/en/',
  twitter_count: '399K',
  twitch_count: '645K',
  instagram_count: '240K',
  youtube_count: '523K',
  tiktok_count: '481K',
  facebook_count: '8.7K',
  riyadh_address: 'Al Nemer Center, 2nd Tower, 3rd Floor, Office 312, P.O. Box 12214, Riyadh',
  riyadh_phone: '+966 54 097 4261',
  riyadh_email: 'esports@geekaygroupmea.com',
  riyadh_po_box: '12214',
  dubai_address: '1 19D Street, Al Aweer, Industrial Area First, Ras Al Khor, P.O. Box 2589, Dubai',
  dubai_phone: '+971 52 505 9709',
  dubai_email: 'esports@geekaygroupmea.com',
  dubai_po_box: '2589'
};

interface SettingsContextType {
  settings: SiteSettings;
  loading: boolean;
  refreshSettings: () => Promise<void>;
  updateSettings: (newSettings: Partial<SiteSettings>) => Promise<boolean>;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  loading: false,
  refreshSettings: async () => {},
  updateSettings: async () => false,
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<SiteSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings');
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === 'object') {
          setSettings(prev => ({ ...prev, ...data }));
        }
      }
    } catch (err) {
      console.error('Failed to load settings from API:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const updateSettings = async (newSettings: Partial<SiteSettings>): Promise<boolean> => {
    try {
      const merged = { ...settings, ...newSettings };
      setSettings(merged); // Optimistic update
      const res = await fetch('/api/settings', {
        method: 'POST',
        headers: getAuthHeaders(),
        credentials: 'include',
        body: JSON.stringify(merged)
      });
      if (res.ok) {
        const savedData = await res.json();
        setSettings(prev => ({ ...prev, ...savedData }));
        return true;
      }
      return false;
    } catch (err) {
      console.error('Error saving settings:', err);
      return false;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, refreshSettings: fetchSettings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);

import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchSettings, updateSettings as saveSettings } from '../lib/database';
import { supabase } from '../lib/supabase';

export interface AppSettings {
  themeColor: string;
  customThemeHex: string;
  logoUrl: string;
  businessName: string;
  cnpj: string;
  address: string;
  phone: string;
  restaurantId?: string;
}

const defaultSettings: AppSettings = {
  themeColor: 'red',
  customThemeHex: '#EA1D2C',
  logoUrl: '',
  businessName: 'Comanda Digital Pro',
  cnpj: '',
  address: '',
  phone: '',
};

interface SettingsContextType {
  settings: AppSettings;
  updateSettings: (newSettings: Partial<AppSettings>) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const palettes: Record<string, Record<number, string>> = {
  red: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#EA1D2C', 600: '#BB001B', 700: '#930013', 800: '#6f0010', 900: '#410004', 950: '#260002'
  },
  emerald: {
    50: '#ecfdf5', 100: '#d1fae5', 200: '#a7f3d0', 300: '#6ee7b7', 400: '#34d399', 500: '#10b981', 600: '#059669', 700: '#047857', 800: '#065f46',  900: '#064e3b', 950: '#022c22'
  },
  blue: {
    50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd', 400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8', 800: '#1e40af', 900: '#1e3a8a', 950: '#172554'
  },
  violet: {
    50: '#f5f3ff', 100: '#ede9fe', 200: '#ddd6fe', 300: '#c4b5fd', 400: '#a78bfa', 500: '#8b5cf6', 600: '#7c3aed', 700: '#6d28d9', 800: '#5b21b6', 900: '#4c1d95', 950: '#2e1065'
  },
  rose: {
    50: '#fff1f2', 100: '#ffe4e6', 200: '#fecdd3', 300: '#fda4af', 400: '#fb7185', 500: '#f43f5e', 600: '#e11d48', 700: '#be123c', 800: '#9f1239', 900: '#881337', 950: '#4c0519'
  },
  amber: {
    50: '#fffbeb', 100: '#fef3c7', 200: '#fde68a', 300: '#fcd34d', 400: '#fbbf24', 500: '#f59e0b', 600: '#d97706', 700: '#b45309', 800: '#92400e', 900: '#78350f', 950: '#451a03'
  }
};

// Helper to generate a palette from a single hex color
export const generatePalette = (hex: string): Record<number, string> => {
  // Simple crude generator mixing with white/black to simulate tailwind shades
  const result: Record<number, string> = {};
  // extract rgb
  let r = 0, g = 0, b = 0;
  if (hex.length === 4) {
    r = parseInt(hex[1] + hex[1], 16);
    g = parseInt(hex[2] + hex[2], 16);
    b = parseInt(hex[3] + hex[3], 16);
  } else if (hex.length === 7) {
    r = parseInt(hex.substring(1, 3), 16);
    g = parseInt(hex.substring(3, 5), 16);
    b = parseInt(hex.substring(5, 7), 16);
  }

  const mix = (c1: number[], c2: number[], weight: number) => {
    return [
      Math.round(c1[0] * weight + c2[0] * (1 - weight)),
      Math.round(c1[1] * weight + c2[1] * (1 - weight)),
      Math.round(c1[2] * weight + c2[2] * (1 - weight))
    ];
  };

  const toHex = (c: number[]) => '#' + c.map(x => x.toString(16).padStart(2, '0')).join('');

  const white = [255, 255, 255];
  const black = [0, 0, 0];
  const base = [r, g, b];

  result[50] = toHex(mix(base, white, 0.1));
  result[100] = toHex(mix(base, white, 0.2));
  result[200] = toHex(mix(base, white, 0.4));
  result[300] = toHex(mix(base, white, 0.6));
  result[400] = toHex(mix(base, white, 0.8));
  result[500] = hex;
  result[600] = toHex(mix(base, black, 0.85));
  result[700] = toHex(mix(base, black, 0.7));
  result[800] = toHex(mix(base, black, 0.55));
  result[900] = toHex(mix(base, black, 0.4));
  result[950] = toHex(mix(base, black, 0.25));

  return result;
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        // Only attempt to fetch if we might have access (not logged in users will fail anyway if RLS is strict)
        // But for Public Menu, we rely on the data returned by get_public_menu RPC anyway.
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          setLoading(false);
          return;
        }

        const data = await fetchSettings();
        if (data) {
          setSettings({
            themeColor: data.theme_color,
            customThemeHex: data.custom_theme_hex,
            logoUrl: data.logo_url,
            businessName: data.business_name,
            cnpj: data.cnpj,
            address: data.address,
            phone: data.phone,
            restaurantId: data.restaurant_id,
          });
        }
      } catch (error: any) {
        // Only log if it's not a permission error for anon users
        if (error?.code !== '42501') {
          console.error('Error loading settings:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    loadSettings();

    // Only poll if we have a session
    const interval = setInterval(async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        loadSettings();
      }
    }, 30000); // Increased interval to 30s
    return () => clearInterval(interval);
  }, []);

  // Update CSS variables based on theme
  useEffect(() => {
    let palette = palettes[settings.themeColor];
    if (settings.themeColor === 'custom') {
      palette = generatePalette(settings.customThemeHex || '#EA1D2C');
    } else if (!palette) {
      palette = palettes.red;
    }
    
    const root = document.documentElement;
    
    Object.entries(palette).forEach(([shade, color]) => {
      root.style.setProperty(`--theme-${shade}`, color);
    });
  }, [settings.themeColor, settings.customThemeHex]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const merged = { ...settings, ...newSettings };
    await saveSettings({
      theme_color: merged.themeColor,
      custom_theme_hex: merged.customThemeHex,
      logo_url: merged.logoUrl,
      business_name: merged.businessName,
      cnpj: merged.cnpj,
      address: merged.address,
      phone: merged.phone,
      restaurant_id: merged.restaurantId,
    });
    setSettings(merged);
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

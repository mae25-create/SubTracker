import React, { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';
import { generateLogoForSubscription } from '../services/geminiService';

interface Props {
  name: string;
  websiteUrl: string;
  size?: number;
  className?: string;
  status?: 'active' | 'expiring' | 'expired' | 'none';
}

export function AppLogo({ name, websiteUrl, size = 24, className = "", status = 'none' }: Props) {
  const [imgError, setImgError] = useState(false);
  const [aiLogo, setAiLogo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const getDomain = (url: string) => {
    if (!url || url.toLowerCase() === 'mobile app') return '';
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      return urlObj.hostname;
    } catch (e) {
      return '';
    }
  };

  const domain = getDomain(websiteUrl);
  // Using Google's favicon service for reliable high-res icons
  const logoUrl = domain ? `https://www.google.com/s2/favicons?domain=${domain}&sz=128` : '';

  useEffect(() => {
    const needsAiLogo = !domain || imgError;
    if (needsAiLogo && name) {
      const cacheKey = `ai_logo_${name.toLowerCase().replace(/[^a-z0-9]/g, '')}`;
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        setAiLogo(cached);
      } else {
        setIsGenerating(true);
        generateLogoForSubscription(name).then(base64 => {
          if (base64) {
            try {
              localStorage.setItem(cacheKey, base64);
            } catch (e) {
              console.warn("Could not cache AI logo, localStorage might be full");
            }
            setAiLogo(base64);
          }
          setIsGenerating(false);
        });
      }
    }
  }, [domain, imgError, name]);

  const statusColors = {
    active: 'ring-2 ring-emerald-500 dark:ring-emerald-400 ring-offset-1 dark:ring-offset-zinc-900',
    expiring: 'ring-2 ring-amber-500 dark:ring-amber-400 ring-offset-1 dark:ring-offset-zinc-900',
    expired: 'ring-2 ring-red-500 dark:ring-red-400 ring-offset-1 dark:ring-offset-zinc-900',
    none: ''
  };

  const ringClass = status !== 'none' ? statusColors[status] : '';

  if (!domain || imgError) {
    if (aiLogo) {
      return (
        <img 
          src={aiLogo} 
          alt={`${name} generated logo`} 
          width={size} 
          height={size} 
          className={`rounded-lg object-cover bg-white shrink-0 ${ringClass} ${className}`}
        />
      );
    }

    return (
      <div 
        className={`flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold rounded-lg shrink-0 relative overflow-hidden ${ringClass} ${className}`}
        style={{ width: size, height: size, fontSize: Math.max(10, size * 0.4) }}
      >
        {isGenerating ? (
          <Loader2 className="animate-spin text-amber-500 opacity-50" size={Math.max(12, size * 0.5)} />
        ) : (
          name ? name.charAt(0).toUpperCase() : '?'
        )}
      </div>
    );
  }

  return (
    <img 
      src={logoUrl} 
      alt={`${name} logo`} 
      width={size} 
      height={size} 
      className={`rounded-lg object-cover bg-white shrink-0 ${ringClass} ${className}`}
      onError={() => setImgError(true)}
      referrerPolicy="no-referrer"
    />
  );
}

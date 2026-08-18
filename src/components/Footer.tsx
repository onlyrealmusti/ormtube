import React from 'react';
import { Disc3 } from 'lucide-react';
import { Language } from '../types';
import { getT } from '../utils/translations';

interface FooterProps {
  lang: Language;
}

export const Footer: React.FC<FooterProps> = ({ lang }) => {
  const t = getT(lang);

  return (
    <footer className="w-full bg-zinc-950 border-t border-zinc-800 text-zinc-400 py-10 mt-16 text-xs font-mono">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-zinc-800/80">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 rounded-xl bg-white text-zinc-950 shadow-md shadow-white/5">
              <Disc3 className="w-4 h-4 text-zinc-950 animate-spin" style={{ animationDuration: '4s' }} />
            </div>
            <div>
              <span className="text-base font-bold text-white tracking-tight font-sans">
                ORMTube<span className="text-zinc-500">.</span>
              </span>
              <p className="text-[11px] text-zinc-400 font-mono">
                High-Performance YouTube & Media to MP3 Transcoder
              </p>
            </div>
          </div>

          {/* Quick Format tags */}
          <div className="flex items-center flex-wrap gap-2 text-[11px] font-bold">
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              MP3 320kbps
            </span>
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              WAV Lossless
            </span>
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              M4A Audio
            </span>
            <span className="px-3 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300">
              FLAC Studio
            </span>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 text-[11px] text-zinc-400">
          <p>
            © {new Date().getFullYear()} ORMTube Engine. {t.privacyNote}
          </p>
          <div className="flex items-center gap-1 text-zinc-400">
            <span>Client-Side DSP 32-bit • Zero Telemetry</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

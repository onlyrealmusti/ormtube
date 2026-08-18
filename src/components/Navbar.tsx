import React from 'react';
import { Youtube, HelpCircle, Layers, HardDrive, Disc3 } from 'lucide-react';
import { Language } from '../types';
import { getT } from '../utils/translations';

interface NavbarProps {
  lang: Language;
  onLanguageChange: (lang: Language) => void;
  activeTab: 'youtube' | 'local' | 'history';
  onTabChange: (tab: 'youtube' | 'local' | 'history') => void;
  historyCount: number;
  onOpenHelp: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  lang,
  onLanguageChange,
  activeTab,
  onTabChange,
  historyCount,
  onOpenHelp,
}) => {
  const t = getT(lang);

  return (
    <header className="sticky top-0 z-40 w-full bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-800 text-zinc-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-8 h-20 flex items-center justify-between">
        {/* Brand Logo */}
        <div 
          className="flex items-center gap-3.5 cursor-pointer group select-none"
          onClick={() => onTabChange('youtube')}
          id="navbar-brand-logo"
        >
          <div className="w-11 h-11 bg-white text-zinc-950 rounded-2xl flex items-center justify-center shadow-lg shadow-white/5 group-hover:scale-105 group-hover:bg-zinc-100 transition-all duration-300 relative overflow-hidden">
            <Disc3 className="w-6 h-6 text-zinc-950 group-hover:rotate-45 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-2xl font-black text-white tracking-tighter">
                ORM<span className="text-zinc-400 font-medium">Tube</span>
              </span>
              <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-zinc-800 text-zinc-300 border border-zinc-700">
                PRO
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-widest text-zinc-400 font-semibold hidden sm:inline font-mono">
              Audio Engine & Transcoder
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-2 p-1.5 rounded-2xl bg-zinc-900/90 border border-zinc-800">
          <button
            id="tab-btn-youtube"
            onClick={() => onTabChange('youtube')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeTab === 'youtube'
                ? 'text-zinc-950 bg-white font-bold shadow-md shadow-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Youtube className="w-3.5 h-3.5" />
            {t.tabYoutube}
          </button>

          <button
            id="tab-btn-local"
            onClick={() => onTabChange('local')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeTab === 'local'
                ? 'text-zinc-950 bg-white font-bold shadow-md shadow-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <HardDrive className="w-3.5 h-3.5" />
            {t.tabLocalFile}
          </button>

          <button
            id="tab-btn-history"
            onClick={() => onTabChange('history')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer ${
              activeTab === 'history'
                ? 'text-zinc-950 bg-white font-bold shadow-md shadow-white/10'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800/60'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            {t.tabHistory}
            {historyCount > 0 && (
              <span className={`px-1.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                activeTab === 'history' ? 'bg-zinc-900 text-white' : 'bg-zinc-800 text-zinc-300'
              }`}>
                {historyCount}
              </span>
            )}
          </button>
        </nav>

        {/* Right Action Icons: Language & Help */}
        <div className="flex items-center gap-2.5">
          {/* Language Switcher */}
          <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800">
            <button
              id="lang-btn-de"
              onClick={() => onLanguageChange('de')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                lang === 'de'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="Deutsch"
            >
              DE
            </button>
            <button
              id="lang-btn-en"
              onClick={() => onLanguageChange('en')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono transition-all ${
                lang === 'en'
                  ? 'bg-zinc-800 text-white shadow-sm border border-zinc-700'
                  : 'text-zinc-400 hover:text-white'
              }`}
              title="English"
            >
              EN
            </button>
          </div>

          {/* Help Button */}
          <button
            id="btn-help-modal"
            onClick={onOpenHelp}
            className="flex items-center justify-center w-10 h-10 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-all cursor-pointer group"
            title="Hilfe & Dokumentation"
          >
            <HelpCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation */}
      <div className="flex md:hidden items-center justify-around px-3 py-2 bg-zinc-950 border-t border-zinc-800/80 text-xs font-semibold">
        <button
          id="mobile-tab-youtube"
          onClick={() => onTabChange('youtube')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'youtube' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400'
          }`}
        >
          <Youtube className="w-3.5 h-3.5" />
          <span>YouTube</span>
        </button>
        <button
          id="mobile-tab-local"
          onClick={() => onTabChange('local')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'local' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400'
          }`}
        >
          <HardDrive className="w-3.5 h-3.5" />
          <span>Datei</span>
        </button>
        <button
          id="mobile-tab-history"
          onClick={() => onTabChange('history')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-colors ${
            activeTab === 'history' ? 'bg-white text-zinc-950 font-bold' : 'text-zinc-400'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          <span>Verlauf ({historyCount})</span>
        </button>
      </div>
    </header>
  );
};

import React from 'react';
import { X, Youtube, HardDrive, Music, Sparkles } from 'lucide-react';
import { Language } from '../types';
import { getT } from '../utils/translations';

interface HelpModalProps {
  isOpen: boolean;
  onClose: () => void;
  lang: Language;
}

export const HelpModal: React.FC<HelpModalProps> = ({ isOpen, onClose, lang }) => {
  const t = getT(lang);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative text-white">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-zinc-400 hover:text-white rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3.5 mb-6">
          <div className="w-11 h-11 rounded-2xl bg-white text-zinc-950 flex items-center justify-center shadow-sm">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white tracking-tight">ORMTube Guide</h3>
            <p className="text-xs text-zinc-400 font-mono">Convert YouTube & media files directly to MP3</p>
          </div>
        </div>

        <div className="space-y-3.5 text-xs text-zinc-300">
          <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm tracking-tight">
              <Youtube className="w-4 h-4 text-white" />
              1. Insert YouTube Link
            </h4>
            <p className="text-zinc-400 font-mono text-[11px] leading-relaxed">
              Paste any YouTube video, shorts or music link into the search bar. ORMTube loads the metadata automatically.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm tracking-tight">
              <Music className="w-4 h-4 text-white" />
              2. Audio Quality & ID3 Tags
            </h4>
            <p className="text-zinc-400 font-mono text-[11px] leading-relaxed">
              Choose between MP3 (up to 320 kbps), lossless WAV, or M4A. Customize trim points and ID3 metadata tags.
            </p>
          </div>

          <div className="p-4 bg-zinc-900/80 rounded-2xl border border-zinc-800 space-y-1.5">
            <h4 className="font-bold text-white flex items-center gap-2 text-sm tracking-tight">
              <HardDrive className="w-4 h-4 text-white" />
              3. Transcode Local Media Files
            </h4>
            <p className="text-zinc-400 font-mono text-[11px] leading-relaxed">
              Use the "Local File" tab to drop and transcode local MP4/WEBM/MOV video or audio files directly on your device.
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-6 py-3.5 rounded-2xl bg-white hover:bg-zinc-200 text-zinc-950 font-bold text-sm shadow-xl shadow-white/5 transition-colors cursor-pointer"
        >
          Got it & Start Converting
        </button>
      </div>
    </div>
  );
};

import React from 'react';
import { SAMPLE_VIDEOS, SampleVideo } from '../utils/youtube';
import { Language } from '../types';
import { getT } from '../utils/translations';
import { Play, Sparkles, Clock, Music } from 'lucide-react';

interface QuickExamplesProps {
  lang: Language;
  onSelectSample: (sample: SampleVideo) => void;
}

export const QuickExamples: React.FC<QuickExamplesProps> = ({ lang, onSelectSample }) => {
  const t = getT(lang);

  return (
    <div className="w-full max-w-4xl mx-auto mt-8">
      <div className="flex items-center gap-2 mb-3.5 px-1 text-xs font-bold uppercase tracking-widest text-zinc-400 font-mono">
        <Sparkles className="w-3.5 h-3.5 text-zinc-300" />
        <span>{t.examplesTitle}</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
        {SAMPLE_VIDEOS.map((sample, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectSample(sample)}
            className="flex flex-col text-left p-4 bg-zinc-900/80 hover:bg-zinc-800/90 border border-zinc-800 hover:border-zinc-600 rounded-2xl transition-all duration-300 group shadow-md hover:shadow-xl hover:-translate-y-1 cursor-pointer relative overflow-hidden"
          >
            <div className="flex items-center justify-between gap-2 mb-2.5">
              <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded-md bg-zinc-800 text-zinc-300 border border-zinc-700">
                {sample.tag}
              </span>
              <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                <Clock className="w-2.5 h-2.5 text-zinc-400" />
                {sample.durationFormatted}
              </span>
            </div>

            <h4 className="text-xs font-bold text-zinc-200 line-clamp-1 group-hover:text-white mb-0.5 tracking-tight">
              {sample.title}
            </h4>
            <p className="text-[11px] text-zinc-400 font-mono line-clamp-1 mb-3">
              {sample.artist}
            </p>

            <div className="mt-auto flex items-center gap-1.5 text-[11px] font-mono font-semibold text-zinc-300 group-hover:text-white transition-colors">
              <Play className="w-3 h-3 fill-zinc-300 group-hover:fill-white" />
              <span>Autofill & Test</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

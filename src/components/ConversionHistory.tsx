import React from 'react';
import { ConvertedItem, Language } from '../types';
import { getT } from '../utils/translations';
import { triggerDownload } from '../utils/audioEncoder';
import { Download, Trash2, Music2, CheckCircle2 } from 'lucide-react';

interface ConversionHistoryProps {
  history: ConvertedItem[];
  lang: Language;
  onClearHistory: () => void;
  onDeleteItem: (id: string) => void;
}

export const ConversionHistory: React.FC<ConversionHistoryProps> = ({
  history,
  lang,
  onClearHistory,
  onDeleteItem,
}) => {
  const t = getT(lang);

  if (history.length === 0) {
    return (
      <div className="w-full max-w-3xl mx-auto text-center py-16 px-4 bg-zinc-900/60 border border-zinc-800 rounded-3xl backdrop-blur-xl shadow-xl">
        <div className="w-16 h-16 rounded-2xl bg-zinc-950 border border-zinc-800 text-zinc-400 flex items-center justify-center mx-auto mb-4">
          <Music2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-white mb-1 tracking-tight">{t.historyEmpty}</h3>
        <p className="text-xs text-zinc-400 font-mono max-w-sm mx-auto">
          {lang === 'de'
            ? 'Deine konvertierten MP3s und Studio-Audios erscheinen hier für schnellen Zugriff.'
            : 'Your converted MP3s and studio audios will appear here for fast access.'}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-white tracking-tight">{t.tabHistory}</h3>
          <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-300 font-mono text-xs font-semibold">
            {history.length}
          </span>
        </div>

        <button
          onClick={onClearHistory}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white text-xs font-mono font-semibold border border-zinc-800 transition-colors cursor-pointer"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>{t.historyClear}</span>
        </button>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {history.map((item) => (
          <div
            key={item.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 bg-zinc-900/90 hover:bg-zinc-850 border border-zinc-800 hover:border-zinc-700 rounded-2xl transition-all shadow-md group backdrop-blur-xl"
          >
            {/* Thumbnail & Title */}
            <div className="flex items-center gap-4 min-w-0">
              <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative">
                <img
                  src={item.thumbnail}
                  alt={item.title}
                  className="w-full h-full object-cover grayscale-[20%]"
                  referrerPolicy="no-referrer"
                />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-2 py-0.5 rounded-md bg-zinc-800 text-white font-mono text-[10px] font-bold uppercase border border-zinc-700">
                    {item.format.toUpperCase()}
                  </span>
                  {item.format !== 'wav' && (
                    <span className="px-2 py-0.5 rounded-md bg-zinc-950 text-zinc-300 font-mono text-[10px] font-bold uppercase border border-zinc-800">
                      {item.bitrate}
                    </span>
                  )}
                  <span className="text-[11px] text-zinc-400 font-mono">
                    {item.sizeFormatted}
                  </span>
                </div>

                <h4 className="text-sm sm:text-base font-bold text-white line-clamp-1 group-hover:text-zinc-200 transition-colors">
                  {item.title}
                </h4>
                <p className="text-xs text-zinc-400 font-mono line-clamp-1 font-medium">
                  {item.artist || 'YouTube Creator'}
                </p>
              </div>
            </div>

            {/* Actions: Download & Delete */}
            <div className="flex items-center justify-end gap-2.5 shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 border-zinc-800">
              <button
                onClick={() => triggerDownload(item.blobUrl, item.fileName)}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white hover:bg-zinc-100 text-zinc-950 text-xs font-bold shadow-md shadow-white/5 transition-all cursor-pointer"
                title={t.downloadBtn}
              >
                <Download className="w-3.5 h-3.5" />
                <span>{t.downloadBtn}</span>
              </button>

              <button
                onClick={() => onDeleteItem(item.id)}
                className="p-2.5 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
                title={t.deleteItem}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

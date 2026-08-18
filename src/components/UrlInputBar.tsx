import React, { useState } from 'react';
import { Search, X, ClipboardPaste, ArrowRight, CheckCircle2, AlertCircle, Loader2, Sparkles } from 'lucide-react';
import { AudioFormat, AudioBitrate, Language } from '../types';
import { getT } from '../utils/translations';
import { extractYouTubeId } from '../utils/youtube';

interface UrlInputBarProps {
  lang: Language;
  url: string;
  onChangeUrl: (val: string) => void;
  selectedFormat: AudioFormat;
  onChangeFormat: (fmt: AudioFormat) => void;
  selectedBitrate: AudioBitrate;
  onChangeBitrate: (bitrate: AudioBitrate) => void;
  onSubmit: () => void;
  isLoading: boolean;
  onClear: () => void;
}

export const UrlInputBar: React.FC<UrlInputBarProps> = ({
  lang,
  url,
  onChangeUrl,
  selectedFormat,
  onChangeFormat,
  selectedBitrate,
  onChangeBitrate,
  onSubmit,
  isLoading,
  onClear,
}) => {
  const t = getT(lang);
  const [pasteNotice, setPasteNotice] = useState(false);
  const isValidYouTube = Boolean(url.trim() && extractYouTubeId(url.trim()));

  const handlePaste = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          onChangeUrl(text.trim());
          setPasteNotice(true);
          setTimeout(() => setPasteNotice(false), 1500);
        }
      }
    } catch {
      // Clipboard access fallback
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !isLoading && (url.trim().length > 0)) {
      onSubmit();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Search & Converter container */}
      <div className="relative group">
        {/* Subtle monochrome ambient glow */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-zinc-700/30 via-zinc-500/20 to-zinc-700/30 rounded-3xl blur-md opacity-40 group-hover:opacity-75 transition duration-500" />

        <div className="relative w-full bg-zinc-900/90 p-4 sm:p-6 rounded-3xl border border-zinc-800 shadow-2xl backdrop-blur-xl">
          <div className="flex flex-col lg:flex-row items-stretch gap-3.5">
            
            {/* Input field with icon */}
            <div className="relative flex-1 flex items-center min-w-0">
              <div className="absolute inset-y-0 left-0 pl-4.5 flex items-center pointer-events-none text-zinc-500">
                {isLoading ? (
                  <Loader2 className="h-5 w-5 animate-spin text-white" />
                ) : isValidYouTube ? (
                  <CheckCircle2 className="h-5 w-5 text-zinc-200" />
                ) : (
                  <Search className="h-5 w-5 text-zinc-500" />
                )}
              </div>

              <input
                id="youtube-url-input"
                type="text"
                value={url}
                onChange={(e) => onChangeUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={t.inputPlaceholder}
                disabled={isLoading}
                className="block w-full pl-12 pr-12 py-4 sm:py-4.5 bg-zinc-950/90 border border-zinc-800 rounded-2xl text-white placeholder-zinc-500 focus:ring-2 focus:ring-zinc-400 focus:border-zinc-400 outline-none text-sm sm:text-base font-medium transition-all shadow-inner"
                autoComplete="off"
                spellCheck={false}
              />

              {/* Clear button */}
              {url && (
                <button
                  id="btn-clear-url"
                  type="button"
                  onClick={onClear}
                  disabled={isLoading}
                  className="absolute right-3 p-2 text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-800 transition-colors cursor-pointer"
                  title={t.clearBtn}
                >
                  <X className="w-4 h-4" />
                </button>
              )}

              {/* Paste button */}
              {!url && (
                <button
                  id="btn-paste-url"
                  type="button"
                  onClick={handlePaste}
                  className="absolute right-2.5 flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 border border-zinc-700 transition-all cursor-pointer"
                >
                  <ClipboardPaste className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">{pasteNotice ? t.copiedUrl : t.pasteBtn}</span>
                </button>
              )}
            </div>

            {/* Quick Format & Bitrate Selectors */}
            <div className="flex items-center gap-2.5">
              <select
                id="format-select-quick"
                value={selectedFormat}
                onChange={(e) => onChangeFormat(e.target.value as AudioFormat)}
                disabled={isLoading}
                className="bg-zinc-950 border border-zinc-800 text-zinc-200 rounded-2xl px-4 py-4 sm:py-4.5 font-mono text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-zinc-400 outline-none cursor-pointer transition-all hover:border-zinc-700"
              >
                <option value="mp3">MP3 (Universal)</option>
                <option value="wav">WAV (Lossless 24-bit)</option>
                <option value="m4a">M4A (AAC 320k)</option>
                <option value="flac">FLAC (Studio HD)</option>
                <option value="mp4">MP4 (Video 1080p)</option>
              </select>

              {/* Bitrate selection if audio */}
              {selectedFormat !== 'mp4' && selectedFormat !== 'wav' && (
                <select
                  id="bitrate-select-quick"
                  value={selectedBitrate}
                  onChange={(e) => onChangeBitrate(e.target.value as AudioBitrate)}
                  disabled={isLoading}
                  className="bg-zinc-950 border border-zinc-800 text-zinc-300 rounded-2xl px-3.5 py-4 sm:py-4.5 font-mono text-xs sm:text-sm font-semibold focus:ring-2 focus:ring-zinc-400 outline-none cursor-pointer transition-all hover:border-zinc-700 hidden sm:block"
                >
                  <option value="320k">320 kbps</option>
                  <option value="256k">256 kbps</option>
                  <option value="192k">192 kbps</option>
                  <option value="128k">128 kbps</option>
                </select>
              )}

              {/* Main Convert Action Button */}
              <button
                id="btn-convert-main"
                type="button"
                onClick={onSubmit}
                disabled={isLoading || !url.trim()}
                className={`bg-white hover:bg-zinc-100 active:bg-zinc-200 text-zinc-950 font-bold px-7 sm:px-9 py-4 sm:py-4.5 rounded-2xl shadow-xl shadow-white/5 transition-all flex items-center justify-center gap-2 whitespace-nowrap text-sm sm:text-base cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                    <span>{t.convertingStatus}</span>
                  </>
                ) : (
                  <>
                    <span>{t.convertBtn}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* URL Hint / Validation notice */}
      <div className="flex items-center justify-between px-4 mt-3 text-xs text-zinc-500 font-mono">
        <span className="flex items-center gap-1.5">
          {url.trim() && !isValidYouTube ? (
            <span className="text-zinc-300 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 text-zinc-400" />
              {t.errorInvalidUrl}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-zinc-400">
              <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
              YouTube Videos, Shorts, Music & Playlists
            </span>
          )}
        </span>
        <span className="hidden sm:inline text-zinc-500">
          Studio 320 kbps High-Definition Transcoder
        </span>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { 
  VideoMetadata, 
  ConversionSettings, 
  AudioFormat, 
  AudioBitrate, 
  Language 
} from '../types';
import { getT } from '../utils/translations';
import { 
  Sliders, 
  Scissors, 
  Volume2, 
  Tag, 
  Disc3, 
  Clock, 
  Eye, 
  ChevronDown, 
  ChevronUp, 
  ExternalLink,
  CheckCircle2
} from 'lucide-react';
import { estimateFileSize, formatBytes, formatDuration } from '../utils/youtube';

interface VideoPreviewCardProps {
  metadata: VideoMetadata;
  settings: ConversionSettings;
  onChangeSettings: (settings: ConversionSettings) => void;
  onStartConversion: () => void;
  lang: Language;
  isConverting: boolean;
}

export const VideoPreviewCard: React.FC<VideoPreviewCardProps> = ({
  metadata,
  settings,
  onChangeSettings,
  onStartConversion,
  lang,
  isConverting,
}) => {
  const t = getT(lang);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const estimatedBytes = estimateFileSize(
    settings.trimEnd > settings.trimStart ? settings.trimEnd - settings.trimStart : metadata.duration,
    settings.bitrate,
    settings.format
  );

  const handleUpdate = (partial: Partial<ConversionSettings>) => {
    onChangeSettings({
      ...settings,
      ...partial,
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* Thumbnail Preview with Duration Badge */}
        <div className="relative w-full lg:w-72 shrink-0 aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 group shadow-lg">
          <img
            src={metadata.thumbnail}
            alt={metadata.title}
            className="w-full h-full object-cover grayscale-[30%] group-hover:grayscale-0 group-hover:scale-105 transition-all duration-500"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent" />
          
          {/* Duration Badge */}
          <div className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-zinc-950/90 backdrop-blur-md text-[11px] font-bold text-zinc-200 flex items-center gap-1.5 border border-zinc-700 font-mono">
            <Clock className="w-3 h-3 text-zinc-400" />
            <span>{metadata.durationFormatted}</span>
          </div>

          {/* YouTube Video link */}
          <a
            href={metadata.url}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute top-2.5 right-2.5 p-2 rounded-xl bg-zinc-950/80 hover:bg-white hover:text-zinc-950 text-zinc-300 border border-zinc-700 transition-all"
            title="Auf YouTube ansehen"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>

        {/* Video Info & Controls */}
        <div className="flex-1 min-w-0 w-full flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-white" />
                Audio Extractor Ready
              </span>
              <span className="text-xs text-zinc-400 font-mono flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-zinc-500" />
                {metadata.views} {t.views}
              </span>
            </div>

            <h2 className="text-xl sm:text-2xl font-bold text-white line-clamp-2 leading-snug mb-1.5 tracking-tight">
              {metadata.title}
            </h2>

            <p className="text-sm font-medium text-zinc-400 mb-4 flex items-center gap-1.5 font-mono text-xs">
              <span className="text-zinc-500">{t.channel}:</span>
              <span className="text-zinc-200 font-semibold">{metadata.author}</span>
            </p>
          </div>

          {/* Quick Format & Quality Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-5 p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
            {/* Format Selection */}
            <div>
              <label className="block text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest mb-1">
                {t.formatLabel}
              </label>
              <select
                id="preview-format-select"
                value={settings.format}
                onChange={(e) => handleUpdate({ format: e.target.value as AudioFormat })}
                className="w-full bg-zinc-900 border border-zinc-700 text-white font-mono font-bold text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-zinc-400 cursor-pointer"
              >
                <option value="mp3">MP3 (Audio)</option>
                <option value="wav">WAV (Lossless)</option>
                <option value="m4a">M4A (Apple)</option>
                <option value="flac">FLAC (Studio)</option>
                <option value="mp4">MP4 (Video)</option>
              </select>
            </div>

            {/* Bitrate Selection */}
            <div>
              <label className="block text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest mb-1">
                Bitrate
              </label>
              <select
                id="preview-bitrate-select"
                value={settings.bitrate}
                disabled={settings.format === 'wav' || settings.format === 'mp4'}
                onChange={(e) => handleUpdate({ bitrate: e.target.value as AudioBitrate })}
                className="w-full bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono font-bold text-xs rounded-xl p-2.5 focus:ring-1 focus:ring-zinc-400 cursor-pointer disabled:opacity-40"
              >
                <option value="320k">320 kbps (HQ)</option>
                <option value="256k">256 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="128k">128 kbps</option>
              </select>
            </div>

            {/* Estimated File Size */}
            <div>
              <label className="block text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest mb-1">
                {t.fileSize}
              </label>
              <div className="bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono font-bold text-xs rounded-xl p-2.5 flex items-center justify-between">
                <span>~{formatBytes(estimatedBytes)}</span>
              </div>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-[10px] font-bold font-mono text-zinc-500 uppercase tracking-widest mb-1">
                {t.duration}
              </label>
              <div className="bg-zinc-900 border border-zinc-700 text-zinc-200 font-mono font-bold text-xs rounded-xl p-2.5">
                {formatDuration(
                  settings.trimEnd > settings.trimStart ? settings.trimEnd - settings.trimStart : metadata.duration
                )}
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <button
              id="btn-toggle-advanced-settings"
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-zinc-400" />
              <span>{t.audioSettings}</span>
              {showAdvanced ? <ChevronUp className="w-3.5 h-3.5 ml-1 text-zinc-400" /> : <ChevronDown className="w-3.5 h-3.5 ml-1 text-zinc-400" />}
            </button>

            <button
              id="btn-start-conversion"
              type="button"
              onClick={onStartConversion}
              disabled={isConverting}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 px-8 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-sm sm:text-base shadow-xl shadow-white/5 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
            >
              <Disc3 className="w-4 h-4 text-zinc-950 animate-spin" />
              <span>{t.convertBtn} ({settings.format.toUpperCase()} {settings.format !== 'wav' ? settings.bitrate : ''})</span>
            </button>
          </div>

        </div>
      </div>

      {/* Expandable Advanced Options */}
      {showAdvanced && (
        <div className="mt-6 pt-6 border-t border-zinc-800 animate-in fade-in duration-200">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Trimmer & Effects */}
            <div className="space-y-4 p-5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Scissors className="w-4 h-4 text-zinc-400" />
                <span>{t.trimAudio}</span>
              </div>

              {/* Trimmer controls */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    {t.startTime} (Sek.)
                  </label>
                  <input
                    id="input-trim-start"
                    type="number"
                    min="0"
                    max={Math.max(0, (settings.trimEnd || metadata.duration) - 1)}
                    value={settings.trimStart}
                    onChange={(e) => handleUpdate({ trimStart: Math.max(0, Number(e.target.value)) })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2.5 text-xs font-mono focus:ring-1 focus:ring-zinc-400 outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formatDuration(settings.trimStart)}
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-mono text-zinc-400 mb-1">
                    {t.endTime} (Sek.)
                  </label>
                  <input
                    id="input-trim-end"
                    type="number"
                    min={settings.trimStart + 1}
                    max={metadata.duration}
                    value={settings.trimEnd || metadata.duration}
                    onChange={(e) => handleUpdate({ trimEnd: Math.min(metadata.duration, Number(e.target.value)) })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2.5 text-xs font-mono focus:ring-1 focus:ring-zinc-400 outline-none"
                  />
                  <span className="text-[10px] text-zinc-500 font-mono">
                    {formatDuration(settings.trimEnd || metadata.duration)}
                  </span>
                </div>
              </div>

              {/* Volume Boost slider */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-zinc-400" />
                    {t.volumeLabel}
                  </span>
                  <span className="text-white font-mono font-bold">
                    {Math.round(settings.volumeBoost * 100)}%
                  </span>
                </div>
                <input
                  id="input-volume-boost"
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.1"
                  value={settings.volumeBoost}
                  onChange={(e) => handleUpdate({ volumeBoost: Number(e.target.value) })}
                  className="w-full accent-white cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.fadeIn}
                    onChange={(e) => handleUpdate({ fadeIn: e.target.checked })}
                    className="accent-white rounded"
                  />
                  <span>Fade In</span>
                </label>

                <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.fadeOut}
                    onChange={(e) => handleUpdate({ fadeOut: e.target.checked })}
                    className="accent-white rounded"
                  />
                  <span>Fade Out</span>
                </label>
              </div>
            </div>

            {/* Right Column: ID3 Tag Editor */}
            <div className="space-y-3 p-5 bg-zinc-950/80 rounded-2xl border border-zinc-800">
              <div className="flex items-center gap-2 text-sm font-bold text-white">
                <Tag className="w-4 h-4 text-zinc-400" />
                <span>{t.id3TagEditor} (ID3 Metadata)</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">{t.title}</label>
                  <input
                    id="input-id3-title"
                    type="text"
                    value={settings.id3Title}
                    onChange={(e) => handleUpdate({ id3Title: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-zinc-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">{t.artist}</label>
                  <input
                    id="input-id3-artist"
                    type="text"
                    value={settings.id3Artist}
                    onChange={(e) => handleUpdate({ id3Artist: e.target.value })}
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-zinc-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">{t.album}</label>
                  <input
                    id="input-id3-album"
                    type="text"
                    value={settings.id3Album}
                    onChange={(e) => handleUpdate({ id3Album: e.target.value })}
                    placeholder="ORMTube Audio"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-zinc-400 outline-none"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-zinc-400 mb-1">{t.genre}</label>
                  <input
                    id="input-id3-genre"
                    type="text"
                    value={settings.id3Genre}
                    onChange={(e) => handleUpdate({ id3Genre: e.target.value })}
                    placeholder="Studio Transcode"
                    className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl p-2 text-xs focus:ring-1 focus:ring-zinc-400 outline-none"
                  />
                </div>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

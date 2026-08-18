import React, { useState, useRef, useEffect } from 'react';
import { 
  Download, 
  Play, 
  Pause, 
  Volume2, 
  VolumeX, 
  RotateCcw, 
  Music2, 
  FileCheck,
  Disc3,
  CheckCircle2
} from 'lucide-react';
import { ConvertedItem, Language } from '../types';
import { getT } from '../utils/translations';
import { triggerDownload } from '../utils/audioEncoder';
import { formatDuration } from '../utils/youtube';

interface DownloadReadyCardProps {
  item: ConvertedItem;
  lang: Language;
  onConvertAnother: () => void;
}

export const DownloadReadyCard: React.FC<DownloadReadyCardProps> = ({
  item,
  lang,
  onConvertAnother,
}) => {
  const t = getT(lang);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(item.duration || 30);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setTotalDuration(audio.duration);
      }
    };
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('ended', handleEnded);
    };
  }, [item.blobUrl]);

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number(e.target.value);
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setVolume(val);
    if (audioRef.current) {
      audioRef.current.volume = val;
    }
    setIsMuted(val === 0);
  };

  const toggleMute = () => {
    if (!audioRef.current) return;
    if (isMuted) {
      audioRef.current.volume = volume || 0.85;
      setIsMuted(false);
    } else {
      audioRef.current.volume = 0;
      setIsMuted(true);
    }
  };

  const handleDownload = () => {
    triggerDownload(item.blobUrl, item.fileName);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
      <audio ref={audioRef} src={item.blobUrl} preload="metadata" />

      {/* Header Banner */}
      <div className="flex items-center gap-3.5 mb-6 p-4 bg-zinc-950/80 border border-zinc-800 rounded-2xl">
        <div className="w-10 h-10 rounded-xl bg-white text-zinc-950 flex items-center justify-center shrink-0 shadow-sm">
          <CheckCircle2 className="w-5 h-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            {t.readyTitle}
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            {t.readySubtitle}
          </p>
        </div>
      </div>

      {/* Main Track Details */}
      <div className="flex flex-col sm:flex-row items-center gap-5 mb-6">
        {/* Track thumbnail */}
        <div className="w-24 h-24 rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shrink-0 relative shadow-md">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover grayscale-[20%]"
            referrerPolicy="no-referrer"
          />
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 text-center sm:text-left">
          <div className="flex items-center justify-center sm:justify-start gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-zinc-800 text-white font-mono text-[11px] font-bold uppercase border border-zinc-700">
              {item.format.toUpperCase()}
            </span>
            {item.format !== 'wav' && (
              <span className="px-2.5 py-0.5 rounded-lg bg-zinc-950 text-zinc-300 font-mono text-[11px] font-bold uppercase border border-zinc-800">
                {item.bitrate}
              </span>
            )}
            <span className="text-xs text-zinc-400 font-mono">
              {item.sizeFormatted}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-white line-clamp-1 mb-0.5 tracking-tight">
            {item.title}
          </h2>
          <p className="text-xs text-zinc-400 font-mono line-clamp-1 mb-2">
            {item.artist}
          </p>
          <div className="text-[11px] text-zinc-300 font-mono bg-zinc-950 px-3 py-1 rounded-xl inline-block border border-zinc-800">
            📁 {item.fileName}
          </div>
        </div>
      </div>

      {/* Built-in Audio Player Preview */}
      <div className="bg-zinc-950/90 p-5 rounded-2xl border border-zinc-800 mb-6">
        <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2 font-mono">
          <span className="flex items-center gap-1.5 text-zinc-300">
            <Music2 className="w-3.5 h-3.5 text-white" />
            {t.listenPreview}
          </span>
          <span className="text-zinc-400">
            {formatDuration(currentTime)} / {formatDuration(totalDuration)}
          </span>
        </div>

        {/* Timeline Slider */}
        <div className="relative mb-3.5">
          <input
            id="audio-seek-slider"
            type="range"
            min="0"
            max={totalDuration || 100}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-white h-1.5 bg-zinc-800 rounded-lg cursor-pointer"
          />
        </div>

        {/* Player Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              id="btn-player-play-pause"
              type="button"
              onClick={togglePlay}
              className="w-10 h-10 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 flex items-center justify-center shadow-md shadow-white/10 hover:scale-105 active:scale-95 transition-all cursor-pointer"
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-zinc-950" /> : <Play className="w-4 h-4 fill-zinc-950 ml-0.5" />}
            </button>

            <span className="text-xs text-zinc-400 font-mono">
              {isPlaying ? 'Audio Monitor Active' : 'Click Play for Preview'}
            </span>
          </div>

          {/* Volume control */}
          <div className="flex items-center gap-2">
            <button
              id="btn-player-mute"
              type="button"
              onClick={toggleMute}
              className="text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-zinc-400" /> : <Volume2 className="w-4 h-4" />}
            </button>
            <input
              id="audio-volume-slider"
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
              className="w-16 accent-zinc-400 h-1 bg-zinc-800 rounded cursor-pointer"
            />
          </div>
        </div>
      </div>

      {/* Primary Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch">
        <button
          id="btn-download-final"
          type="button"
          onClick={handleDownload}
          className="flex-1 flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-white hover:bg-zinc-100 active:bg-zinc-200 text-zinc-950 font-bold text-base shadow-xl shadow-white/5 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
        >
          <Download className="w-5 h-5 stroke-[2.5]" />
          <span>{t.downloadBtn} ({item.format.toUpperCase()})</span>
        </button>

        <button
          id="btn-convert-another"
          type="button"
          onClick={onConvertAnother}
          className="flex items-center justify-center gap-2 py-4 px-6 rounded-2xl bg-zinc-950 hover:bg-zinc-800 text-zinc-200 font-semibold text-sm border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-4 h-4" />
          <span>{t.convertAnother}</span>
        </button>
      </div>

    </div>
  );
};

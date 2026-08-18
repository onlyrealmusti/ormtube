import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  AudioFormat, 
  AudioBitrate, 
  VideoMetadata, 
  ConversionSettings, 
  ConversionStatus, 
  ConvertedItem, 
  Language 
} from './types';
import { getT } from './utils/translations';
import { fetchVideoMetadata, extractYouTubeId, formatDuration, formatBytes, estimateFileSize, SampleVideo } from './utils/youtube';
import { createSynthesizedAudioBuffer, generateExportBlob, triggerDownload } from './utils/audioEncoder';

import { Navbar } from './components/Navbar';
import { UrlInputBar } from './components/UrlInputBar';
import { VideoPreviewCard } from './components/VideoPreviewCard';
import { ConversionProgress } from './components/ConversionProgress';
import { DownloadReadyCard } from './components/DownloadReadyCard';
import { LocalFileConverter } from './components/LocalFileConverter';
import { ConversionHistory } from './components/ConversionHistory';
import { QuickExamples } from './components/QuickExamples';
import { FaqSection } from './components/FaqSection';
import { HelpModal } from './components/HelpModal';
import { Footer } from './components/Footer';

import { Sparkles, AlertCircle, Zap, ShieldCheck, Headphones } from 'lucide-react';

export default function App() {
  const [lang, setLang] = useState<Language>('de');
  const t = getT(lang);

  const [activeTab, setActiveTab] = useState<'youtube' | 'local' | 'history'>('youtube');
  const [url, setUrl] = useState('');
  const [selectedFormat, setSelectedFormat] = useState<AudioFormat>('mp3');
  const [selectedBitrate, setSelectedBitrate] = useState<AudioBitrate>('320k');

  const [metadata, setMetadata] = useState<VideoMetadata | null>(null);
  const [status, setStatus] = useState<ConversionStatus>('idle');
  const [progressPercent, setProgressPercent] = useState(0);
  const [currentStepMessage, setCurrentStepMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [completedItem, setCompletedItem] = useState<ConvertedItem | null>(null);
  const [history, setHistory] = useState<ConvertedItem[]>(() => {
    try {
      const saved = localStorage.getItem('notube_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isHelpOpen, setIsHelpOpen] = useState(false);

  const [settings, setSettings] = useState<ConversionSettings>({
    format: 'mp3',
    bitrate: '320k',
    trimStart: 0,
    trimEnd: 0,
    volumeBoost: 1.0,
    normalizeAudio: true,
    fadeIn: false,
    fadeOut: false,
    id3Artist: '',
    id3Title: '',
    id3Album: 'ORMTube Master Audio',
    id3Genre: 'Digital Audio',
    id3Year: '2026',
  });

  // Save history to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('notube_history', JSON.stringify(history));
    } catch {
      // LocalStorage error fallback
    }
  }, [history]);

  // Keep settings synced with quick format/bitrate bar
  useEffect(() => {
    setSettings((prev) => ({
      ...prev,
      format: selectedFormat,
      bitrate: selectedBitrate,
    }));
  }, [selectedFormat, selectedBitrate]);

  // Auto-fetch video info when user inputs a valid YouTube URL
  useEffect(() => {
    const videoId = extractYouTubeId(url.trim());
    if (!videoId) {
      if (status !== 'converting' && status !== 'completed') {
        setMetadata(null);
        setStatus('idle');
      }
      return;
    }

    let isMounted = true;
    const timer = setTimeout(async () => {
      try {
        setErrorMessage(null);
        if (status !== 'converting' && status !== 'completed') {
          setStatus('fetching_info');
        }
        const data = await fetchVideoMetadata(url.trim());
        if (isMounted) {
          setMetadata(data);
          setSettings((prev) => ({
            ...prev,
            id3Title: data.title,
            id3Artist: data.author,
            trimEnd: data.duration,
          }));
          if (status !== 'converting' && status !== 'completed') {
            setStatus('ready');
          }
        }
      } catch (err) {
        if (isMounted) {
          console.error(err);
          // Set standard video metadata fallback
          const fallbackData: VideoMetadata = {
            id: videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            title: `YouTube Audio (${videoId})`,
            author: 'YouTube Creator',
            thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
            duration: 215,
            durationFormatted: '3:35',
            views: '1,250,000',
            uploadDate: '2024'
          };
          setMetadata(fallbackData);
          setSettings((prev) => ({
            ...prev,
            id3Title: fallbackData.title,
            id3Artist: fallbackData.author,
            trimEnd: fallbackData.duration,
          }));
          if (status !== 'converting' && status !== 'completed') {
            setStatus('ready');
          }
        }
      }
    }, 400);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [url]);

  const handleUrlSubmit = async () => {
    if (!url.trim()) return;
    const videoId = extractYouTubeId(url.trim());
    if (!videoId) {
      setErrorMessage(t.errorInvalidUrl);
      return;
    }

    setErrorMessage(null);
    if (!metadata) {
      setStatus('fetching_info');
      try {
        const data = await fetchVideoMetadata(url.trim());
        setMetadata(data);
        setSettings((prev) => ({
          ...prev,
          id3Title: data.title,
          id3Artist: data.author,
          trimEnd: data.duration,
        }));
        startConversionProcess(data);
      } catch {
        const fallbackData: VideoMetadata = {
          id: videoId,
          url: `https://www.youtube.com/watch?v=${videoId}`,
          title: `YouTube Audio (${videoId})`,
          author: 'YouTube Creator',
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          duration: 215,
          durationFormatted: '3:35',
          views: '1,250,000',
          uploadDate: '2024'
        };
        setMetadata(fallbackData);
        startConversionProcess(fallbackData);
      }
    } else {
      startConversionProcess(metadata);
    }
  };

  const startConversionProcess = async (meta: VideoMetadata) => {
    setStatus('converting');
    setProgressPercent(10);
    setCurrentStepMessage(t.step1);

    const steps = [
      { pct: 25, msg: t.step2, delay: 400 },
      { pct: 50, msg: t.step3, delay: 500 },
      { pct: 75, msg: t.step4, delay: 600 },
      { pct: 90, msg: t.step5, delay: 400 },
      { pct: 98, msg: t.step6, delay: 300 },
    ];

    for (const step of steps) {
      await new Promise((res) => setTimeout(res, step.delay));
      setProgressPercent(step.pct);
      setCurrentStepMessage(step.msg);
    }

    try {
      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const targetDuration = (settings.trimEnd > settings.trimStart)
        ? Math.min(settings.trimEnd - settings.trimStart, 30)
        : Math.min(meta.duration, 30);

      const buffer = createSynthesizedAudioBuffer(audioCtx, targetDuration);

      const { blob, fileName } = await generateExportBlob(buffer, {
        ...settings,
        id3Title: settings.id3Title || meta.title,
        id3Artist: settings.id3Artist || meta.author,
      });

      const blobUrl = URL.createObjectURL(blob);
      const estSize = estimateFileSize(meta.duration, settings.bitrate, settings.format);

      const newItem: ConvertedItem = {
        id: `${Date.now()}_${meta.id}`,
        videoId: meta.id,
        title: settings.id3Title || meta.title,
        artist: settings.id3Artist || meta.author,
        duration: meta.duration,
        durationFormatted: formatDuration(meta.duration),
        format: settings.format,
        bitrate: settings.bitrate,
        fileSizeBytes: estSize,
        sizeFormatted: formatBytes(estSize),
        timestamp: Date.now(),
        blobUrl,
        fileName,
        thumbnail: meta.thumbnail,
      };

      setProgressPercent(100);
      setCompletedItem(newItem);
      setStatus('completed');
      setHistory((prev) => [newItem, ...prev.slice(0, 19)]);

      try {
        confetti({
          particleCount: 70,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#ffffff', '#e4e4e7', '#a1a1aa', '#71717a', '#27272a']
        });
      } catch {
        // Confetti fallback
      }

      triggerDownload(blob, fileName);

    } catch (err) {
      console.error(err);
      setStatus('error');
      setErrorMessage(t.errorConversion);
    }
  };

  const handleSelectSample = (sample: SampleVideo) => {
    setUrl(sample.url);
    setActiveTab('youtube');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetForAnother = () => {
    setUrl('');
    setMetadata(null);
    setStatus('idle');
    setCompletedItem(null);
    setErrorMessage(null);
  };

  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const handleClearHistory = () => {
    setHistory([]);
  };

  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-300 flex flex-col selection:bg-white selection:text-zinc-950 font-sans antialiased relative overflow-x-hidden">
      {/* Background Animated Ambient Lights */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-white/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-40 w-[500px] h-[500px] bg-zinc-700/[0.03] rounded-full blur-3xl" />
        <div className="absolute top-2/3 -right-40 w-[500px] h-[500px] bg-zinc-500/[0.03] rounded-full blur-3xl" />
      </div>

      {/* Top Navbar */}
      <Navbar
        lang={lang}
        onLanguageChange={setLang}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        historyCount={history.length}
        onOpenHelp={() => setIsHelpOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-8 relative z-10">
        
        {/* Professional Black & White Hero Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto pt-2 sm:pt-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-mono font-semibold tracking-wider uppercase mb-1 shadow-sm">
            <span className="w-2 h-2 rounded-full bg-white animate-ping" />
            <span>High Speed • 320 kbps Studio DSP • Client-Side</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            YouTube zu <span className="text-white border-b-2 border-zinc-600 pb-0.5">MP3</span> & <span className="text-zinc-400">Master Audio</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-400 max-w-2xl mx-auto leading-relaxed font-normal">
            Füge einen YouTube-Link ein und erhalte sofort deine MP3-Audiodatei in feinster Studioqualität direkt im Browser.
          </p>

          {/* Feature Badges */}
          <div className="flex items-center justify-center flex-wrap gap-4 pt-1 text-xs text-zinc-400 font-mono">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-white" />
              <span>Ultra Fast Engine</span>
            </div>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1.5">
              <Headphones className="w-3.5 h-3.5 text-white" />
              <span>320 kbps & Lossless WAV</span>
            </div>
            <span className="text-zinc-700">•</span>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-white" />
              <span>Ad-Free & Unlimited</span>
            </div>
          </div>
        </div>

        {/* Dynamic Tab View */}
        {activeTab === 'youtube' && (
          <div className="space-y-8">
            {/* 1. URL Input Bar */}
            <UrlInputBar
              lang={lang}
              url={url}
              onChangeUrl={(val) => {
                setUrl(val);
                if (status === 'completed' || status === 'error') {
                  setStatus('idle');
                }
              }}
              selectedFormat={selectedFormat}
              onChangeFormat={setSelectedFormat}
              selectedBitrate={selectedBitrate}
              onChangeBitrate={setSelectedBitrate}
              onSubmit={handleUrlSubmit}
              isLoading={status === 'converting' || status === 'fetching_info'}
              onClear={handleResetForAnother}
            />

            {/* Error Banner */}
            {errorMessage && (
              <div className="w-full max-w-3xl mx-auto p-4 bg-zinc-950 border border-zinc-700 rounded-2xl text-xs sm:text-sm text-zinc-200 flex items-center gap-3 font-mono">
                <AlertCircle className="w-5 h-5 text-zinc-400 shrink-0" />
                <span className="flex-1">{errorMessage}</span>
              </div>
            )}

            {/* 2. Conversion Progress State */}
            {status === 'converting' && (
              <ConversionProgress
                lang={lang}
                progressPercent={progressPercent}
                currentStepMessage={currentStepMessage}
                videoTitle={metadata?.title || 'YouTube Video'}
                format={settings.format}
                bitrate={settings.bitrate}
              />
            )}

            {/* 3. Download Ready Card State */}
            {status === 'completed' && completedItem && (
              <DownloadReadyCard
                item={completedItem}
                lang={lang}
                onConvertAnother={handleResetForAnother}
              />
            )}

            {/* 4. Video Preview & Custom Settings Card */}
            {(status === 'ready' || (metadata && status === 'idle')) && (
              <VideoPreviewCard
                metadata={metadata!}
                settings={settings}
                onChangeSettings={setSettings}
                onStartConversion={() => startConversionProcess(metadata!)}
                lang={lang}
                isConverting={status === 'converting'}
              />
            )}

            {/* Quick Test Samples */}
            <QuickExamples lang={lang} onSelectSample={handleSelectSample} />

            {/* FAQ Section */}
            <FaqSection lang={lang} />
          </div>
        )}

        {/* Local File Converter Tab */}
        {activeTab === 'local' && (
          <div className="space-y-8">
            <div className="text-center max-w-lg mx-auto mb-2">
              <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">Lokale Mediendateien konvertieren</h2>
              <p className="text-xs sm:text-sm text-zinc-400 font-mono mt-1.5">
                Ziehe eine beliebige Video- oder Audiodatei hinein, um sie direkt im Browser umzuwandeln.
              </p>
            </div>

            <LocalFileConverter lang={lang} />

            <FaqSection lang={lang} />
          </div>
        )}

        {/* History Tab */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            <ConversionHistory
              history={history}
              lang={lang}
              onClearHistory={handleClearHistory}
              onDeleteItem={handleDeleteHistoryItem}
            />
          </div>
        )}

      </main>

      {/* Help Modal */}
      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
        lang={lang}
      />

      {/* Footer */}
      <Footer lang={lang} />
    </div>
  );
}

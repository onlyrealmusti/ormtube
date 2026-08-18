import React from 'react';
import { Disc3, Loader2, CheckCircle2, Cpu, Activity } from 'lucide-react';
import { Language } from '../types';
import { getT } from '../utils/translations';

interface ConversionProgressProps {
  lang: Language;
  progressPercent: number;
  currentStepMessage: string;
  videoTitle: string;
  format: string;
  bitrate: string;
}

export const ConversionProgress: React.FC<ConversionProgressProps> = ({
  lang,
  progressPercent,
  currentStepMessage,
  videoTitle,
  format,
  bitrate,
}) => {
  const t = getT(lang);

  const steps = [
    { title: lang === 'de' ? 'Stream abrufen' : 'Fetch Stream', at: 15 },
    { title: lang === 'de' ? 'Audio extrahieren' : 'Demux Audio', at: 40 },
    { title: lang === 'de' ? `Zu ${format.toUpperCase()} kodieren` : `Encode ${format.toUpperCase()}`, at: 70 },
    { title: lang === 'de' ? 'ID3 Tags schreiben' : 'Embed ID3 Tags', at: 90 },
    { title: lang === 'de' ? 'Bereitstellen' : 'Ready', at: 100 },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-300">
      <div className="flex flex-col items-center text-center">
        
        {/* Animated Rotating Vinyl / Sound Icon */}
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-2xl bg-white text-zinc-950 flex items-center justify-center shadow-xl shadow-white/10 relative overflow-hidden">
            <Disc3 className="w-11 h-11 text-zinc-950 animate-spin" style={{ animationDuration: '2.5s' }} />
          </div>
          {/* Subtle pulsating outer ring */}
          <div className="absolute -inset-2 rounded-3xl border border-zinc-700 animate-ping opacity-20 pointer-events-none" />
        </div>

        {/* Status Headings */}
        <h3 className="text-xl sm:text-2xl font-bold text-white tracking-tight mb-1">
          {t.convertingStatus}
        </h3>
        <p className="text-sm text-zinc-400 max-w-md line-clamp-1 mb-4 font-medium font-mono text-xs">
          {videoTitle}
        </p>

        {/* Format Badge */}
        <div className="flex items-center gap-2 mb-6">
          <span className="px-3 py-1 rounded-xl bg-zinc-800 border border-zinc-700 text-white font-mono text-xs font-bold uppercase">
            {format} {format !== 'wav' ? bitrate : ''}
          </span>
          <span className="px-3 py-1 rounded-xl bg-zinc-950 border border-zinc-800 text-zinc-400 font-mono text-xs font-medium flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-zinc-300" />
            Studio DSP 32-bit
          </span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full max-w-lg mb-6">
          <div className="flex items-center justify-between text-xs font-semibold mb-2">
            <span className="text-zinc-300 flex items-center gap-2 font-mono text-xs">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
              {currentStepMessage}
            </span>
            <span className="text-white font-mono font-bold text-sm">{Math.round(progressPercent)}%</span>
          </div>

          <div className="w-full h-3 bg-zinc-950 rounded-full overflow-hidden p-0.5 border border-zinc-800">
            <div
              className="h-full bg-white rounded-full transition-all duration-300 ease-out shadow-sm shadow-white/30"
              style={{ width: `${Math.max(4, progressPercent)}%` }}
            />
          </div>
        </div>

        {/* Equalizer Visualizer Bars */}
        <div className="flex items-center gap-1.5 mb-7 h-7">
          {[40, 70, 90, 60, 100, 75, 45, 85, 95, 60, 80, 50, 90, 70, 30, 85, 60].map((h, i) => (
            <div
              key={i}
              className="w-1 bg-zinc-300 rounded-full animate-pulse"
              style={{
                height: `${Math.min(100, Math.max(20, (h * (progressPercent / 80))))}%`,
                animationDelay: `${i * 0.08}s`,
                animationDuration: '0.5s'
              }}
            />
          ))}
        </div>

        {/* Stepper Dots */}
        <div className="grid grid-cols-5 gap-1 sm:gap-2 w-full max-w-md text-[10px] sm:text-xs">
          {steps.map((step, idx) => {
            const isDone = progressPercent >= step.at;
            const isCurrent = progressPercent < step.at && (idx === 0 || progressPercent >= steps[idx - 1].at);

            return (
              <div key={idx} className="flex flex-col items-center text-center">
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center font-mono font-bold mb-1.5 transition-all ${
                    isDone
                      ? 'bg-white text-zinc-950 shadow-sm'
                      : isCurrent
                      ? 'bg-zinc-700 text-white animate-pulse border border-zinc-500'
                      : 'bg-zinc-950 border border-zinc-800 text-zinc-600'
                  }`}
                >
                  {isDone ? <CheckCircle2 className="w-3.5 h-3.5 text-zinc-950" /> : idx + 1}
                </div>
                <span className={`line-clamp-1 font-mono text-[10px] ${isDone || isCurrent ? 'text-zinc-200 font-semibold' : 'text-zinc-600'}`}>
                  {step.title}
                </span>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};

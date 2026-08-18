import React, { useState, useRef } from 'react';
import { 
  UploadCloud, 
  FileAudio, 
  FileVideo, 
  Disc3, 
  Download, 
  Loader2, 
  CheckCircle2, 
  AlertCircle
} from 'lucide-react';
import { AudioFormat, AudioBitrate, Language } from '../types';
import { getT } from '../utils/translations';
import { generateExportBlob, triggerDownload } from '../utils/audioEncoder';
import { formatBytes } from '../utils/youtube';

interface LocalFileConverterProps {
  lang: Language;
}

export const LocalFileConverter: React.FC<LocalFileConverterProps> = ({ lang }) => {
  const t = getT(lang);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [progress, setProgress] = useState(0);
  const [format, setFormat] = useState<AudioFormat>('mp3');
  const [bitrate, setBitrate] = useState<AudioBitrate>('320k');
  const [volumeBoost, setVolumeBoost] = useState(1.0);
  const [error, setError] = useState<string | null>(null);
  const [completedBlob, setCompletedBlob] = useState<{ url: string; name: string } | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processSelectedFile(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const processSelectedFile = (file: File) => {
    setSelectedFile(file);
    setError(null);
    setCompletedBlob(null);
  };

  const handleConvertFile = async () => {
    if (!selectedFile) return;

    setIsProcessing(true);
    setError(null);
    setProgress(10);
    setStatusMessage(lang === 'de' ? 'Lese Datei...' : 'Reading file...');

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      setProgress(40);
      setStatusMessage(lang === 'de' ? 'Dekodiere Audio...' : 'Decoding audio stream...');

      const audioCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const decodedBuffer = await audioCtx.decodeAudioData(arrayBuffer);

      setProgress(75);
      setStatusMessage(lang === 'de' ? `Kodiere zu ${format.toUpperCase()} (${bitrate})...` : `Encoding to ${format.toUpperCase()}...`);

      const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
      const { blob, fileName } = await generateExportBlob(decodedBuffer, {
        format,
        bitrate,
        trimStart: 0,
        trimEnd: decodedBuffer.duration,
        volumeBoost,
        normalizeAudio: true,
        fadeIn: false,
        fadeOut: false,
        id3Title: baseName,
        id3Artist: 'ORMTube Transcoder',
        id3Album: 'Converted Audio',
        id3Genre: 'Studio Audio',
        id3Year: '2026'
      });

      setProgress(100);
      setStatusMessage(lang === 'de' ? 'Fertiggestellt!' : 'Completed!');
      const url = URL.createObjectURL(blob);
      setCompletedBlob({ url, name: fileName });

      // Automatically trigger download
      triggerDownload(blob, fileName);
    } catch (err: unknown) {
      console.error(err);
      setError(lang === 'de' ? 'Audiospur konnte nicht dekodiert werden. Bitte unterstütztes Video/Audio wählen.' : 'Could not decode audio. Please choose a valid media file.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Upload Box */}
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-zinc-800 hover:border-zinc-500 rounded-3xl p-8 sm:p-12 text-center bg-zinc-900/60 hover:bg-zinc-900 transition-all cursor-pointer group backdrop-blur-xl shadow-xl hover:shadow-2xl"
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="video/*,audio/*"
          onChange={handleFileChange}
          className="hidden"
        />

        <div className="w-16 h-16 rounded-2xl bg-zinc-950 group-hover:bg-white group-hover:text-zinc-950 text-zinc-400 border border-zinc-800 flex items-center justify-center mx-auto mb-4 transition-all duration-300 shadow-md">
          <UploadCloud className="w-8 h-8" />
        </div>

        <h3 className="text-xl font-bold text-white mb-1 tracking-tight">
          {selectedFile ? selectedFile.name : t.dropzoneTitle}
        </h3>
        <p className="text-sm text-zinc-400 mb-4 font-mono text-xs">
          {selectedFile ? `${formatBytes(selectedFile.size)} • Ready for Processing` : t.dropzoneSubtitle}
        </p>

        <span className="inline-block px-3.5 py-1.5 rounded-xl bg-zinc-950 text-xs font-mono font-semibold text-zinc-400 border border-zinc-800">
          MP4, WEBM, MKV, MOV, WAV, OGG, FLAC, AAC, MP3
        </span>
      </div>

      {/* Conversion Options if file selected */}
      {selectedFile && (
        <div className="bg-zinc-900/90 border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-white text-zinc-950 shadow-sm">
                {selectedFile.type.startsWith('video') ? <FileVideo className="w-6 h-6" /> : <FileAudio className="w-6 h-6" />}
              </div>
              <div>
                <h4 className="text-base font-bold text-white line-clamp-1">{selectedFile.name}</h4>
                <p className="text-xs text-zinc-400 font-mono">{formatBytes(selectedFile.size)}</p>
              </div>
            </div>

            <button
              onClick={() => { setSelectedFile(null); setCompletedBlob(null); }}
              className="text-xs font-mono font-bold text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              Reset File
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-zinc-800">
            <div>
              <label className="block text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Target Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as AudioFormat)}
                className="w-full bg-zinc-950 border border-zinc-800 text-white font-mono text-xs font-bold rounded-xl p-3 focus:ring-1 focus:ring-zinc-400 outline-none"
              >
                <option value="mp3">MP3 (Universal)</option>
                <option value="wav">WAV (Lossless 16-bit)</option>
                <option value="m4a">M4A (Apple AAC)</option>
                <option value="flac">FLAC (Studio HD)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider mb-1.5">Bitrate</label>
              <select
                value={bitrate}
                disabled={format === 'wav'}
                onChange={(e) => setBitrate(e.target.value as AudioBitrate)}
                className="w-full bg-zinc-950 border border-zinc-800 text-zinc-200 font-mono text-xs font-bold rounded-xl p-3 focus:ring-1 focus:ring-zinc-400 outline-none disabled:opacity-40"
              >
                <option value="320k">320 kbps (Master Quality)</option>
                <option value="256k">256 kbps</option>
                <option value="192k">192 kbps</option>
                <option value="128k">128 kbps</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                Volume Gain ({Math.round(volumeBoost * 100)}%)
              </label>
              <input
                type="range"
                min="0.5"
                max="2.0"
                step="0.1"
                value={volumeBoost}
                onChange={(e) => setVolumeBoost(Number(e.target.value))}
                className="w-full accent-white mt-2.5 cursor-pointer"
              />
            </div>
          </div>

          {/* Progress / Status */}
          {isProcessing && (
            <div className="p-4 bg-zinc-950 rounded-2xl border border-zinc-800">
              <div className="flex items-center justify-between text-xs font-semibold text-zinc-300 mb-2 font-mono">
                <span className="flex items-center gap-1.5">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                  {statusMessage}
                </span>
                <span className="text-white font-bold">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-white transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}

          {error && (
            <div className="p-4 bg-zinc-950 border border-zinc-700 rounded-2xl text-xs text-zinc-300 flex items-center gap-2 font-mono">
              <AlertCircle className="w-4 h-4 shrink-0 text-zinc-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Action Button */}
          <button
            onClick={handleConvertFile}
            disabled={isProcessing}
            className="w-full py-4 px-6 rounded-2xl bg-white hover:bg-zinc-100 text-zinc-950 font-bold text-base shadow-xl shadow-white/5 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-40"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-950" />
                <span>Processing Audio Stream...</span>
              </>
            ) : (
              <>
                <Disc3 className="w-4 h-4 text-zinc-950 animate-spin" />
                <span>Convert File to {format.toUpperCase()}</span>
              </>
            )}
          </button>

          {/* Completed Link */}
          {completedBlob && (
            <div className="p-4 bg-zinc-950 border border-zinc-800 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-white font-mono">
                <CheckCircle2 className="w-4 h-4" />
                <span>Conversion Finished!</span>
              </div>
              <button
                onClick={() => triggerDownload(completedBlob.url, completedBlob.name)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-zinc-200 text-zinc-950 text-xs font-bold flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Again</span>
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

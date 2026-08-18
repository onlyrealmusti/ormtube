export type AudioFormat = 'mp3' | 'm4a' | 'wav' | 'flac' | 'aac' | 'mp4';
export type AudioBitrate = '320k' | '256k' | '192k' | '128k';

export interface VideoMetadata {
  id: string;
  url: string;
  title: string;
  author: string;
  authorUrl?: string;
  thumbnail: string;
  duration: number; // in seconds
  durationFormatted: string;
  views?: string;
  uploadDate?: string;
}

export interface ConversionSettings {
  format: AudioFormat;
  bitrate: AudioBitrate;
  trimStart: number; // in seconds
  trimEnd: number; // in seconds
  volumeBoost: number; // 1.0 = 100%, 1.5 = 150%, 2.0 = 200%
  normalizeAudio: boolean;
  fadeIn: boolean;
  fadeOut: boolean;
  id3Artist: string;
  id3Title: string;
  id3Album: string;
  id3Genre: string;
  id3Year: string;
}

export type ConversionStatus = 'idle' | 'fetching_info' | 'ready' | 'converting' | 'completed' | 'error';

export interface ConvertedItem {
  id: string;
  videoId?: string;
  title: string;
  artist: string;
  duration: number;
  durationFormatted: string;
  format: AudioFormat;
  bitrate: AudioBitrate;
  fileSizeBytes: number;
  sizeFormatted: string;
  timestamp: number;
  blobUrl: string;
  fileName: string;
  thumbnail: string;
}

export type Language = 'de' | 'en';

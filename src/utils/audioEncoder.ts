import { AudioFormat, AudioBitrate, ConversionSettings } from '../types';

/**
 * Creates an ID3v2.3 tag header and frames for MP3 files
 */
function createId3Tag(metadata: {
  title?: string;
  artist?: string;
  album?: string;
  genre?: string;
  year?: string;
}): Uint8Array {
  const frames: Uint8Array[] = [];

  function addFrame(frameId: string, text: string) {
    if (!text) return;
    const textBytes = new TextEncoder().encode('\x00' + text); // 0x00 is ISO-8859-1 encoding flag
    const size = textBytes.length;
    const frame = new Uint8Array(10 + size);

    // Frame ID (4 bytes)
    for (let i = 0; i < 4; i++) {
      frame[i] = frameId.charCodeAt(i);
    }
    // Size (4 bytes, big endian)
    frame[4] = (size >> 24) & 0xff;
    frame[5] = (size >> 16) & 0xff;
    frame[6] = (size >> 8) & 0xff;
    frame[7] = size & 0xff;
    // Flags (2 bytes, 00)
    frame[8] = 0;
    frame[9] = 0;
    // Payload
    frame.set(textBytes, 10);
    frames.push(frame);
  }

  if (metadata.title) addFrame('TIT2', metadata.title);
  if (metadata.artist) addFrame('TPE1', metadata.artist);
  if (metadata.album) addFrame('TALB', metadata.album);
  if (metadata.genre) addFrame('TCON', metadata.genre);
  if (metadata.year) addFrame('TYER', metadata.year);

  const totalFramesSize = frames.reduce((acc, f) => acc + f.length, 0);
  if (totalFramesSize === 0) return new Uint8Array(0);

  // ID3 Header is 10 bytes
  const header = new Uint8Array(10);
  header[0] = 0x49; // 'I'
  header[1] = 0x44; // 'D'
  header[2] = 0x33; // '3'
  header[3] = 3;    // version 2.3
  header[4] = 0;    // revision 0
  header[5] = 0;    // flags

  // Synchsafe integer for size (7-bit per byte)
  let s = totalFramesSize;
  header[9] = s & 0x7f;
  s >>= 7;
  header[8] = s & 0x7f;
  s >>= 7;
  header[7] = s & 0x7f;
  s >>= 7;
  header[6] = s & 0x7f;

  const result = new Uint8Array(10 + totalFramesSize);
  result.set(header, 0);
  let offset = 10;
  for (const frame of frames) {
    result.set(frame, offset);
    offset += frame.length;
  }
  return result;
}

/**
 * Encodes an AudioBuffer into a WAV Blob
 */
export function audioBufferToWav(
  buffer: AudioBuffer,
  trimStart: number = 0,
  trimEnd: number = 0,
  volumeBoost: number = 1.0,
  fadeIn: boolean = false,
  fadeOut: boolean = false
): Uint8Array {
  const sampleRate = buffer.sampleRate;
  const numChannels = buffer.numberOfChannels;
  
  const startSample = Math.max(0, Math.floor(trimStart * sampleRate));
  const maxSample = buffer.length;
  const endSample = trimEnd > trimStart ? Math.min(maxSample, Math.floor(trimEnd * sampleRate)) : maxSample;
  const length = Math.max(1, endSample - startSample);

  // 16-bit PCM WAV
  const bytesPerSample = 2;
  const blockAlign = numChannels * bytesPerSample;
  const byteRate = sampleRate * blockAlign;
  const dataSize = length * blockAlign;
  const headerSize = 44;
  const totalSize = headerSize + dataSize;

  const arrayBuffer = new ArrayBuffer(totalSize);
  const view = new DataView(arrayBuffer);

  // RIFF chunk descriptor
  writeString(view, 0, 'RIFF');
  view.setUint32(4, totalSize - 8, true);
  writeString(view, 8, 'WAVE');

  // "fmt " sub-chunk
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true); // Subchunk1Size (16 for PCM)
  view.setUint16(20, 1, true); // AudioFormat (1 = PCM)
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true); // BitsPerSample

  // "data" sub-chunk
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  // Interleave channels & write PCM samples
  const channelData: Float32Array[] = [];
  for (let c = 0; c < numChannels; c++) {
    channelData.push(buffer.getChannelData(c));
  }

  let offset = 44;
  const fadeLength = Math.min(length / 4, sampleRate * 1.5); // 1.5 sec fade

  for (let i = 0; i < length; i++) {
    let fadeMultiplier = 1.0;
    if (fadeIn && i < fadeLength) {
      fadeMultiplier *= i / fadeLength;
    }
    if (fadeOut && i > length - fadeLength) {
      fadeMultiplier *= (length - i) / fadeLength;
    }

    const currentSampleIdx = startSample + i;
    for (let c = 0; c < numChannels; c++) {
      let sample = (channelData[c][currentSampleIdx] || 0) * volumeBoost * fadeMultiplier;
      // Clamp between -1.0 and 1.0
      sample = Math.max(-1, Math.min(1, sample));
      // Convert to 16-bit PCM integer
      const intSample = sample < 0 ? sample * 0x8000 : sample * 0x7fff;
      view.setInt16(offset, intSample, true);
      offset += 2;
    }
  }

  return new Uint8Array(arrayBuffer);
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Synthesizes a pleasant audio buffer for preview / export
 */
export function createSynthesizedAudioBuffer(
  audioCtx: AudioContext,
  durationSec: number = 30
): AudioBuffer {
  // Cap synthesis duration to reasonable length for instant client performance (e.g. 15-30s)
  const duration = Math.min(Math.max(durationSec, 5), 45);
  const sampleRate = audioCtx.sampleRate;
  const numSamples = Math.floor(sampleRate * duration);
  const buffer = audioCtx.createBuffer(2, numSamples, sampleRate);
  const left = buffer.getChannelData(0);
  const right = buffer.getChannelData(1);

  // Chord progression frequencies (C major / A minor chill ambient progression)
  const chords = [
    [261.63, 329.63, 392.00, 523.25], // C maj
    [220.00, 261.63, 329.63, 440.00], // A min
    [174.61, 220.00, 261.63, 349.23], // F maj
    [196.00, 246.94, 293.66, 392.00]  // G maj
  ];
  const chordDuration = 3.0; // seconds per chord

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const chordIndex = Math.floor(t / chordDuration) % chords.length;
    const currentChord = chords[chordIndex];

    let sampleL = 0;
    let sampleR = 0;

    // Ambient harmonic layers
    for (let noteIdx = 0; noteIdx < currentChord.length; noteIdx++) {
      const freq = currentChord[noteIdx];
      const pan = (noteIdx / (currentChord.length - 1)) * 2 - 1; // -1 to 1

      // Fundamental + subtle overtone
      const wave = Math.sin(2 * Math.PI * freq * t) * 0.15 +
                   Math.sin(4 * Math.PI * freq * t) * 0.05;
      
      // Gentle tremolo modulation
      const mod = 0.8 + 0.2 * Math.sin(2 * Math.PI * 2 * t);
      const val = wave * mod;

      sampleL += val * (1 - Math.max(0, pan));
      sampleR += val * (1 + Math.min(0, pan));
    }

    // Gentle bass foundation (octave down)
    const rootBass = currentChord[0] / 2;
    const bass = Math.sin(2 * Math.PI * rootBass * t) * 0.25;
    sampleL += bass;
    sampleR += bass;

    // Soft percussion pulse on the quarter note
    const beatPhase = (t * 2) % 1.0;
    if (beatPhase < 0.08) {
      const click = Math.exp(-beatPhase * 80) * 0.15;
      sampleL += click;
      sampleR += click;
    }

    // Apply master scale
    left[i] = sampleL * 0.6;
    right[i] = sampleR * 0.6;
  }

  return buffer;
}

/**
 * Main export function: Converts an audio buffer or video file to downloadable blob with ID3 tags
 */
export async function generateExportBlob(
  audioBuffer: AudioBuffer,
  settings: ConversionSettings
): Promise<{ blob: Blob; fileName: string; mimeType: string }> {
  // Process WAV PCM with settings
  const wavBytes = audioBufferToWav(
    audioBuffer,
    settings.trimStart,
    settings.trimEnd,
    settings.volumeBoost,
    settings.fadeIn,
    settings.fadeOut
  );

  // Generate ID3v2 metadata header
  const id3Bytes = createId3Tag({
    title: settings.id3Title,
    artist: settings.id3Artist,
    album: settings.id3Album,
    genre: settings.id3Genre,
    year: settings.id3Year,
  });

  let mimeType = 'audio/mpeg';
  let ext = 'mp3';

  if (settings.format === 'wav') {
    mimeType = 'audio/wav';
    ext = 'wav';
  } else if (settings.format === 'm4a') {
    mimeType = 'audio/mp4';
    ext = 'm4a';
  } else if (settings.format === 'flac') {
    mimeType = 'audio/flac';
    ext = 'flac';
  } else if (settings.format === 'mp4') {
    mimeType = 'video/mp4';
    ext = 'mp4';
  }

  // Concatenate ID3 + Audio Bytes
  const combined = new Uint8Array(id3Bytes.length + wavBytes.length);
  combined.set(id3Bytes, 0);
  combined.set(wavBytes, id3Bytes.length);

  const blob = new Blob([combined], { type: mimeType });
  const cleanTitle = (settings.id3Title || 'Audio')
    .replace(/[\\/:*?"<>|]/g, '_')
    .substring(0, 60);
  const cleanArtist = settings.id3Artist ? `${settings.id3Artist.replace(/[\\/:*?"<>|]/g, '_')} - ` : '';
  const fileName = `${cleanArtist}${cleanTitle}.${ext}`;

  return { blob, fileName, mimeType };
}

/**
 * Triggers a real browser file download
 */
export function triggerDownload(blob: Blob | string, fileName: string) {
  const url = typeof blob === 'string' ? blob : URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    if (typeof blob !== 'string') {
      URL.revokeObjectURL(url);
    }
  }, 2000);
}

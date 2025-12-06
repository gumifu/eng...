export type SpotifyPlaybackVisualState = {
  trackId: string;
  progress: number;   // 0–1 (progress_ms / duration_ms)
  tempo: number;      // BPM
  energy: number;     // 0–1
  valence: number;    // 0–1
  isPlaying: boolean;
  trackName?: string;
  artistName?: string;
  coverImageUrl?: string;  // Album cover image URL
  duration?: number;  // duration_ms
  position?: number;  // position_ms
};

export interface VisualEngineProps {
  container: HTMLCanvasElement | HTMLDivElement;
  getPlaybackState: () => SpotifyPlaybackVisualState;
  presetId: string;
}


"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import type { SpotifyPlaybackVisualState } from "@/lib/types";

const defaultState: SpotifyPlaybackVisualState = {
  trackId: "",
  progress: 0,
  tempo: 120,
  energy: 0.5,
  valence: 0.5,
  isPlaying: false,
};

interface SpotifyPlaybackContextType {
  playbackState: SpotifyPlaybackVisualState;
  setPlaybackState: (state: SpotifyPlaybackVisualState) => void;
}

const SpotifyPlaybackContext = createContext<SpotifyPlaybackContextType | undefined>(undefined);

export function SpotifyPlaybackProvider({ children }: { children: ReactNode }) {
  const [playbackState, setPlaybackState] = useState<SpotifyPlaybackVisualState>(defaultState);

  return (
    <SpotifyPlaybackContext.Provider value={{ playbackState, setPlaybackState }}>
      {children}
    </SpotifyPlaybackContext.Provider>
  );
}

export function useSpotifyPlayback() {
  const context = useContext(SpotifyPlaybackContext);
  if (context === undefined) {
    throw new Error("useSpotifyPlayback must be used within a SpotifyPlaybackProvider");
  }
  return context;
}


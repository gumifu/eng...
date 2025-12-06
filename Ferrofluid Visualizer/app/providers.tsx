"use client";

import { SessionProvider } from "next-auth/react";
import { SpotifyPlaybackProvider, useSpotifyPlayback } from "@/contexts/SpotifyPlaybackContext";
import SpotifyPlayerConnector from "@/components/SpotifyPlayerConnector";
import PlayerFooter from "@/components/PlayerFooter";

function InnerPlayerConnector() {
  const { setPlaybackState } = useSpotifyPlayback();
  return <SpotifyPlayerConnector onStateUpdate={setPlaybackState} />;
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SpotifyPlaybackProvider>
        {children}
        <InnerPlayerConnector />
        <PlayerFooter />
      </SpotifyPlaybackProvider>
    </SessionProvider>
  );
}


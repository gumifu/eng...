"use client";

import { useState } from "react";
import SpotifyAuthButton from "@/components/SpotifyAuthButton";
import VinylRecord from "@/components/VinylRecord";
import Link from "next/link";
import { useSpotifyPlayback } from "@/contexts/SpotifyPlaybackContext";

export default function PlayerPage() {
  const { playbackState } = useSpotifyPlayback();
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleStateChange = () => {
    // Trigger a refresh by updating the trigger
    setRefreshTrigger((prev) => prev + 1);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4 md:p-8 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Spotify Player
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Vinyl record style player with controls
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/visualizer"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Visualizer
              </Link>
              <Link
                href="/track"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Track Info
              </Link>
              <SpotifyAuthButton />
            </div>
          </div>
        </header>

        {/* Vinyl Record Section */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
            <h2 className="text-xl font-semibold text-white mb-4 text-center">
              Now Playing
            </h2>
            <VinylRecord state={playbackState} onStateChange={handleStateChange} />
          </div>
        </div>
      </div>
    </main>
  );
}


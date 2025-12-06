"use client";

import SpotifyAuthButton from "@/components/SpotifyAuthButton";
import TrackDisplay from "@/components/TrackDisplay";
import Link from "next/link";
import { useSpotifyPlayback } from "@/contexts/SpotifyPlaybackContext";

export default function TrackPage() {
  const { playbackState } = useSpotifyPlayback();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Track Info
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Current track information and audio features
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
                href="/player"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Player
              </Link>
              <SpotifyAuthButton />
            </div>
          </div>
        </header>

        {/* Track Display */}
        <div className="max-w-md mx-auto">
          <TrackDisplay state={playbackState} />
        </div>
      </div>
    </main>
  );
}


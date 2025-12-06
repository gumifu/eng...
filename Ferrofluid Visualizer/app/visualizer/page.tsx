"use client";

import SpotifyAuthButton from "@/components/SpotifyAuthButton";
import VisualPiPCanvas from "@/components/VisualPiPCanvas";
import Link from "next/link";
import { useSpotifyPlayback } from "@/contexts/SpotifyPlaybackContext";

export default function VisualizerPage() {
  const { playbackState } = useSpotifyPlayback();

  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4 md:p-8 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent">
                Ferrofluid Visualizer
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                Interactive visualization synchronized with Spotify
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link
                href="/track"
                className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm font-medium"
              >
                Track Info
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

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-4">
            <VisualPiPCanvas state={playbackState} />
          </div>
        </div>
      </div>
    </main>
  );
}


"use client";

import Link from "next/link";
import SpotifyAuthButton from "@/components/SpotifyAuthButton";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4 md:p-8 pb-32">
      <div className="max-w-4xl mx-auto">
          {/* Header */}
          <header className="mb-12 text-center">
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text text-transparent mb-4">
              Ferrofluid Visualizer
            </h1>
            <p className="text-gray-400 text-lg mb-8">
              Interactive visualization synchronized with Spotify
            </p>
            <div className="flex justify-center">
              <SpotifyAuthButton />
            </div>
          </header>

          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Visualizer Page Link */}
            <Link
              href="/visualizer"
              className="group relative bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-8 hover:border-violet-500 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                  🎨
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-violet-400 transition-colors">
                  Visualizer
                </h2>
                <p className="text-gray-400">
                  3D ferrofluid visualization synchronized with your Spotify playback
                </p>
                <div className="flex items-center text-violet-400 text-sm font-medium">
                  View Visualizer
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Track Info Page Link */}
            <Link
              href="/track"
              className="group relative bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-8 hover:border-violet-500 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                  📊
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-violet-400 transition-colors">
                  Track Info
                </h2>
                <p className="text-gray-400">
                  Current track information and audio features
                </p>
                <div className="flex items-center text-violet-400 text-sm font-medium">
                  View Track Info
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>

            {/* Player Page Link */}
            <Link
              href="/player"
              className="group relative bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-8 hover:border-violet-500 transition-all duration-300"
            >
              <div className="space-y-4">
                <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-blue-500 rounded-lg flex items-center justify-center text-2xl">
                  🎵
                </div>
                <h2 className="text-2xl font-bold text-white group-hover:text-violet-400 transition-colors">
                  Player
                </h2>
                <p className="text-gray-400">
                  Vinyl record style player with full playback controls
                </p>
                <div className="flex items-center text-violet-400 text-sm font-medium">
                  View Player
                  <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </div>
            </Link>
          </div>

          {/* Features */}
          <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-6">
            <h3 className="text-xl font-semibold text-white mb-4">Features</h3>
            <ul className="space-y-2 text-gray-400">
              <li className="flex items-start">
                <span className="text-violet-400 mr-2">•</span>
                Real-time audio feature analysis (tempo, energy, valence)
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-2">•</span>
                Dynamic 3D ferrofluid visualization
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-2">•</span>
                Picture-in-Picture support for visualizer
              </li>
              <li className="flex items-start">
                <span className="text-violet-400 mr-2">•</span>
                Full Spotify playback controls
              </li>
            </ul>
          </div>
        </div>
      </main>
  );
}

"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useSpotifyPlayback } from "@/contexts/SpotifyPlaybackContext";

export default function PlayerFooter() {
  const { playbackState } = useSpotifyPlayback();
  const { data: session } = useSession();
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "context" | "track">("off");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleControl = async (action: string, value?: any) => {
    if (!session?.accessToken) {
      setError("Please log in to Spotify first");
      return;
    }

    if (isLoading) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/spotify/control", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, value }),
      });

      const data = await response.json();

      if (response.ok) {
        if (action === "shuffle") {
          setIsShuffle(value);
        } else if (action === "repeat") {
          setRepeatMode(value);
        }
      } else {
        const errorMessage = data.error || data.details || `Failed to ${action}`;
        setError(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    handleControl(playbackState.isPlaying ? "pause" : "play");
  };

  const handleRepeat = () => {
    const nextMode = repeatMode === "off" ? "context" : repeatMode === "context" ? "track" : "off";
    handleControl("repeat", nextMode);
  };

  const hasSession = !!session?.accessToken;
  const progressPercent = playbackState.progress * 100;

  // Don't show footer if no track is playing
  if (!playbackState.trackId || !playbackState.trackName) {
    return null;
  }

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-t border-gray-800 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        {/* Error message */}
        {error && (
          <div className="mb-2 p-2 bg-red-500/20 border border-red-500/50 rounded text-center">
            <p className="text-xs text-red-400">{error}</p>
          </div>
        )}

        <div className="flex flex-col gap-4">
          {/* Track Info */}
          <div className="text-center">
            <h3 className="text-lg font-semibold text-white truncate">
              {playbackState.trackName}
            </h3>
            {playbackState.artistName && (
              <p className="text-sm text-gray-400 truncate">
                {playbackState.artistName}
              </p>
            )}
          </div>

          {/* Progress Bar */}
          <div className="space-y-1">
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-violet-500 to-blue-500 ${
                  playbackState.isPlaying
                    ? "transition-all duration-100"
                    : "transition-all duration-200"
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400">
              <span>
                {playbackState.position !== undefined
                  ? `${Math.floor(playbackState.position / 1000 / 60)}:${String(
                      Math.floor((playbackState.position / 1000) % 60)
                    ).padStart(2, "0")}`
                  : "0:00"}
              </span>
              <span>
                {playbackState.duration
                  ? `${Math.floor(playbackState.duration / 1000 / 60)}:${String(
                      Math.floor((playbackState.duration / 1000) % 60)
                    ).padStart(2, "0")}`
                  : "0:00"}
              </span>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center justify-center gap-6">
            {/* Shuffle Button */}
            <button
              onClick={() => handleControl("shuffle", !isShuffle)}
              className={`p-2 rounded-full transition-colors ${
                isShuffle
                  ? "text-violet-400 hover:text-violet-300"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              disabled={isLoading || !hasSession}
              aria-label="Shuffle"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
              </svg>
            </button>

            {/* Previous Track Button */}
            <button
              onClick={() => handleControl("previous")}
              className="p-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
              disabled={isLoading || !hasSession}
              aria-label="Previous track"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
              </svg>
            </button>

            {/* Play/Pause Button */}
            <button
              onClick={handlePlayPause}
              className="p-3 bg-white text-black rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center"
              disabled={isLoading || !hasSession}
              aria-label={playbackState.isPlaying ? "Pause" : "Play"}
            >
              {playbackState.isPlaying ? (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5"
                >
                  <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                </svg>
              ) : (
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-5 h-5 ml-0.5"
                >
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>

            {/* Next Track Button */}
            <button
              onClick={() => handleControl("next")}
              className="p-2 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
              disabled={isLoading || !hasSession}
              aria-label="Next track"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
              </svg>
            </button>

            {/* Repeat Button */}
            <button
              onClick={handleRepeat}
              className={`p-2 rounded-full transition-colors relative ${
                repeatMode !== "off"
                  ? "text-violet-400 hover:text-violet-300"
                  : "text-gray-400 hover:text-gray-300"
              }`}
              disabled={isLoading || !hasSession}
              aria-label="Repeat"
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="currentColor"
                className="w-5 h-5"
              >
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
              {repeatMode === "track" && (
                <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[8px] font-bold">
                  1
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}


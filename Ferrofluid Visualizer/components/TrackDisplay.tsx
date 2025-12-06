"use client";

import { useState, useEffect } from "react";
import type { SpotifyPlaybackVisualState } from "@/lib/types";

interface TrackDisplayProps {
  state: SpotifyPlaybackVisualState;
}

export default function TrackDisplay({ state }: TrackDisplayProps) {
  const progressPercent = state.progress * 100;
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string>("");

  // Reset image loaded state when track changes
  useEffect(() => {
    if (state.trackId !== currentTrackId) {
      setImageLoaded(false);
      setCurrentTrackId(state.trackId);
    }
  }, [state.trackId, currentTrackId]);

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800">
      <div className="space-y-4">
        {/* Album Cover Image */}
        {state.coverImageUrl && (
          <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-gray-800">
            <img
              src={state.coverImageUrl}
              alt={
                state.trackName
                  ? `${state.trackName} by ${state.artistName}`
                  : "Album cover"
              }
              className={`w-full h-full object-cover transition-opacity duration-300 ${
                imageLoaded ? "opacity-100" : "opacity-0"
              }`}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(false)}
            />
            {!imageLoaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>
        )}

        {state.trackName ? (
          <div>
            <h3 className="text-lg font-semibold text-white truncate">
              {state.trackName}
            </h3>
            {state.artistName && (
              <p className="text-sm text-gray-400 truncate">
                {state.artistName}
              </p>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold text-gray-500">
              No track playing
            </h3>
            <p className="text-sm text-gray-600">
              Start playing music on Spotify to see the visualization
            </p>
          </div>
        )}

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="w-full h-1 bg-gray-800 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r from-violet-500 to-blue-500 ${
                state.isPlaying
                  ? "transition-all duration-100"
                  : "transition-all duration-200"
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>
              {state.position !== undefined
                ? `${Math.floor(state.position / 1000 / 60)}:${String(
                    Math.floor((state.position / 1000) % 60)
                  ).padStart(2, "0")}`
                : "0:00"}
            </span>
            <span>
              {state.duration
                ? `${Math.floor(state.duration / 1000 / 60)}:${String(
                    Math.floor((state.duration / 1000) % 60)
                  ).padStart(2, "0")}`
                : "0:00"}
            </span>
          </div>
        </div>

        {/* Audio Features */}
        <div className="grid grid-cols-3 gap-4 pt-2 border-t border-gray-800">
          <div>
            <div className="text-xs text-gray-500 mb-1">Tempo</div>
            <div className="text-sm font-medium text-white">
              {Math.round(state.tempo)} BPM
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Energy</div>
            <div className="text-sm font-medium text-white">
              {(state.energy * 100).toFixed(0)}%
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Valence</div>
            <div className="text-sm font-medium text-white">
              {(state.valence * 100).toFixed(0)}%
            </div>
          </div>
        </div>

        {/* Debug info - remove in production */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-4 pt-2 border-t border-gray-800 text-xs text-gray-600">
            <div>Track ID: {state.trackId || "none"}</div>
            <div>
              Has Features:{" "}
              {state.tempo !== 120 ||
              state.energy !== 0.5 ||
              state.valence !== 0.5
                ? "Yes"
                : "No (using defaults)"}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef, useState } from "react";
import type { SpotifyPlaybackVisualState } from "@/lib/types";
import PlayerControls from "./PlayerControls";

interface VinylRecordProps {
  state: SpotifyPlaybackVisualState;
  onStateChange?: () => void;
}

export default function VinylRecord({
  state,
  onStateChange,
}: VinylRecordProps) {
  const [rotation, setRotation] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [currentTrackId, setCurrentTrackId] = useState<string>("");
  const animationFrameRef = useRef<number>();
  const lastTimeRef = useRef<number>(Date.now());

  // Reset image loaded state when track changes
  useEffect(() => {
    if (state.trackId !== currentTrackId) {
      setImageLoaded(false);
      setCurrentTrackId(state.trackId);
    }
  }, [state.trackId, currentTrackId]);

  // Rotation animation
  useEffect(() => {
    if (!state.isPlaying || !state.trackId) {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      return;
    }

    // Calculate rotation speed based on tempo
    // Very slow rotation for visual effect
    // We'll scale this based on tempo (normalize to 120 BPM = 1x speed)
    const tempoFactor = state.tempo / 120.0;
    const baseRPS = 0.2; // Very slow rotation (about 4.8 RPM)
    const targetRPS = baseRPS * tempoFactor;

    const animate = () => {
      const now = Date.now();
      const deltaTime = (now - lastTimeRef.current) / 1000; // seconds
      lastTimeRef.current = now;

      setRotation((prev) => {
        const newRotation = prev + targetRPS * 360 * deltaTime;
        return newRotation % 360;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    lastTimeRef.current = Date.now();
    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [state.isPlaying, state.tempo, state.trackId]);

  if (!state.coverImageUrl) {
    return null;
  }

  return (
    <div className="w-full flex flex-col items-center py-8">
      <div className="relative">
        {/* Vinyl Record Container */}
        <div
          className="relative w-64 h-64 md:w-80 md:h-80 rounded-full bg-gradient-to-br from-gray-900 via-gray-800 to-black shadow-2xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: state.isPlaying ? "none" : "transform 0.3s ease-out",
          }}
        >
          {/* Vinyl grooves (concentric circles) */}
          <div className="absolute inset-0 rounded-full overflow-hidden">
            {/* Outer groove */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[95%] h-[95%] rounded-full border-2 border-gray-700/30"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full border border-gray-700/20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[85%] h-[85%] rounded-full border border-gray-700/20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full border border-gray-700/20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[75%] h-[75%] rounded-full border border-gray-700/20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] rounded-full border border-gray-700/20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[65%] h-[65%] rounded-full border border-gray-700/20"></div>
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] rounded-full border border-gray-700/20"></div>
          </div>

          {/* Album Cover Image */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[90%] h-[90%] rounded-full overflow-hidden bg-gray-800 shadow-inner">
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
                <div className="w-12 h-12 border-4 border-gray-600 border-t-violet-500 rounded-full animate-spin"></div>
              </div>
            )}
          </div>

          {/* Center hole */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 md:w-10 md:h-10 rounded-full bg-black shadow-inner border-2 border-gray-700"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 md:w-6 md:h-6 rounded-full bg-gray-900"></div>

          {/* Reflection highlight */}
          <div className="absolute top-0 left-1/4 w-1/3 h-1/3 rounded-full bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
        </div>

        {/* Play/Pause indicator */}
        <div className="absolute top-4 right-4">
          {state.isPlaying ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/20 border border-green-500/50 rounded-full">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs text-green-400 font-medium">
                Playing
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-500/20 border border-gray-500/50 rounded-full">
              <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
              <span className="text-xs text-gray-400 font-medium">Paused</span>
            </div>
          )}
        </div>

        {/* Tempo indicator */}
        {state.tempo > 0 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 px-3 py-1.5 bg-gray-900/80 backdrop-blur-sm border border-gray-700 rounded-full">
            <span className="text-xs text-gray-300 font-medium">
              {Math.round(state.tempo)} BPM
            </span>
          </div>
        )}
      </div>

      {/* Track Info Below Record */}
      {state.trackName && (
        <div className="mt-8 w-64 md:w-80 mx-auto">
          {/* Track Name */}
          <h3 className="text-2xl font-bold text-white text-center mb-2 truncate">
            {state.trackName}
          </h3>

          {/* Artist Name */}
          {state.artistName && (
            <p className="text-sm text-gray-400 text-center mb-6 uppercase truncate">
              {state.artistName}
            </p>
          )}

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div
                className={`h-full bg-gradient-to-r from-violet-500 to-blue-500 ${
                  state.isPlaying
                    ? "transition-all duration-100"
                    : "transition-all duration-200"
                }`}
                style={{ width: `${state.progress * 100}%` }}
              />
            </div>

            {/* Time Display */}
            <div className="flex justify-between text-xs text-gray-400">
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
        </div>
      )}

      {/* Player Controls */}
      <PlayerControls state={state} onStateChange={onStateChange} />
    </div>
  );
}

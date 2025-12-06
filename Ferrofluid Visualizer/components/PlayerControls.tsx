"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import type { SpotifyPlaybackVisualState } from "@/lib/types";

interface PlayerControlsProps {
  state: SpotifyPlaybackVisualState;
  onStateChange?: () => void;
}

export default function PlayerControls({ state, onStateChange }: PlayerControlsProps) {
  const { data: session } = useSession();
  const [isShuffle, setIsShuffle] = useState(false);
  const [repeatMode, setRepeatMode] = useState<"off" | "context" | "track">("off");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleControl = async (action: string, value?: any) => {
    if (!session?.accessToken) {
      setError("Please log in to Spotify first");
      console.error("[PlayerControls] No access token");
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
        // Update local state
        if (action === "shuffle") {
          setIsShuffle(value);
        } else if (action === "repeat") {
          setRepeatMode(value);
        }

        // Trigger state refresh
        if (onStateChange) {
          setTimeout(() => onStateChange(), 500);
        }
      } else {
        // Handle error response
        const errorMessage = data.error || data.details || `Failed to ${action}`;
        setError(errorMessage);
        console.error("[PlayerControls] API error:", {
          status: response.status,
          error: errorMessage,
          action,
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      setError(errorMessage);
      console.error("[PlayerControls] Error controlling playback:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePlayPause = () => {
    handleControl(state.isPlaying ? "pause" : "play");
  };

  const handleRepeat = () => {
    const nextMode = repeatMode === "off" ? "context" : repeatMode === "context" ? "track" : "off";
    handleControl("repeat", nextMode);
  };

  const hasSession = !!session?.accessToken;

  return (
    <div className="mt-6">
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-center">
          <p className="text-sm text-red-400">{error}</p>
          <p className="text-xs text-red-300 mt-1">
            {(error.includes("Permissions") || error.includes("401")) &&
              "新しい権限が必要です。一度ログアウトしてから再ログインしてください。"}
          </p>
        </div>
      )}

      {!hasSession && (
        <div className="mb-4 p-3 bg-yellow-500/20 border border-yellow-500/50 rounded-lg text-center">
          <p className="text-sm text-yellow-400">
            Spotifyにログインしてください
          </p>
        </div>
      )}

      <div className="flex items-center justify-center gap-6">
      {/* Shuffle Button */}
      <button
        onClick={() => handleControl("shuffle", !isShuffle)}
        className={`p-3 rounded-full transition-colors ${
          isShuffle
            ? "text-violet-400 hover:text-violet-300"
            : "text-gray-400 hover:text-gray-300"
        }`}
        disabled={isLoading || !hasSession}
        aria-label="Shuffle"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z" />
        </svg>
      </button>

      {/* Previous Track Button */}
      <button
        onClick={() => handleControl("previous")}
        className="p-3 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        disabled={isLoading || !hasSession}
        aria-label="Previous track"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
        </svg>
      </button>

      {/* Play/Pause Button */}
      <button
        onClick={handlePlayPause}
        className="p-4 bg-white text-black rounded-full hover:bg-gray-200 transition-colors disabled:opacity-50 flex items-center justify-center"
        disabled={isLoading || !hasSession}
        aria-label={state.isPlaying ? "Pause" : "Play"}
      >
        {state.isPlaying ? (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6"
          >
            <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
          </svg>
        ) : (
          <svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-6 h-6 ml-0.5"
          >
            <path d="M8 5v14l11-7z" />
          </svg>
        )}
      </button>

      {/* Next Track Button */}
      <button
        onClick={() => handleControl("next")}
        className="p-3 text-gray-300 hover:text-white transition-colors disabled:opacity-50"
        disabled={isLoading || !hasSession}
        aria-label="Next track"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
        </svg>
      </button>

      {/* Repeat Button */}
      <button
        onClick={handleRepeat}
        className={`p-3 rounded-full transition-colors relative ${
          repeatMode !== "off"
            ? "text-violet-400 hover:text-violet-300"
            : "text-gray-400 hover:text-gray-300"
        }`}
        disabled={isLoading || !hasSession}
        aria-label="Repeat"
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="currentColor"
          className="w-6 h-6"
        >
          <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
        </svg>
        {repeatMode === "track" && (
          <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-[10px] font-bold">
            1
          </span>
        )}
      </button>
      </div>
    </div>
  );
}


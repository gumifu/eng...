"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import type { SpotifyPlaybackVisualState } from "@/lib/types";

interface SpotifyPlayerConnectorProps {
  onStateUpdate: (state: SpotifyPlaybackVisualState) => void;
}

export default function SpotifyPlayerConnector({
  onStateUpdate,
}: SpotifyPlayerConnectorProps) {
  const { data: session, status } = useSession();
  const [isInitialized, setIsInitialized] = useState(false);
  const [lastTrackId, setLastTrackId] = useState<string>("");
  const [lastPosition, setLastPosition] = useState<number>(0);
  const [lastUpdateTime, setLastUpdateTime] = useState<number>(Date.now());

  // Log session status
  useEffect(() => {
    console.log("[SpotifyPlayerConnector] Session status:", {
      status,
      hasSession: !!session,
      hasAccessToken: !!session?.accessToken,
    });
  }, [session, status]);

  const fetchPlaybackState = useCallback(async () => {
    if (!session?.accessToken) {
      console.log("[SpotifyPlayerConnector] No access token");
      return;
    }

    try {
      const response = await fetch("/api/spotify/playback");

      if (!response.ok) {
        if (response.status === 401) {
          console.log("[SpotifyPlayerConnector] Not authenticated");
        } else {
          console.error("[SpotifyPlayerConnector] API error:", response.status, response.statusText);
        }
        return;
      }

      const data = await response.json();
      console.log("[SpotifyPlayerConnector] Received data:", {
        hasTrack: !!data.track,
        hasFeatures: !!data.features,
        isPlaying: data.isPlaying,
        trackName: data.track?.name,
        trackId: data.track?.id,
        features: data.features,
        error: data.error,
      });

      // オーディオフィーチャーが取得できていない場合、警告を表示
      if (data.track && !data.features) {
        console.warn("[SpotifyPlayerConnector] ⚠️ Audio features not available for track:", {
          trackId: data.track.id,
          trackName: data.track.name,
          error: data.featuresError || "Unknown error",
          reason: "Using default values (tempo: 120, energy: 0.5, valence: 0.5)",
          note: data.featuresError ? "Check server logs for details" : "Track may not have audio features available",
        });
      }

      if (data.track) {
        const currentTime = Date.now();
        const trackChanged = data.track.id !== lastTrackId;

        // If track changed, reset position tracking
        if (trackChanged) {
          console.log("[SpotifyPlayerConnector] Track changed:", {
            from: lastTrackId,
            to: data.track.id,
            trackName: data.track.name,
          });
          setLastTrackId(data.track.id);
          setLastPosition(data.position || 0);
          setLastUpdateTime(currentTime);
        }

        // Calculate progress
        let currentPosition = data.position || 0;
        let progress = 0;

        if (data.duration && data.duration > 0) {
          // If playing, interpolate position between API calls
          if (data.isPlaying && !trackChanged && lastPosition > 0 && data.duration) {
            const timeElapsed = (currentTime - lastUpdateTime) / 1000; // seconds
            const estimatedPosition = lastPosition + (timeElapsed * 1000); // ms
            // Use estimated position if it's reasonable, otherwise use API position
            if (estimatedPosition < data.duration && estimatedPosition > lastPosition) {
              currentPosition = estimatedPosition;
            }
          }

          progress = currentPosition / data.duration;
          progress = Math.min(Math.max(progress, 0), 1); // Clamp between 0 and 1
        }

        // Update tracking
        setLastPosition(currentPosition);
        setLastUpdateTime(currentTime);

        // Use features if available, otherwise use defaults
        const visualState: SpotifyPlaybackVisualState = {
          trackId: data.track.id,
          progress,
          tempo: data.features?.tempo || 120,
          energy: data.features?.energy || 0.5,
          valence: data.features?.valence || 0.5,
          isPlaying: data.isPlaying || false,
          trackName: data.track.name,
          artistName: data.track.artists?.[0]?.name,
          coverImageUrl: data.coverImageUrl || null,
          duration: data.duration,
          position: currentPosition,
        };

        console.log("[SpotifyPlayerConnector] Updating visual state:", {
          trackId: visualState.trackId,
          trackName: visualState.trackName,
          tempo: visualState.tempo,
          energy: visualState.energy,
          valence: visualState.valence,
          progress: progress.toFixed(3),
          isPlaying: visualState.isPlaying,
          hasFeatures: !!data.features,
          featuresFromAPI: data.features,
          trackChanged,
        });

        onStateUpdate(visualState);
      } else if (data.track === null || !data.track) {
        // No track playing, reset to default state
        console.log("[SpotifyPlayerConnector] No track playing, resetting to default");
        onStateUpdate({
          trackId: "",
          progress: 0,
          tempo: 120,
          energy: 0.5,
          valence: 0.5,
          isPlaying: false,
        });
      } else {
        console.warn("[SpotifyPlayerConnector] Unexpected data format:", data);
      }
    } catch (error) {
      console.error("[SpotifyPlayerConnector] Error fetching playback state:", error);
    }
  }, [session?.accessToken, onStateUpdate]);

  useEffect(() => {
    if (!session?.accessToken) {
      setIsInitialized(false);
      return;
    }

    // Always start polling when we have an access token
    // This ensures we get updates even if the component re-renders
    console.log("[SpotifyPlayerConnector] Starting/restarting playback state polling");

    // Initial fetch immediately
    fetchPlaybackState();

    // Poll every 1 second (1000ms) for smoother progress bar updates
    const interval = setInterval(() => {
      fetchPlaybackState();
    }, 1000);

    setIsInitialized(true);

    return () => {
      console.log("[SpotifyPlayerConnector] Cleaning up interval");
      clearInterval(interval);
    };
  }, [session?.accessToken, fetchPlaybackState]);

  return null;
}


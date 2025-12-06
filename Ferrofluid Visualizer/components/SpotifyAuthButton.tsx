"use client";

import { signIn, signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

export default function SpotifyAuthButton() {
  const { data: session, status } = useSession();
  const [connectionStatus, setConnectionStatus] = useState<"checking" | "connected" | "error">("checking");

  useEffect(() => {
    if (!session?.accessToken) {
      setConnectionStatus("error");
      return;
    }

    // Test Spotify API connection
    const testConnection = async () => {
      try {
        const response = await fetch("/api/spotify/playback");
        if (response.ok || response.status === 200) {
          setConnectionStatus("connected");
        } else if (response.status === 401) {
          setConnectionStatus("error");
        } else {
          setConnectionStatus("connected"); // API is reachable even if no track is playing
        }
      } catch (error) {
        setConnectionStatus("error");
      }
    };

    testConnection();
    const interval = setInterval(testConnection, 5000); // Check every 5 seconds
    return () => clearInterval(interval);
  }, [session?.accessToken]);

  if (status === "loading") {
    return (
      <div className="px-6 py-3 bg-gray-800 rounded-lg animate-pulse">
        Loading...
      </div>
    );
  }

  if (session) {
    return (
      <div className="flex items-center gap-4 flex-wrap">
        <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border ${
          connectionStatus === "connected"
            ? "bg-green-500/20 border-green-500/50"
            : connectionStatus === "checking"
            ? "bg-yellow-500/20 border-yellow-500/50"
            : "bg-red-500/20 border-red-500/50"
        }`}>
          <div className={`w-2 h-2 rounded-full ${
            connectionStatus === "connected"
              ? "bg-green-500 animate-pulse"
              : connectionStatus === "checking"
              ? "bg-yellow-500 animate-pulse"
              : "bg-red-500"
          }`}></div>
          <span className={`text-sm font-medium ${
            connectionStatus === "connected"
              ? "text-green-400"
              : connectionStatus === "checking"
              ? "text-yellow-400"
              : "text-red-400"
          }`}>
            {connectionStatus === "connected"
              ? "✓ Connected to Spotify"
              : connectionStatus === "checking"
              ? "Checking..."
              : "✗ Connection Error"}
          </span>
        </div>
        <div className="text-sm text-gray-400">
          {session.user?.name || session.user?.email}
        </div>
        <button
          onClick={() => signOut()}
          className="px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
        >
          Logout
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={() => signIn("spotify")}
      className="px-6 py-3 bg-[#1DB954] hover:bg-[#1ed760] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
    >
      <svg
        className="w-5 h-5"
        fill="currentColor"
        viewBox="0 0 24 24"
      >
        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
      </svg>
      Connect with Spotify
    </button>
  );
}


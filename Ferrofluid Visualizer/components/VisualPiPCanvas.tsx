"use client";

import { useEffect, useRef, useState } from "react";
import FerrofluidVisualizer from "./FerrofluidVisualizer";
import type { SpotifyPlaybackVisualState } from "@/lib/types";

interface VisualPiPCanvasProps {
  state: SpotifyPlaybackVisualState;
}

export default function VisualPiPCanvas({ state }: VisualPiPCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isPiPActive, setIsPiPActive] = useState(false);
  const [isPiPSupported, setIsPiPSupported] = useState(false);

  useEffect(() => {
    // Check PiP support
    if (document.pictureInPictureEnabled) {
      setIsPiPSupported(true);
    }
  }, []);

  const startPiP = async () => {
    if (!canvasRef.current || !videoRef.current || !isPiPSupported) return;

    try {
      // Create stream from canvas
      const stream = canvasRef.current.captureStream(30);
      streamRef.current = stream;

      // Set stream to video element
      videoRef.current.srcObject = stream;
      await videoRef.current.play();

      // Request Picture-in-Picture
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
      }

      await videoRef.current.requestPictureInPicture();
      setIsPiPActive(true);
    } catch (error) {
      console.error("Error starting PiP:", error);
    }
  };

  const stopPiP = async () => {
    if (document.pictureInPictureElement) {
      await document.exitPictureInPicture();
      setIsPiPActive(false);
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  useEffect(() => {
    const handlePiPChange = () => {
      if (!document.pictureInPictureElement) {
        setIsPiPActive(false);
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((track) => track.stop());
          streamRef.current = null;
        }
      }
    };

    document.addEventListener("leavepictureinpicture", handlePiPChange);

    return () => {
      document.removeEventListener("leavepictureinpicture", handlePiPChange);
    };
  }, []);

  return (
    <div className="relative w-full" style={{ minHeight: "400px", height: "600px" }}>
      <canvas
        ref={canvasRef}
        className="w-full h-full bg-black rounded-lg"
        style={{ display: "block", width: "100%", height: "100%" }}
        width={800}
        height={600}
      />
      <FerrofluidVisualizer state={state} canvasRef={canvasRef} />

      {/* Hidden video element for PiP */}
      <video
        ref={videoRef}
        className="hidden"
        muted
        playsInline
        autoPlay
      />

      {/* PiP Control Button */}
      <div className="absolute bottom-4 right-4">
        {isPiPSupported ? (
          <button
            onClick={isPiPActive ? stopPiP : startPiP}
            className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {isPiPActive ? "Stop Mini View" : "Start Mini View"}
          </button>
        ) : (
          <div className="px-4 py-2 bg-gray-700 text-gray-400 rounded-lg text-sm">
            PiP not supported
          </div>
        )}
      </div>
    </div>
  );
}


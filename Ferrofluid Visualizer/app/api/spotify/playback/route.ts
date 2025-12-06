import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { getPlaybackState, getAudioFeatures } from "@/lib/spotify";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      console.log("[API] No session or access token");
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // アクセストークンの情報をログに記録（デバッグ用）
    console.log("[API] Session info:", {
      hasAccessToken: !!session.accessToken,
      tokenLength: (session.accessToken as string)?.length || 0,
      tokenPrefix: (session.accessToken as string)?.substring(0, 20) + '...' || 'N/A',
    });

    console.log("[API] Fetching playback state...");
    const playbackState = await getPlaybackState(session.accessToken as string);

    if (!playbackState || !playbackState.item) {
      console.log("[API] No playback state or no track:", {
        hasPlaybackState: !!playbackState,
        hasItem: !!playbackState?.item,
      });
      return NextResponse.json({
        isPlaying: false,
        track: null,
        features: null,
      });
    }

    const track = playbackState.item;
    console.log("[API] Track found:", track.name, "by", track.artists?.[0]?.name);

    // Get album cover image
    const coverImageUrl = track.album?.images?.[0]?.url || track.album?.images?.[1]?.url || null;

    const { features, error: featuresError } = await getAudioFeatures(
      track.id,
      session.accessToken as string
    );

    if (!features) {
      console.warn("[API] No audio features found for track:", {
        trackId: track.id,
        trackName: track.name,
        error: featuresError,
        note: "Using default values (tempo: 120, energy: 0.5, valence: 0.5)",
      });
    } else {
      console.log("[API] Audio features successfully retrieved:", {
        trackId: track.id,
        tempo: features.tempo,
        energy: features.energy,
        valence: features.valence,
      });
    }

    const response = {
      isPlaying: playbackState.is_playing,
      track: {
        id: track.id,
        name: track.name,
        artists: track.artists.map((a: any) => ({ name: a.name })),
        album: {
          name: track.album?.name,
          images: track.album?.images || [],
        },
      },
      position: playbackState.progress_ms,
      duration: track.duration_ms,
      coverImageUrl: coverImageUrl,
      features: features
        ? {
            tempo: features.tempo,
            energy: features.energy,
            valence: features.valence,
          }
        : null,
      featuresError: featuresError || null,
    };

    console.log("[API] Returning response:", {
      trackName: response.track.name,
      trackId: response.track.id,
      hasFeatures: !!response.features,
      features: response.features ? {
        tempo: response.features.tempo,
        energy: response.features.energy,
        valence: response.features.valence,
      } : null,
      isPlaying: response.isPlaying,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[API] Error in playback API:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}


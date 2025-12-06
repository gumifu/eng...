import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import SpotifyWebApi from "spotify-web-api-node";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.accessToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action } = body;

    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    spotifyApi.setAccessToken(session.accessToken as string);

    let result;
    switch (action) {
      case "play":
        result = await spotifyApi.play();
        break;
      case "pause":
        result = await spotifyApi.pause();
        break;
      case "next":
        result = await spotifyApi.skipToNext();
        break;
      case "previous":
        result = await spotifyApi.skipToPrevious();
        break;
      case "shuffle":
        result = await spotifyApi.setShuffle(body.value || false);
        break;
      case "repeat":
        result = await spotifyApi.setRepeat(body.value || "off");
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    // Check if the result has an error
    if (result && result.body && (result.body as any).error) {
      const error = (result.body as any).error;
      console.error("[API] Spotify API error:", error);
      return NextResponse.json(
        { error: error.message || "Spotify API error", details: error },
        { status: error.status || 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("[API] Error in control API:", error);

    // Extract error details from Spotify API
    if (error.body && error.body.error) {
      const spotifyError = error.body.error;
      return NextResponse.json(
        {
          error: spotifyError.message || "Spotify API error",
          details: spotifyError
        },
        { status: spotifyError.status || error.statusCode || 500 }
      );
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}


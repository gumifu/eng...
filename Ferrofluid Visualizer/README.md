# Ferrofluid Visualizer

Interactive ferrofluid visualization synchronized with Spotify. A minimal, ambient visualizer that reacts to your music's tempo, energy, and mood.

## Features

- 🎵 **Spotify Integration** - Connects to your Spotify account and reacts to currently playing tracks
- 🎨 **Ferrofluid Visualization** - Beautiful, organic ferrofluid-like animations using Three.js
- 📺 **Picture-in-Picture** - Float the visualizer in a small window on your screen
- 🎧 **Headphone Compatible** - Works with headphones (uses Spotify API, not microphone)
- 🌙 **Dark Theme** - Minimal, ambient design that doesn't distract

## Prerequisites

- Node.js 18+ and npm
- A Spotify Developer Account
- Spotify Premium account (required for Web Playback SDK)

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Spotify Developer Setup

1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Add `http://localhost:3000/api/auth/callback/spotify` to Redirect URIs
4. Copy your **Client ID** and **Client Secret**

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-a-random-string

SPOTIFY_CLIENT_ID=your-spotify-client-id
SPOTIFY_CLIENT_SECRET=your-spotify-client-secret
```

Generate `NEXTAUTH_SECRET` using:
```bash
openssl rand -base64 32
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click "Connect with Spotify" to authenticate
2. Start playing music on any Spotify device (desktop, mobile, etc.)
3. The visualizer will automatically react to your currently playing track
4. Click "Start Mini View" to open the visualizer in Picture-in-Picture mode

## How It Works

The visualizer uses Spotify's Web API to get:
- **Tempo (BPM)** - Controls the speed of animations
- **Energy** - Affects the intensity and amplitude of movements
- **Valence** - Influences the color palette (warm/cool tones)
- **Playback Position** - Syncs visual changes with track progress

Unlike traditional audio visualizers, this doesn't analyze audio waveforms. Instead, it uses Spotify's audio analysis data, making it compatible with headphones and any playback device.

## Tech Stack

- **Next.js 14** - React framework with App Router
- **NextAuth.js** - Authentication with Spotify OAuth
- **Three.js** - 3D graphics and shaders
- **Tailwind CSS** - Styling
- **TypeScript** - Type safety
- **Spotify Web API** - Music data and audio features

## Project Structure

```
app/
  api/
    auth/[...nextauth]/  # NextAuth configuration
    spotify/playback/    # Playback state API endpoint
  page.tsx              # Main page
components/
  SpotifyAuthButton.tsx      # Authentication UI
  SpotifyPlayerConnector.tsx # Fetches playback state
  FerrofluidVisualizer.tsx   # Three.js visualization
  VisualPiPCanvas.tsx        # Canvas + PiP controls
  TrackDisplay.tsx           # Track info display
lib/
  spotify.ts  # Spotify API helpers
  types.ts    # TypeScript types
```

## Browser Support

- Picture-in-Picture requires Chrome, Edge, or Safari 13+
- Other browsers will show the visualizer in the main window

## License

MIT

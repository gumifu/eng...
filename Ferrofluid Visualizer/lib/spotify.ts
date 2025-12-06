import SpotifyWebApi from 'spotify-web-api-node';

export const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

export async function getAudioFeatures(trackId: string, accessToken: string, retries: number = 2): Promise<{ features: any; error: string | null }> {
  // アクセストークンの有効性を確認
  if (!accessToken) {
    console.error('[lib/spotify] No access token provided');
    return { features: null, error: 'No access token provided' };
  }

  console.log('[lib/spotify] Access token info:', {
    hasToken: !!accessToken,
    tokenLength: accessToken.length,
    tokenPrefix: accessToken.substring(0, 20) + '...',
  });

  spotifyApi.setAccessToken(accessToken);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      if (attempt > 0) {
        console.log(`[lib/spotify] Retrying audio features fetch (attempt ${attempt + 1}/${retries + 1}) for track:`, trackId);
        // リトライ前に少し待機
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      } else {
        console.log('[lib/spotify] Fetching audio features for track:', trackId);
      }

      const features = await spotifyApi.getAudioFeaturesForTrack(trackId);

      if (!features.body) {
        console.warn('[lib/spotify] Audio features response body is empty');
        return { features: null, error: 'Response body is empty' };
      }

      console.log('[lib/spotify] Audio features received:', {
        trackId,
        tempo: features.body.tempo,
        energy: features.body.energy,
        valence: features.body.valence,
        hasTempo: !!features.body?.tempo,
        hasEnergy: !!features.body?.energy,
        hasValence: !!features.body?.valence,
      });

      return { features: features.body, error: null };
    } catch (error: any) {
      const statusCode = error?.statusCode || error?.body?.error?.status || error?.status;

      // 403と401エラーはリトライしない（権限の問題なのでリトライしても解決しない）
      if (statusCode === 403 || statusCode === 401) {
        // リトライせずにすぐエラーを返す
        console.error(`[lib/spotify] Non-retryable error (${statusCode}) on attempt ${attempt + 1}:`, error?.message || error);
      } else if (attempt < retries) {
        // 最後の試行でない場合、一時的なエラーの可能性があるのでリトライ
        const isRetryableError =
          !statusCode || // ステータスコードがない場合（ネットワークエラーなど）
          statusCode === 429 || // Rate limit
          statusCode >= 500 || // Server errors
          error?.message?.includes('timeout') ||
          error?.message?.includes('ECONNRESET') ||
          error?.message?.includes('ETIMEDOUT');

        if (isRetryableError) {
          console.warn(`[lib/spotify] Retryable error on attempt ${attempt + 1}, will retry:`, error?.message || error);
          continue; // リトライ
        }
      }

      // リトライしない、または最後の試行の場合
      // 詳細なエラーログ - エラーオブジェクト全体を出力
      console.error('[lib/spotify] Error fetching audio features - Full error:', JSON.stringify(error, null, 2));

      // エラー情報を抽出（statusCodeは既に上で定義済み）
      const errorMessage = error?.body?.error?.message || error?.message || error?.toString() || 'Unknown error';
      const errorType = error?.body?.error?.type || error?.type || 'Unknown';

      console.error('[lib/spotify] Error details:', {
        trackId,
        errorMessage: errorMessage.substring(0, 200), // 長すぎる場合は切り詰め
        statusCode,
        errorType,
        status: error?.body?.error?.status,
        message: error?.body?.error?.message,
        hasBody: !!error?.body,
        bodyKeys: error?.body ? Object.keys(error.body) : [],
        errorKeys: Object.keys(error || {}),
      });

      // エラータイプ別の処理
      if (statusCode === 403) {
        console.error('[lib/spotify] 403 Forbidden - Possible causes:', {
          trackId,
          reason: 'Since Nov 27, 2024, Spotify restricts Audio Features API access for new apps',
          solutions: [
            '1. Check Spotify Developer Dashboard: Ensure your app is registered with "Web API" product',
            '2. Verify app is not in development mode (switch to production if needed)',
            '3. Re-authenticate to get a fresh access token',
            '4. Some tracks may not support Audio Features API',
          ],
          note: 'This is a known issue with Spotify API restrictions for new applications',
        });
      } else if (statusCode === 401) {
        console.error('[lib/spotify] 401 Unauthorized - Access token is invalid or expired:', {
          suggestion: 'Token needs to be refreshed or user needs to re-authenticate',
        });
      } else if (statusCode === 429) {
        console.warn('[lib/spotify] 429 Too Many Requests - Rate limit exceeded:', {
          suggestion: 'Wait before making more requests',
        });
      }

      // エラーメッセージを構築
      let finalErrorMessage = errorMessage;
      if (statusCode) {
        finalErrorMessage = `${statusCode}: ${errorMessage}`;
      }
      if (errorType && errorType !== 'Unknown') {
        finalErrorMessage += ` (${errorType})`;
      }

      // 最後の試行の場合のみエラーを返す
      if (attempt === retries) {
        return {
          features: null,
          error: finalErrorMessage
        };
      }
    }
  }

  // このコードには到達しないはずですが、型安全性のため
  return { features: null, error: 'Unexpected error' };
}

export async function getCurrentlyPlaying(accessToken: string) {
  spotifyApi.setAccessToken(accessToken);
  try {
    const playback = await spotifyApi.getMyCurrentPlayingTrack();
    return playback.body;
  } catch (error) {
    console.error('Error fetching currently playing:', error);
    return null;
  }
}

export async function getPlaybackState(accessToken: string) {
  spotifyApi.setAccessToken(accessToken);
  try {
    const state = await spotifyApi.getMyCurrentPlaybackState();
    return state.body;
  } catch (error) {
    console.error('Error fetching playback state:', error);
    return null;
  }
}


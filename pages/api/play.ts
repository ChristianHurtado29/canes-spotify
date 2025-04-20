import axios, { AxiosError } from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { spotifyUri, startTime, accessToken } = req.body;

  if (!accessToken) {
    return res.status(401).json({ error: 'Missing access token' });
  }

  if (!spotifyUri || typeof startTime === 'undefined') {
    console.error('Missing spotifyUri or startTime in request body');
    return res.status(400).json({ error: 'Missing spotifyUri or startTime' });
  }

  try {
    const response = await axios.put(
      'https://api.spotify.com/v1/me/player/play',
      {
        uris: [spotifyUri],
        position_ms: startTime,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.status(response.status).json(response.data);
  } catch (error: unknown) {
    const axiosError = error as AxiosError;
    console.error(axiosError.response?.data || axiosError.message);
  }
}

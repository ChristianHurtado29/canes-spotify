import type { NextApiRequest, NextApiResponse } from 'next';
import axios, { AxiosError } from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid access token' });
  }

  const accessToken = authHeader.replace('Bearer ', '');

  try {
    await axios.put(
      'https://api.spotify.com/v1/me/player/pause',
      null,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return res.status(204).end();
  } catch (error: unknown) {
    const axiosError = error as AxiosError;

    console.error('Spotify pause error:', axiosError.response?.data || axiosError.message);

    return res
      .status(axiosError.response?.status || 500)
      .json({ error: 'Failed to pause playback' });
  }
}

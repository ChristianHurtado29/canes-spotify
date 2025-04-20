import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

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

    res.status(204).end();
  } catch (error: unknown) {
    if (axios.isAxiosError(error)) {
        console.error(error.response?.data || error.message);
      } else {
        console.error('Unknown error during pause:', error);
      }
  }
}

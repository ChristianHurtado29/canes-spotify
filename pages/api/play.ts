import axios from 'axios';
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
  } catch (error: any) {
    console.error('Error playing song:', error.response ? error.response.data : error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    } else {
      return res.status(500).json({ error: 'Error playing song' });
    }
  }
}

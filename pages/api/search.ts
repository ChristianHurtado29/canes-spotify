import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

async function getAccessToken() {
  return process.env.SPOTIFY_ACCESS_TOKEN || 'your-access-token';
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Query parameter is required' });
  }

  const accessToken = await getAccessToken();

  try {
    const response = await axios.get('https://api.spotify.com/v1/search', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      },
      params: {
        q: query,
        type: 'track',
        limit: 10
      }
    });

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error searching Spotify:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error searching Spotify' });
  }
}

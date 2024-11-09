import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const SPOTIFY_ACCESS_TOKEN = "BQAItW8n88MnsWtwYVhwvslOeOxtiFdavFDCOFULY9q_oNNEzbnV2nIq-63u9DIlBRJFpLZdeBT6J9-Pa2ZGtfu3J7E1ERMFPhOdtYMv1FOzZ8SCbJVi3vDr2Mi7LcCDuW2kEOW6bUaHE6FSFPkZCXlaxRTzZu7x0ao9Gv4hvLrZwwjojcnRzkGjy8_Mu8J8syRzLg"

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { spotifyUri, startTime } = req.body;
  
  // Replace this with how you're managing tokens
  const accessToken = process.env.SPOTIFY_ACCESS_TOKEN || SPOTIFY_ACCESS_TOKEN;

  if (!spotifyUri || typeof startTime === 'undefined') {
    console.error('Missing spotifyUri or startTime in request body');
    return res.status(400).json({ error: 'Missing spotifyUri or startTime' });
  }

  try {
    const response = await axios.put(
      'https://api.spotify.com/v1/me/player/play',
      {
        uris: [spotifyUri],
        position_ms: startTime
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      }
    );

    res.status(response.status).json(response.data);
  } catch (error) {
    // Log detailed error information
    console.error('Error playing song:', error.response ? error.response.data : error.message);

    if (error.response) {
      // Spotify returned an error response
      return res.status(error.response.status).json(error.response.data);
    } else {
      // Network or other Axios error
      return res.status(500).json({ error: 'Error playing song' });
    }
  }
}

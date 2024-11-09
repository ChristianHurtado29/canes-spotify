import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

const SPOTIFY_ACCESS_TOKEN = "BQBFYiPQXFsRJvYUuzJ0WqZk8TqxwD4U4Ci6hA-eAN-2EnULrjTBLv1jwSeSezYAstMQSSoZZ5ayGCi7QRBaGQnidu50QEELaHDPVWk5kBv3_q7pMYP_QcKCGtY9Ka7sRPk8UVD3jtHfinDDU6Q9SsL6q7LCqvMIqMRf1ov1shMs_ehil3wMGpIKlnVzU6sLlQFR5w"

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

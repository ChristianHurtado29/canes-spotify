import axios from 'axios';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN; // Store your refresh token securely

  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

  const authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    method: 'post',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    data: new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    }).toString()
  };

  try {
    const response = await axios(authOptions);
    const { access_token, refresh_token } = response.data;
    console.log('Access Token:', access_token);
    console.log('Refresh Token:', refresh_token);
    console.log('Client ID:', process.env.SPOTIFY_CLIENT_ID);
    console.log('Client Secret:', process.env.SPOTIFY_CLIENT_SECRET);
    console.log('Refresh Token2:', process.env.SPOTIFY_REFRESH_TOKEN);

    res.status(200).json({ access_token, refresh_token });
  } catch (error) {
    console.error('Error exchanging code for token:', error.response ? error.response.data : error.message);
    res.status(500).json({ error: 'Error exchanging code for token' });
  }
}

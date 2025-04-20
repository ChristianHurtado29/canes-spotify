import { useState, useEffect } from 'react';
import { db } from '../src/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { TokenProvider, useToken } from '../src/context/TokenContext';
import { spotifyApiRequest, initTokenSync } from './api/spotifyApiClient';
import axios from 'axios';

type Track = {
  id: string;
  name: string;
  uri: string;
  artists: { name: string }[];
};

type SpotifyTrackSearchResponse = {
  tracks: {
    items: Track[];
  };
};

function InitTokenSync() {
  const { accessToken, setAccessToken } = useToken();

  useEffect(() => {
    initTokenSync({
      get: () => accessToken,
      set: setAccessToken,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}

function AddPlayerContent() {
  const [playerName, setPlayerName] = useState('');
  const [startTimeInput, setStartTimeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [selectedUri, setSelectedUri] = useState('');
  const [selectedSong, setSelectedSong] = useState('');

  const { accessToken } = useToken(); // already declared at top of AddPlayerContent

  console.log('📦 AddPlayer page loaded');


  const handleSearch = async () => {
    const token = accessToken?.trim();
  
    if (!searchQuery || !token) {
      alert('Search query or token missing');
      return;
    }
  
    try {
      const data = await spotifyApiRequest<SpotifyTrackSearchResponse>({
        method: 'get',
        url: 'https://api.spotify.com/v1/search',
        params: { q: searchQuery, type: 'track', limit: 10 },
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
  
      setSearchResults(data.tracks.items);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        console.error('🎤 Spotify search error:', error.response?.data || error.message);
        alert(JSON.stringify(error.response?.data, null, 2));
      } else {
        console.error('❓ Unknown error during search:', error);
      }
    }
  };
  

  const addPlayer = async () => {
    if (!playerName || !selectedUri) {
      alert('Please enter a name and select a song');
      return;
    }

    const [minutesStr, secondsStr] = startTimeInput.split(':');
    const minutes = parseInt(minutesStr, 10);
    const seconds = parseInt(secondsStr, 10);

    if (
      isNaN(minutes) ||
      isNaN(seconds) ||
      minutes < 0 ||
      seconds < 0 ||
      seconds > 59
    ) {
      alert('Please enter a valid start time in mm:ss format');
      return;
    }

    const startTime = minutes * 60 * 1000 + seconds * 1000;

    const newPlayer = {
      name: playerName,
      spotifyUri: selectedUri,
      startTime,
    };

    await addDoc(collection(db, 'players'), newPlayer);

    setPlayerName('');
    setSelectedUri('');
    setSelectedSong('');
    setStartTimeInput('');

    alert('Player added successfully!');
  };

  const selectSong = (uri: string, songName: string) => {
    setSelectedUri(uri);
    setSelectedSong(songName);
  };

  return (
    <div>
      <h1>Add Player Profile</h1>

      <label>
        Name:
        <input
          type="text"
          value={playerName}
          onChange={(e) => setPlayerName(e.target.value)}
        />
      </label>
      <br />

      <label>
        Start Time (mm:ss):
        <input
          type="text"
          value={startTimeInput}
          onChange={(e) => setStartTimeInput(e.target.value)}
          placeholder="e.g. 1:30"
        />
      </label>
      <br />

      <div>
  <label htmlFor="song-search">Song Search:</label>
  <input
    id="song-search"
    type="text"
    value={searchQuery}
    onChange={(e) => setSearchQuery(e.target.value)}
  />
  <button type="button" onClick={handleSearch}>Search</button>

</div>


      <ul>
        {searchResults.map((track: Track) => (
          <li key={track.id}>
            <button onClick={() => selectSong(track.uri, track.name)}>
              {track.name} by {track.artists[0].name}
            </button>
          </li>
        ))}
      </ul>

      {selectedSong && (
        <p>
          Selected Song: <strong>{selectedSong}</strong>
        </p>
      )}

      <button onClick={addPlayer}>Add Player</button>

      {selectedUri && (
        <p>
          Selected Song URI: <strong>{selectedUri}</strong>
        </p>
      )}
    </div>
  );
}

export default function AddPlayer() {
  return (
    <TokenProvider>
      <InitTokenSync />
      <AddPlayerContent />
    </TokenProvider>
  );
}

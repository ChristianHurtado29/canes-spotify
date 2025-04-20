import { useState, useEffect } from 'react';
import { db } from '../src/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { TokenProvider, useToken } from '../src/context/TokenContext';
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

function AddPlayerContent() {
  const { accessToken, isLoading } = useToken();

  const [playerName, setPlayerName] = useState('');
  const [startTimeInput, setStartTimeInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Track[]>([]);
  const [selectedUri, setSelectedUri] = useState('');
  const [selectedSong, setSelectedSong] = useState('');

  const handleSearch = async () => {
    const token = accessToken?.trim();
    const query = searchQuery.trim();

    if (isLoading) {
      alert('Loading Spotify token... Try again in a second.');
      return;
    }

    if (!token || token.length < 10) {
      alert('Invalid Spotify token.');
      console.warn('Token:', token);
      return;
    }

    if (!query) {
      alert('Enter a search term.');
      return;
    }

    const encodedQuery = encodeURIComponent(query);

    try {
      const response = await axios.get<SpotifyTrackSearchResponse>(
        'https://api.spotify.com/v1/search',
        {
          params: { q: encodedQuery, type: 'track', limit: 10 },
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSearchResults(response.data.tracks.items);
    } catch (error: any) {
      console.error('Spotify search error:', error.response?.data || error.message);
      alert(JSON.stringify(error.response?.data || error.message, null, 2));
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
      alert('Start time must be in mm:ss format');
      return;
    }

    const startTime = minutes * 60 * 1000 + seconds * 1000;

    await addDoc(collection(db, 'players'), {
      name: playerName,
      spotifyUri: selectedUri,
      startTime,
    });

    setPlayerName('');
    setSelectedUri('');
    setSelectedSong('');
    setStartTimeInput('');

    alert('Player added!');
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

      <label>
        Song Search:
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button onClick={handleSearch} disabled={isLoading || !accessToken}>
          {isLoading ? 'Loading...' : 'Search'}
        </button>
      </label>

      <ul>
        {searchResults.map((track) => (
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
      <AddPlayerContent />
    </TokenProvider>
  );
}
import { useState, useEffect } from 'react';
import { db } from '../src/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { TokenProvider, useToken } from '../src/context/TokenContext';
import { spotifyApiRequest, initTokenSync } from './api/spotifyApiClient';

function InitTokenSync() {
  const { accessToken, setAccessToken } = useToken();

  useEffect(() => {
    initTokenSync({
      get: () => accessToken,
      set: setAccessToken,
    });
  }, [accessToken, setAccessToken]);

  return null;
}

function AddPlayerContent() {
  const [playerName, setPlayerName] = useState('');
  const [startTime, setStartTime] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUri, setSelectedUri] = useState('');
  const [selectedSong, setSelectedSong] = useState('');

  const { accessToken } = useToken(); // safe now

  const handleSearch = async () => {
    if (!searchQuery) return;
  
    try {
      // Directly query Spotify from the browser
      const data = await spotifyApiRequest({
        method: 'get',
        url: 'https://api.spotify.com/v1/search',
        params: { q: searchQuery, type: 'track', limit: 10 },
      });
  
      setSearchResults(data.tracks.items);
    } catch (error: any) {
      console.error('Error searching Spotify:', error.response?.data || error.message);
    }
  };
  
  

  const addPlayer = async () => {
    if (!playerName || !selectedUri) {
      alert('Please enter a name and select a song');
      return;
    }

    const newPlayer = {
      name: playerName,
      spotifyUri: selectedUri,
      startTime,
    };

    await addDoc(collection(db, 'players'), newPlayer);

    setPlayerName('');
    setSelectedUri('');
    setSelectedSong('');
    setStartTime(0);

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
        Start Time (ms):
        <input
          type="number"
          value={startTime}
          onChange={(e) => setStartTime(Number(e.target.value))}
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
        <button onClick={handleSearch}>Search</button>
      </label>

      <ul>
        {searchResults.map((track: any) => (
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

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../src/firebaseConfig';
import axios from 'axios';
import Link from 'next/link';
import SpotifyPlayer from './SpotifyPlayer';
import { useToken } from '../src/context/TokenContext';

export default function Lineup() {
  const { accessToken, isLoading } = useToken();
  console.log('useToken result:', useToken());
  const [currentSong, setCurrentSong] = useState('');
  const [players, setPlayers] = useState([]);
  const [newPlayer, setNewPlayer] = useState({
    name: '',
    spotifyUri: '',
    startTime: 0,
  });

  console.log('useToken in SpotifyPlayer:', useToken());
  useEffect(() => {
    const fetchPlayers = async () => {
      const querySnapshot = await getDocs(collection(db, "players"));
      const playerData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlayers(playerData);
    };

    fetchPlayers();
  }, []);

  const updatePlayer = async (id: string, field: string, value: string | number) => {
    const playerDoc = doc(db, "players", id);
    await updateDoc(playerDoc, { [field]: value });

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => (player.id === id ? { ...player, [field]: value } : player))
    );
  };

  // const addPlayer = async () => {
  //   const docRef = await addDoc(collection(db, "players"), newPlayer);
  //   setPlayers([...players, { id: docRef.id, ...newPlayer }]);
  //   setNewPlayer({ name: '', spotifyUri: '', startTime: 0 }); // Reset form fields
  // };

  const playSong = async (spotifyUri: string, startTime: number) => {
    setCurrentSong(spotifyUri);
    try {
      await axios.put('/api/play', {
        spotifyUri,
        startTime,
        accessToken, // <- include this
      });
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  return (
    <div>
       <Link href="/addPlayer">
          Add a New Player Profile
      </Link>
      <h1>Team Lineup</h1>
      
      {/* Form to Add New Player */}
      {/* <h2>Add New Player</h2>
      <div>
        <label>
          Name:
          <input
            type="text"
            value={newPlayer.name}
            onChange={(e) => setNewPlayer({ ...newPlayer, name: e.target.value })}
          />
        </label>
        <label>
          Spotify URI:
          <input
            type="text"
            value={newPlayer.spotifyUri}
            onChange={(e) => setNewPlayer({ ...newPlayer, spotifyUri: e.target.value })}
          />
        </label>
        <label>
          Start Time (ms):
          <input
            type="number"
            value={newPlayer.startTime}
            onChange={(e) => setNewPlayer({ ...newPlayer, startTime: Number(e.target.value) })}
          />
        </label>
        <button onClick={addPlayer}>Add Player</button>
      </div> */}

      {/* Existing Players */}
      {players.map((player) => (
        <div key={player.id} style={{ marginTop: '20px' }}>
          <h3>{player.name}</h3>
          <button onClick={() => playSong(player.spotifyUri, player.startTime)}>
            Play {player.name}'s Song
          </button>
        </div>
      ))}
      <div>
        <SpotifyPlayer/>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc } from 'firebase/firestore';
import { db } from '../src/firebaseConfig';
import axios from 'axios';

export default function Lineup() {
  const [currentSong, setCurrentSong] = useState('');
  const [players, setPlayers] = useState([]);
  //   { name: "Ellis", spotifyUri: "spotify:track:4svkPL62HbvyFgf0nHFXAF", startTime: 24000 },
  //   { name: "Christian", spotifyUri: "spotify:track:1Bqg4yFeVDJxchh6MjkGKy", startTime: 15500 },
  //   { name: "Haris", spotifyUri: "spotify:track:6f3Slt0GbA2bPZlz0aIFXN", startTime: 38000 },
  //   { name: "JRey", spotifyUri: "spotify:track:1IloGy93XVauxyAaXeVnym", startTime: 0 }
  // ]);

  useEffect(() => {
    const fetchPlayers = async () => {
      const querySnapshot = await getDocs(collection(db, "players"));
      const playerData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPlayers(playerData);
    };

    fetchPlayers();
  }, []);

  const updatePlayer = async (id: string | number, field: string, value: string | number) => {
    const playerDoc = doc(db, "players", id);
    await updateDoc(playerDoc, { [field]: value });

    setPlayers((prevPlayers) =>
      prevPlayers.map((player) => (player.id === id ? { ...player, [field]: value } : player))
    );
  };

  const addPlayer = async () => {
    const newPlayer = { name: "", spotifyUri: "", startTime: 0 };
    const docRef = await addDoc(collection(db, "players"), newPlayer);
    setPlayers([...players, { id: docRef.id, ...newPlayer }]);
  };

  const playSong = async (spotifyUri: string, startTime: number) => {
    setCurrentSong(spotifyUri);
    try {
      await axios.put('/api/play', { spotifyUri, startTime });
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  return (
    <div>
      <h1>Team Lineup</h1>
      <button onClick={addPlayer}>Add Player</button>

      {players.map((player) => (
        <div key={player.id}>
          <label>
            Name:
            <input
              type="text"
              value={player.name}
              onChange={(e) => updatePlayer(player.id, "name", e.target.value)}
            />
          </label>
          <label>
            Spotify URI:
            <input
              type="text"
              value={player.spotifyUri}
              onChange={(e) => updatePlayer(player.id, "spotifyUri", e.target.value)}
            />
          </label>
          <label>
            Start Time (ms):
            <input
              type="number"
              value={player.startTime}
              onChange={(e) => updatePlayer(player.id, "startTime", Number(e.target.value))}
            />
          </label>
        </div>
      ))}
    </div>
  );
}
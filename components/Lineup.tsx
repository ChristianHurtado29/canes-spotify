import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../src/firebaseConfig';
import axios from 'axios';
import Link from 'next/link';
import { useToken } from '../src/context/TokenContext';

type Player = {
  id: string;
  name: string;
  spotifyUri: string;
  startTime: number;
  alwaysPlayFull?: boolean;
};

export default function Lineup() {
  const { accessToken, isLoading } = useToken();
  const [players, setPlayers] = useState<Player[]>([]);
  const [currentSong, setCurrentSong] = useState('');

  useEffect(() => {
    const fetchPlayers = async () => {
      const querySnapshot = await getDocs(collection(db, 'players'));
      const playerData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Player[];
      setPlayers(playerData);
    };

    fetchPlayers();
  }, []);

  const playSong = async (
    spotifyUri: string,
    startTime: number,
    alwaysPlayFull: boolean = false
  ) => {
    if (isLoading || !accessToken) {
      alert('Spotify token is not ready. Please try again in a moment.');
      return;
    }
    console.log(currentSong)
    setCurrentSong(spotifyUri);

    try {
      await axios.put('/api/play', {
        spotifyUri,
        startTime,
        accessToken,
      });

      if (!alwaysPlayFull) {
        setTimeout(() => {
          axios
            .put('/api/pause', null, {
              headers: {
                Authorization: `Bearer ${accessToken}`,
              },
            })
            .catch((err) => {
              console.error('Error pausing song:', err);
            });
        }, 15000); // ⏱ Pause after 15 seconds
      } else {
        console.log('Playing full song (alwaysPlayFull = true)');
      }
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };

  const deletePlayer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this player?')) return;
  
    try {
      await deleteDoc(doc(db, 'players', id));
      setPlayers((prev) => prev.filter((player) => player.id !== id));
      console.log(`✅ Player ${id} deleted`);
    } catch (error) {
      console.error('❌ Error deleting player:', error);
      alert('Something went wrong deleting the player.');
    }
  };
  

  return (
    <div>
      <Link href="/addPlayer">Add a New Player Profile</Link>
      <h1>Team Lineup</h1>

      {players.map((player) => (
        <div key={player.id} style={{ marginTop: '20px' }}>
          <h3>{player.name}</h3>
          <button
            onClick={() =>
              playSong(player.spotifyUri, player.startTime, player.alwaysPlayFull)
            }
          >
            Play {player.name}&apos;s Song
          </button>
          <button onClick={() => deletePlayer(player.id)} style={{ marginLeft: '10px', color: 'red' }}>
            Delete
          </button>
        </div>
      ))}
    </div>
  );
}

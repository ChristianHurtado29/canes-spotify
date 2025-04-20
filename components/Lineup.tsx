import { useState, useEffect } from 'react';
import { collection, getDocs} from 'firebase/firestore';
import { db } from '../src/firebaseConfig';
import axios from 'axios';
import Link from 'next/link';
// import SpotifyPlayer from './SpotifyPlayer';
import { useToken } from '../src/context/TokenContext';

interface Player {
  id: string;
  name: string;
  spotifyUri: string;
  startTime: number;
  alwaysPlayFull: false
}

export default function Lineup() {
  const { accessToken } = useToken();
  const [players, setPlayers] = useState<Player[]>([]);

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

  // const updatePlayer = async (id: string, field: keyof Player, value: string | number) => {
  //   const playerDoc = doc(db, 'players', id);
  //   await updateDoc(playerDoc, { [field]: value });

  //   setPlayers((prevPlayers) =>
  //     prevPlayers.map((player) =>
  //       player.id === id ? { ...player, [field]: value } : player
  //     )
  //   );
  // };

  const playSong = async (
    spotifyUri: string,
    startTime: number,
    alwaysPlayFull: boolean,
  ) => {
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
        }, 15000);
      }
    } catch (error) {
      console.error('Error playing song:', error);
    }
  };
  
  

  return (
    <div>
      <Link href="/addPlayer">Add a New Player Profile</Link>
      <h1>Team Lineup</h1>

      {players.map((player) => (
        <div key={player.id} style={{ marginTop: '20px' }}>
          <h3>{player.name}</h3>
          <button onClick={() => playSong(player.spotifyUri, player.startTime, player.alwaysPlayFull)}>
            Play {player.name}&apos;s Song
          </button>
        </div>
      ))}
{/* 
      <div>
        <SpotifyPlayer />
      </div> */}
    </div>
  );
}

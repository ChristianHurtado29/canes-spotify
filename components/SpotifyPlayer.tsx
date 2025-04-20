// import { useState, useEffect } from 'react';
// import { useToken } from '../src/context/TokenContext';

// export default function SpotifyPlayer() {
//   const [player, setPlayer] = useState(null);
//   // const [isPlaying, setIsPlaying] = useState(false);
//   const [currentTrack, setCurrentTrack] = useState(null);
//   const { accessToken, isLoading } = useToken();

//   useEffect(() => {
//     if (isLoading) return;

//     if (!accessToken) {
//       console.error('No access token available');
//       return;
//     }

//     const script = document.createElement('script');
//     script.src = 'https://sdk.scdn.co/spotify-player.js';
//     script.async = true;
//     document.body.appendChild(script);

//     script.onload = () => {
//       window.onSpotifyWebPlaybackSDKReady = () => {
//         const spotifyPlayer = new window.Spotify.Player({
//           name: 'Baseball Lineup Player',
//           getOAuthToken: (cb) => cb(accessToken),
//           volume: 0.5,
//         });

//         spotifyPlayer.connect();
//       };
//     };

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, [accessToken]);

//   useEffect(() => {
//     const script = document.createElement('script');
//     script.src = 'https://sdk.scdn.co/spotify-player.js';
//     script.async = true;
//     document.body.appendChild(script);

//     script.onload = () => {
//       window.onSpotifyWebPlaybackSDKReady = () => {
//         const token = accessToken;
//         const spotifyPlayer = new window.Spotify.Player({
//           name: 'Baseball Lineup Player',
//           getOAuthToken: (cb) => { cb(accessToken); },
//           volume: 0.5,
//         });

//         setPlayer(spotifyPlayer);

//         // Event listeners
//         spotifyPlayer.addListener('ready', ({ device_id }) => {
//           console.log('Ready with Device ID', device_id);
//         });

//         spotifyPlayer.addListener('player_state_changed', (state) => {
//           if (state) {
//             const current = state.track_window.current_track;
//             setCurrentTrack({
//               name: current.name,
//               artist: current.artists[0].name,
//               album: current.album.name,
//             });
//             setIsPlaying(!state.paused);
//           }
//         });

//         spotifyPlayer.addListener('not_ready', ({ device_id }) => {
//           console.log('Device ID has gone offline', device_id);
//         });

//         spotifyPlayer.connect();
//       };
//     };

//     return () => {
//       document.body.removeChild(script);
//     };
//   }, []);

//   const play = () => {
//     player.resume();
//   };

//   const pause = () => {
//     player.pause();
//   };

//   const next = () => {
//     player.nextTrack();
//   };

//   const previous = () => {
//     player.previousTrack();
//   };

//   return (
//     <div>
//       <h1>Spotify Web Playback SDK</h1>
//       {player ? (
//         <div>
//           <h2>Currently Playing:</h2>
//           {currentTrack ? (
//             <div>
//               <p>Track: {currentTrack.name}</p>
//               <p>Artist: {currentTrack.artist}</p>
//               <p>Album: {currentTrack.album}</p>
//             </div>
//           ) : (
//             <p>No track currently playing</p>
//           )}
//           <div>
//             <button onClick={previous}>Previous</button>
//             <button onClick={play}>Play</button>
//             <button onClick={pause}>Pause</button>
//             <button onClick={next}>Next</button>
//           </div>
//         </div>
//       ) : (
//         <p>Loading player...</p>
//       )}
//     </div>
//   );
// }

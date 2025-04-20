import Head from 'next/head';
import Lineup from '../components/Lineup';
import { TokenProvider, useToken } from '@/context/TokenContext';
import { initTokenSync } from './api/spotifyApiClient';
import { useEffect } from 'react';
import { Analytics } from "@vercel/analytics/react"

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

export default function Home() {
  return (
    <TokenProvider>
      <InitTokenSync />
      <Head>
        <title>Baseball Lineup</title>
      </Head>
      <main>
        <Lineup />
      </main>
      <Analytics />
    </TokenProvider>
  );
}

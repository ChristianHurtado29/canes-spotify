import Head from 'next/head';
import Lineup from '../components/Lineup';
import { TokenProvider } from '@/context/TokenContext';

export default function Home() {
  return (
    <div>
      <TokenProvider>
        <Head>
          <title>Baseball Lineup</title>
        </Head>
        <main>
          <Lineup />
        </main>
      </TokenProvider>
    </div>
  );
}

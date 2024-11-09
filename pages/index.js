import Head from 'next/head';
import Lineup from '../components/Lineup';

export default function Home() {
  return (
    <div>
      <Head>
        <title>Baseball Lineup</title>
      </Head>
      <main>
        <Lineup />
      </main>
    </div>
  );
}

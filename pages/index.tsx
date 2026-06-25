import Head from 'next/head';
import Timer from '../components/Timer';
import ActiveViewers from '../components/ActiveViewers';
import TotalViews from '../components/TotalViews';

export default function Home() {
  return (
    <>
      <Head>
        <title>Gabriel Miss Penalty</title>
        <meta name="description" content="timer of how many days since Gabriel saves the world" />
      </Head>
      <main className="relative flex min-h-screen flex-col items-center justify-center gap-8 bg-black overflow-hidden">
        <Timer />
        <ActiveViewers />
        <TotalViews />
      </main>
    </>
  );
}
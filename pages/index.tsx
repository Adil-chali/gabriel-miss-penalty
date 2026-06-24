import Timer from '../components/Timer';
import ActiveViewers from '../components/ActiveViewers';
import TotalViews from '../components/TotalViews';

export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center bg-black overflow-hidden">
      <Timer />
      <ActiveViewers />
      <TotalViews />
    </main>
  );
}
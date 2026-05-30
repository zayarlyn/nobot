import { Outlet } from '@tanstack/react-router';
import Navbar from './common/components/Navbar';

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <main className="wrap">
        <Outlet />
      </main>
    </div>
  );
}

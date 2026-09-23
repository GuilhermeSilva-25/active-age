import { Outlet } from 'react-router-dom';
import { Navbar } from '../components/home/Navbar';
import { Footer } from '../components/home/Footer';

export function PublicLayout() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      <Outlet />
      <Footer />
    </div>
  );
}


import { Navbar } from '../components/home/Navbar';
import { Hero } from '../components/home/Hero';
import { Beneficios } from '../components/home/Beneficios';
import { ComoFunciona } from '../components/home/ComoFunciona';
import { DualPersona } from '../components/home/DualPersona';
import { CTA } from '../components/home/CTA';
import { Footer } from '../components/home/Footer';

export function Home() {
  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />
      
      <main className="flex-grow">
        <Hero />
        <Beneficios />
        <ComoFunciona />
        <DualPersona />
        <CTA />
      </main>

      <Footer />
    </div>
  );
}


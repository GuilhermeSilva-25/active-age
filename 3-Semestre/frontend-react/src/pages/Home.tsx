import { Hero } from '../components/home/Hero';
import { Beneficios } from '../components/home/Beneficios';
import { ComoFunciona } from '../components/home/ComoFunciona';
import { DualPersona } from '../components/home/DualPersona';
import { CTA } from '../components/home/CTA';

export function Home() {
  return (
    <main className="flex-grow">
      <Hero />
      <Beneficios />
      <ComoFunciona />
      <DualPersona />
      <CTA />
    </main>
  );
}

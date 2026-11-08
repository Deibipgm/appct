import { useEffect, useState } from 'react';

import { ART } from '@/game/sprites';

// Capa do jogo: arte "Super Dão" (herói + título) já com fundo transparente.
export default function HeroLogo({ className = '' }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.onload = () => setReady(true);
    img.src = ART.logoSuperDao;
  }, []);

  if (!ready) return <div className={className} aria-hidden="true" />;
  return (
    <img
      src={ART.logoSuperDao}
      alt="Super Dão"
      className={`${className} object-contain drop-shadow-[0_10px_14px_rgba(40,30,10,0.35)]`}
    />
  );
}

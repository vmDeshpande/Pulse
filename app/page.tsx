'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PulseCanvas } from '@/components/PulseCanvas';
import { FloatingShell } from '@/components/UI/FloatingShell';
import { PerformanceMonitor } from '@/components/PerformanceMonitor';
import { CinematicIntro } from '@/components/CinematicIntro';
import { InteractionOverlay } from '@/components/InteractionOverlay';
import { EventCard } from '@/components/UI/EventCard';
import { useEventCard } from '@/hooks/useEventCard';

export default function Page() {
  const [introComplete, setIntroComplete] = useState(false);
  const { card, closeCard } = useEventCard();

  return (
    <main className="relative w-full h-screen overflow-hidden bg-black">
      {/* 3D Canvas */}
      <PulseCanvas />

      {/* Cinematic Introduction */}
      {!introComplete && <CinematicIntro onComplete={() => setIntroComplete(true)} />}

      {/* UI Overlay - fades in after intro */}
      {introComplete && <FloatingShell />}

      {/* Performance Monitoring */}
      {introComplete && <PerformanceMonitor />}

      {/* Interaction Detection */}
      {introComplete && <InteractionOverlay />}

      {/* Event Cards */}
      {introComplete && card.type && card.data && card.id && (
        <EventCard id={card.id} type={card.type} data={card.data} onClose={closeCard} />
      )}
    </main>
  );
}

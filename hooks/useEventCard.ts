import { useEffect, useState, useCallback } from 'react';
import { useSceneStore } from '@/store/useSceneStore';

export interface EventCardState {
  type: 'flight' | 'earthquake' | 'wildfire' | 'iss' | null;
  data: Record<string, any> | null;
  id: string | null;
}

// Map to store event data for quick lookup
const eventDataMap = new Map<string, { type: string; data: any }>();

export function registerEventData(id: string, type: string, data: any) {
  eventDataMap.set(id, { type, data });
}

export function useEventCard() {
  const [card, setCard] = useState<EventCardState>({
    type: null,
    data: null,
    id: null,
  });

  const { selectedEvent } = useSceneStore();

  useEffect(() => {
    if (selectedEvent && eventDataMap.has(selectedEvent)) {
      const event = eventDataMap.get(selectedEvent)!;
      setCard({
        type: event.type as any,
        data: event.data,
        id: selectedEvent,
      });
    } else {
      setCard({
        type: null,
        data: null,
        id: null,
      });
    }
  }, [selectedEvent]);

  const closeCard = useCallback(() => {
    const { setSelectedEvent } = useSceneStore.getState();
    setSelectedEvent(null);
  }, []);

  return { card, closeCard };
}

"use client";

import { useState, useEffect } from 'react';
import { BillItem, Participant } from '@/lib/types';
import { getIconForItem } from '@/lib/icon-mapping';

export function useBillState(billId: string) {
  const [items, setItems] = useState<BillItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isStateLoaded, setIsStateLoaded] = useState(false);
  const storageKey = `bill-state-${billId}`;

  useEffect(() => {
    try {
      const savedState = localStorage.getItem(storageKey);
      if (savedState) {
        const parsedState = JSON.parse(savedState);
        setItems(
          parsedState.items.map((item: Omit<BillItem, 'icon'> & {iconName: string}) => ({
            ...item,
            icon: getIconForItem(item.name),
          })) || []
        );
        setParticipants(parsedState.participants || []);
      }
    } catch (error) {
      console.error('Failed to load state from localStorage:', error);
    }
    setIsStateLoaded(true);
  }, [billId, storageKey]);

  useEffect(() => {
    if (isStateLoaded) {
      const stateToSave = JSON.stringify({ items: items.map(item => ({...item, icon: null})), participants });
      localStorage.setItem(storageKey, stateToSave);
    }
  }, [items, participants, isStateLoaded, storageKey]);

  const addParticipant = (name: string) => {
    if (name && !participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
      const newParticipant: Participant = { id: crypto.randomUUID(), name };
      setParticipants((prev) => [...prev, newParticipant]);
    }
  };
  
  const removeParticipant = (id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
    setItems(prevItems => prevItems.map(item => ({
        ...item,
        participantIds: item.participantIds.filter(pId => pId !== id)
    })));
  }

  const addItem = (name: string, price: number) => {
    const newItem: BillItem = {
      id: crypto.randomUUID(),
      name,
      price,
      icon: getIconForItem(name),
      participantIds: [],
    };
    setItems((prev) => [newItem, ...prev]);
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const toggleItemParticipant = (itemId: string, participantId: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const participantIds = item.participantIds.includes(participantId)
            ? item.participantIds.filter((id) => id !== participantId)
            : [...item.participantIds, participantId];
          return { ...item, participantIds };
        }
        return item;
      })
    );
  };
  
  const assignItemToAll = (itemId: string) => {
     setItems((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
           const allParticipantIds = participants.map(p => p.id);
           const areAllAssigned = allParticipantIds.every(id => item.participantIds.includes(id));
          return { ...item, participantIds: areAllAssigned ? [] : allParticipantIds };
        }
        return item;
      })
    );
  }

  return {
    items,
    participants,
    isStateLoaded,
    addParticipant,
    removeParticipant,
    addItem,
    removeItem,
    toggleItemParticipant,
    assignItemToAll,
  };
}

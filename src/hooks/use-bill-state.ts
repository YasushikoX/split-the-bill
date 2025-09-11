"use client";

import { useState, useEffect, useCallback } from 'react';
import { BillItem, Participant } from '@/lib/types';
import { assignItemIcons } from '@/ai/flows/assign-item-icons';

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
          parsedState.items.map((item: BillItem) => ({
            ...item,
            isIconLoading: false,
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
      const stateToSave = JSON.stringify({ items, participants });
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

  const addItem = async (name: string, price: number) => {
    const newItem: BillItem = {
      id: crypto.randomUUID(),
      name,
      price,
      iconDataUri: null,
      participantIds: [],
      isIconLoading: true,
    };
    setItems((prev) => [newItem, ...prev]);

    try {
      const result = await assignItemIcons({ itemName: name });
      setItems((prev) =>
        prev.map((item) =>
          item.id === newItem.id
            ? { ...item, iconDataUri: result.iconDataUri, isIconLoading: false }
            : item
        )
      );
    } catch (error) {
      console.error('Failed to get icon:', error);
      setItems((prev) =>
        prev.map((item) =>
          item.id === newItem.id ? { ...item, isIconLoading: false } : item
        )
      );
    }
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

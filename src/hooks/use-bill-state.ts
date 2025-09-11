'use client';

import { useState, useEffect, useCallback } from 'react';
import { BillItem, Participant } from '@/lib/types';
import { getIconForItem } from '@/lib/icon-mapping';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  writeBatch,
  query,
} from 'firebase/firestore';

export function useBillState(billId: string) {
  const [items, setItems] = useState<BillItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  const fetchData = useCallback(async () => {
    if (!billId) return;

    try {
      const participantsQuery = query(collection(db, 'bills', billId, 'participants'));
      const participantsSnapshot = await getDocs(participantsQuery);
      const participantsData = participantsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Participant));
      setParticipants(participantsData);

      const itemsQuery = query(collection(db, 'bills', billId, 'items'));
      const itemsSnapshot = await getDocs(itemsQuery);
      const itemsData = itemsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          price: data.price,
          participantIds: data.participantIds || [],
          icon: getIconForItem(data.name),
        } as BillItem;
      });
      setItems(itemsData);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, [billId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addParticipant = useCallback(async (name: string) => {
    if (name && !participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        const tempId = `temp-${Date.now()}`;
        const newParticipant = { id: tempId, name };
        setParticipants(prev => [...prev, newParticipant]);

        try {
            const docRef = await addDoc(collection(db, 'bills', billId, 'participants'), { name });
            setParticipants(prev => prev.map(p => p.id === tempId ? { ...p, id: docRef.id } : p));
        } catch (error) {
            console.error("Error adding participant: ", error);
            setParticipants(prev => prev.filter(p => p.id !== tempId));
        }
    }
  }, [billId, participants]);
  
  const removeParticipant = useCallback(async (id: string) => {
    const originalParticipants = participants;
    const originalItems = items;
    
    setParticipants(prev => prev.filter(p => p.id !== id));
    setItems(prev => prev.map(item => ({
      ...item,
      participantIds: item.participantIds.filter(pId => pId !== id),
    })));

    try {
        const batch = writeBatch(db);
        const participantDocRef = doc(db, 'bills', billId, 'participants', id);
        batch.delete(participantDocRef);

        items.forEach(item => {
            if (item.participantIds.includes(id)) {
                const itemRef = doc(db, 'bills', billId, 'items', item.id);
                batch.update(itemRef, { participantIds: arrayRemove(id) });
            }
        });
        await batch.commit();
    } catch (error) {
        console.error("Error removing participant: ", error);
        setParticipants(originalParticipants);
        setItems(originalItems);
    }
  }, [billId, items, participants]);

  const addItem = useCallback(async (name: string, price: number) => {
    const tempId = `temp-${Date.now()}`;
    const newItem: BillItem = {
      id: tempId,
      name,
      price,
      participantIds: [],
      icon: getIconForItem(name)
    };
    setItems(prev => [...prev, newItem]);

    try {
        const docRef = await addDoc(collection(db, 'bills', billId, 'items'), {
            name,
            price,
            participantIds: [],
        });
        setItems(prev => prev.map(i => i.id === tempId ? { ...i, id: docRef.id } : i));
    } catch (error) {
        console.error("Error adding item: ", error);
        setItems(prev => prev.filter(i => i.id !== tempId));
    }
  }, [billId]);

  const removeItem = useCallback(async (id: string) => {
    const originalItems = items;
    setItems(prev => prev.filter(item => item.id !== id));
    try {
        await deleteDoc(doc(db, 'bills', billId, 'items', id));
    } catch (error) {
        console.error("Error removing item: ", error);
        setItems(originalItems);
    }
  }, [billId, items]);

  const toggleItemParticipant = useCallback(async (itemId: string, participantId: string) => {
    const originalItems = items;
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        const isParticipantAssigned = item.participantIds.includes(participantId);
        const newParticipantIds = isParticipantAssigned
          ? item.participantIds.filter(id => id !== participantId)
          : [...item.participantIds, participantId];
        return { ...item, participantIds: newParticipantIds };
      }
      return item;
    }));

    try {
      const itemRef = doc(db, 'bills', billId, 'items', itemId);
      const currentItem = originalItems.find(item => item.id === itemId);
      if (currentItem?.participantIds.includes(participantId)) {
          await updateDoc(itemRef, { participantIds: arrayRemove(participantId) });
      } else {
          await updateDoc(itemRef, { participantIds: arrayUnion(participantId) });
      }
    } catch (error) {
        console.error("Error toggling item participant: ", error);
        setItems(originalItems);
    }
  }, [billId, items]);
  
  const assignItemToAll = useCallback(async (itemId: string) => {
    const originalItems = items;
    const allParticipantIds = participants.map(p => p.id);
    
    setItems(prevItems => prevItems.map(item => {
      if (item.id === itemId) {
        const areAllAssigned = allParticipantIds.length > 0 && item.participantIds.length === allParticipantIds.length;
        return { ...item, participantIds: areAllAssigned ? [] : allParticipantIds };
      }
      return item;
    }));

    try {
      const itemRef = doc(db, 'bills', billId, 'items', itemId);
      const currentItem = originalItems.find(item => item.id === itemId);
      if (!currentItem) return;

      const areAllAssigned = allParticipantIds.length > 0 &&
        allParticipantIds.every(id => currentItem.participantIds.includes(id)) &&
        allParticipantIds.length === currentItem.participantIds.length;
      
      await updateDoc(itemRef, { participantIds: areAllAssigned ? [] : allParticipantIds });
    } catch (error) {
        console.error("Error assigning item to all: ", error);
        setItems(originalItems);
    }
  }, [billId, participants, items]);

  return {
    items,
    participants,
    addParticipant,
    removeParticipant,
    addItem,
    removeItem,
    toggleItemParticipant,
    assignItemToAll,
  };
}

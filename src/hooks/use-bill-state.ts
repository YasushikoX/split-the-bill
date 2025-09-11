'use client';

import { useState, useEffect, useCallback } from 'react';
import { BillItem, Participant } from '@/lib/types';
import { getIconForItem } from '@/lib/icon-mapping';
import { db } from '@/lib/firebase';
import {
  collection,
  doc,
  onSnapshot,
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

  useEffect(() => {
    if (!billId) return;

    const participantsQuery = query(collection(db, 'bills', billId, 'participants'));
    const participantsUnsubscribe = onSnapshot(participantsQuery, (snapshot) => {
      const participantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Participant));
      setParticipants(participantsData);
    }, (error) => {
      console.error("Error fetching participants:", error);
    });

    const itemsQuery = query(collection(db, 'bills', billId, 'items'));
    const itemsUnsubscribe = onSnapshot(itemsQuery, (snapshot) => {
      const itemsData = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name,
          price: data.price,
          paidById: data.paidById,
          participantIds: data.participantIds || [],
          icon: getIconForItem(data.name),
        } as BillItem;
      });
      setItems(itemsData);
    }, (error) => {
      console.error("Error fetching items:", error);
    });

    return () => {
      participantsUnsubscribe();
      itemsUnsubscribe();
    };
  }, [billId]);
  
  const addParticipant = useCallback(async (name: string) => {
    if (name && !participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        try {
            await addDoc(collection(db, 'bills', billId, 'participants'), { name });
        } catch (error) {
            console.error("Error adding participant: ", error);
        }
    }
  }, [billId, participants]);
  
  const removeParticipant = useCallback(async (id: string) => {
    try {
        const batch = writeBatch(db);
        const participantDocRef = doc(db, 'bills', billId, 'participants', id);
        batch.delete(participantDocRef);

        const currentItems = items;
        currentItems.forEach(item => {
            const itemRef = doc(db, 'bills', billId, 'items', item.id);
            if (item.participantIds.includes(id)) {
              batch.update(itemRef, { participantIds: arrayRemove(id) });
            }
            // If the removed participant was the payer, we need to handle this.
            // For now, we'll leave it, but a more robust solution might re-assign or flag it.
        });
        await batch.commit();
    } catch (error) {
        console.error("Error removing participant: ", error);
    }
  }, [billId, items]);

  const addItem = useCallback(async (name: string, price: number, paidById: string) => {
    try {
        await addDoc(collection(db, 'bills', billId, 'items'), {
            name,
            price,
            paidById,
            participantIds: [],
        });
    } catch (error) {
        console.error("Error adding item: ", error);
    }
  }, [billId]);

  const removeItem = useCallback(async (id: string) => {
    try {
        await deleteDoc(doc(db, 'bills', billId, 'items', id));
    } catch (error) {
        console.error("Error removing item: ", error);
    }
  }, [billId]);

  const toggleItemParticipant = useCallback(async (itemId: string, participantId: string) => {
    try {
      const itemRef = doc(db, 'bills', billId, 'items', itemId);
      const currentItem = items.find(item => item.id === itemId);
      
      if (currentItem?.participantIds.includes(participantId)) {
          await updateDoc(itemRef, { participantIds: arrayRemove(participantId) });
      } else {
          await updateDoc(itemRef, { participantIds: arrayUnion(participantId) });
      }
    } catch (error) {
        console.error("Error toggling item participant: ", error);
    }
  }, [billId, items]);
  
  const assignItemToAll = useCallback(async (itemId: string) => {
    try {
      const itemRef = doc(db, 'bills', billId, 'items', itemId);
      const currentItem = items.find(item => item.id === itemId);
      if (!currentItem) return;

      const allParticipantIds = participants.map(p => p.id);
      const areAllAssigned = allParticipantIds.length > 0 &&
        allParticipantIds.every(id => currentItem.participantIds.includes(id)) &&
        allParticipantIds.length === currentItem.participantIds.length;
      
      await updateDoc(itemRef, { participantIds: areAllAssigned ? [] : allParticipantIds });
    } catch (error) {
        console.error("Error assigning item to all: ", error);
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

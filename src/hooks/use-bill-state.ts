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
  getDocs,
  DocumentData,
  QuerySnapshot,
} from 'firebase/firestore';

export function useBillState(billId: string) {
  const [items, setItems] = useState<BillItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    if (!billId) return;

    // Listener for participants
    const participantsQuery = query(collection(db, 'bills', billId, 'participants'));
    const participantsUnsubscribe = onSnapshot(
      participantsQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const participantsData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        } as Participant));
        setParticipants(participantsData);
      },
      (error) => {
        console.error("Error fetching participants: ", error);
      }
    );

    // Listener for items
    const itemsQuery = query(collection(db, 'bills', billId, 'items'));
    const itemsUnsubscribe = onSnapshot(
      itemsQuery,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const itemsData = snapshot.docs.map(doc => {
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
      },
      (error) => {
        console.error("Error fetching items: ", error);
      }
    );

    // Cleanup listeners on component unmount
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

        const itemsQuery = query(collection(db, 'bills', billId, 'items'));
        const itemsSnapshot = await getDocs(itemsQuery);
        itemsSnapshot.forEach(itemDoc => {
            if (itemDoc.data().participantIds?.includes(id)) {
              const itemRef = doc(db, 'bills', billId, 'items', itemDoc.id);
              batch.update(itemRef, {
                  participantIds: arrayRemove(id)
              });
            }
        });

        await batch.commit();

    } catch (error) {
        console.error("Error removing participant: ", error);
    }
  }, [billId]);

  const addItem = useCallback(async (name: string, price: number) => {
    try {
        await addDoc(collection(db, 'bills', billId, 'items'), {
            name,
            price,
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
    const itemRef = doc(db, 'bills', billId, 'items', itemId);
    const currentItem = items.find(item => item.id === itemId);
    
    if (!currentItem) return;

    try {
      if (currentItem.participantIds.includes(participantId)) {
          await updateDoc(itemRef, {
              participantIds: arrayRemove(participantId)
          });
      } else {
          await updateDoc(itemRef, {
              participantIds: arrayUnion(participantId)
          });
      }
    } catch (error) {
        console.error("Error toggling item participant: ", error);
    }
  }, [billId, items]);
  
  const assignItemToAll = useCallback(async (itemId: string) => {
    const itemRef = doc(db, 'bills', billId, 'items', itemId);
    const allParticipantIds = participants.map(p => p.id);
    const currentItem = items.find(item => item.id === itemId);

    if (!currentItem) return;
    
    try {
        const areAllAssigned = allParticipantIds.length > 0 && 
          allParticipantIds.length === currentItem.participantIds.length && 
          allParticipantIds.every(id => currentItem.participantIds.includes(id));
        
        if (areAllAssigned) {
            // If everyone is assigned, unassign everyone
            await updateDoc(itemRef, { participantIds: [] });
        } else {
            // Otherwise, assign to everyone
            await updateDoc(itemRef, { participantIds: allParticipantIds });
        }
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

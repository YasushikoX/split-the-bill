'use client';

import { useState, useEffect } from 'react';
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
  getDocs
} from 'firebase/firestore';

export function useBillState(billId: string) {
  const [items, setItems] = useState<BillItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    const participantsCollection = collection(db, 'bills', billId, 'participants');
    const participantsUnsubscribe = onSnapshot(participantsCollection, (snapshot) => {
      const participantsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Participant));
      setParticipants(participantsData);
    });

    return () => participantsUnsubscribe();
  }, [billId]);

  useEffect(() => {
    const itemsCollection = collection(db, 'bills', billId, 'items');
    const itemsUnsubscribe = onSnapshot(itemsCollection, (snapshot) => {
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
    });

    return () => itemsUnsubscribe();
  }, [billId]);

  const addParticipant = async (name: string) => {
    if (name && !participants.some((p) => p.name.toLowerCase() === name.toLowerCase())) {
        try {
            await addDoc(collection(db, 'bills', billId, 'participants'), { name });
        } catch (error) {
            console.error("Error adding participant: ", error);
        }
    }
  };
  
  const removeParticipant = async (id: string) => {
    try {
        const batch = writeBatch(db);
        const participantDocRef = doc(db, 'bills', billId, 'participants', id);
        batch.delete(participantDocRef);

        const itemsQuery = query(collection(db, 'bills', billId, 'items'));
        const itemsSnapshot = await getDocs(itemsQuery);
        itemsSnapshot.forEach(itemDoc => {
            const itemRef = doc(db, 'bills', billId, 'items', itemDoc.id);
            batch.update(itemRef, {
                participantIds: arrayRemove(id)
            });
        });

        await batch.commit();

    } catch (error) {
        console.error("Error removing participant: ", error);
    }
  }

  const addItem = async (name: string, price: number) => {
    try {
        await addDoc(collection(db, 'bills', billId, 'items'), {
            name,
            price,
            participantIds: [],
        });
    } catch (error) {
        console.error("Error adding item: ", error);
    }
  };

  const removeItem = async (id: string) => {
    try {
        await deleteDoc(doc(db, 'bills', billId, 'items', id));
    } catch (error) {
        console.error("Error removing item: ", error);
    }
  };

  const toggleItemParticipant = async (itemId: string, participantId: string) => {
    try {
        const itemRef = doc(db, 'bills', billId, 'items', itemId);
        const currentItem = items.find(item => item.id === itemId);
        if (currentItem) {
            if (currentItem.participantIds.includes(participantId)) {
                await updateDoc(itemRef, {
                    participantIds: arrayRemove(participantId)
                });
            } else {
                await updateDoc(itemRef, {
                    participantIds: arrayUnion(participantId)
                });
            }
        }
    } catch (error) {
        console.error("Error toggling item participant: ", error);
    }
  };
  
  const assignItemToAll = async (itemId: string) => {
    try {
        const itemRef = doc(db, 'bills', billId, 'items', itemId);
        const allParticipantIds = participants.map(p => p.id);
        const currentItem = items.find(item => item.id === itemId);

        if (currentItem) {
            const areAllAssigned = allParticipantIds.length > 0 && allParticipantIds.every(id => currentItem.participantIds.includes(id));
            if (areAllAssigned) {
                await updateDoc(itemRef, { participantIds: [] });
            } else {
                await updateDoc(itemRef, { participantIds: allParticipantIds });
            }
        }
    } catch (error) {
        console.error("Error assigning item to all: ", error);
    }
  }

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

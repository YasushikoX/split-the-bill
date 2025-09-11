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
  DocumentData,
  QuerySnapshot,
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
        try {
            const docRef = await addDoc(collection(db, 'bills', billId, 'participants'), { name });
            setParticipants(prev => [...prev, { id: docRef.id, name }]);
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

        const updatedItems = items.map(item => {
            if (item.participantIds.includes(id)) {
                const itemRef = doc(db, 'bills', billId, 'items', item.id);
                const newParticipantIds = item.participantIds.filter(pId => pId !== id);
                batch.update(itemRef, { participantIds: newParticipantIds });
                return { ...item, participantIds: newParticipantIds };
            }
            return item;
        });

        await batch.commit();
        setItems(updatedItems);
        setParticipants(prev => prev.filter(p => p.id !== id));
    } catch (error) {
        console.error("Error removing participant: ", error);
    }
  }, [billId, items]);

  const addItem = useCallback(async (name: string, price: number) => {
    try {
        const docRef = await addDoc(collection(db, 'bills', billId, 'items'), {
            name,
            price,
            participantIds: [],
        });
        const newItem: BillItem = {
          id: docRef.id,
          name,
          price,
          participantIds: [],
          icon: getIconForItem(name)
        };
        setItems(prev => [...prev, newItem]);
    } catch (error) {
        console.error("Error adding item: ", error);
    }
  }, [billId]);

  const removeItem = useCallback(async (id: string) => {
    try {
        await deleteDoc(doc(db, 'bills', billId, 'items', id));
        setItems(prev => prev.filter(item => item.id !== id));
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
          await updateDoc(itemRef, { participantIds: arrayRemove(participantId) });
          setItems(prevItems => prevItems.map(item => 
              item.id === itemId 
              ? { ...item, participantIds: item.participantIds.filter(id => id !== participantId) } 
              : item
          ));
      } else {
          await updateDoc(itemRef, { participantIds: arrayUnion(participantId) });
          setItems(prevItems => prevItems.map(item => 
              item.id === itemId 
              ? { ...item, participantIds: [...item.participantIds, participantId] } 
              : item
          ));
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
        
        let newParticipantIds: string[];
        if (areAllAssigned) {
            // If everyone is assigned, unassign everyone
            newParticipantIds = [];
        } else {
            // Otherwise, assign to everyone
            newParticipantIds = allParticipantIds;
        }
        await updateDoc(itemRef, { participantIds: newParticipantIds });
        setItems(prevItems => prevItems.map(item => 
            item.id === itemId 
            ? { ...item, participantIds: newParticipantIds } 
            : item
        ));
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

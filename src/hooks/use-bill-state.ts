'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { Bill, BillItem, Participant, BillHistoryEntry } from '@/lib/types';
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
  setDoc,
  getDoc
} from 'firebase/firestore';
import { useDebouncedCallback } from 'use-debounce';
import { addDays } from 'date-fns';

const MAX_HISTORY_LENGTH = 20;

export function useBillState(billId: string) {
  const [bill, setBill] = useState<Bill | null>(null);
  const [items, setItems] = useState<BillItem[]>([]);
  const [participants, setParticipants] = useState<Participant[]>([]);
  
  const billDocRef = useMemo(() => doc(db, 'bills', billId), [billId]);

  const updateHistory = useCallback((billData: Bill) => {
    try {
      const historyString = localStorage.getItem('billHistory');
      let history: BillHistoryEntry[] = historyString ? JSON.parse(historyString) : [];
      
      const existingIndex = history.findIndex(entry => entry.id === billData.id);
      
      const newEntry: BillHistoryEntry = {
        id: billData.id,
        title: billData.title,
        date: billData.date,
        accessedAt: new Date().toISOString()
      };

      if (existingIndex > -1) {
        history.splice(existingIndex, 1);
      }
      
      history.unshift(newEntry);
      
      if (history.length > MAX_HISTORY_LENGTH) {
        history = history.slice(0, MAX_HISTORY_LENGTH);
      }

      localStorage.setItem('billHistory', JSON.stringify(history));
    } catch (error) {
      console.error("Failed to update bill history:", error);
    }
  }, []);


  useEffect(() => {
    if (!billId) return;

    const unsubBill = onSnapshot(billDocRef, async (docSnapshot) => {
      if (docSnapshot.exists()) {
        const billData = { id: docSnapshot.id, ...docSnapshot.data() } as Bill;
        setBill(billData);
        updateHistory(billData);
      } else {
        const now = new Date();
        const expirationDays = parseInt(process.env.NEXT_PUBLIC_BILL_EXPIRATION_DAYS || '30', 10);
        const expirationDate = addDays(now, expirationDays);
        const newBill: Omit<Bill, 'id'> = {
          title: 'Untitled Bill',
          date: now.toISOString(),
          createdAt: now.toISOString(),
          expireAt: expirationDate.toISOString(),
        };
        await setDoc(billDocRef, newBill);
      }
    });

    const participantsQuery = query(collection(db, 'bills', billId, 'participants'));
    const unsubParticipants = onSnapshot(participantsQuery, (snapshot) => {
      const participantsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Participant));
      setParticipants(participantsData);
    });

    const itemsQuery = query(collection(db, 'bills', billId, 'items'));
    const unsubItems = onSnapshot(itemsQuery, (snapshot) => {
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
    });

    return () => {
      unsubBill();
      unsubParticipants();
      unsubItems();
    };
  }, [billId, billDocRef, updateHistory]);
  
  const debouncedUpdateBill = useDebouncedCallback(async (updates: Partial<Bill>) => {
    await updateDoc(billDocRef, updates);
     if (bill) {
      const updatedBill = { ...bill, ...updates };
      setBill(updatedBill);
      updateHistory(updatedBill);
    }
  }, 500);

  const updateBill = useCallback((updates: Partial<Bill>) => {
      setBill(prevBill => prevBill ? { ...prevBill, ...updates } : null);
      debouncedUpdateBill(updates);
  }, [debouncedUpdateBill]);


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
    bill,
    items,
    participants,
    updateBill,
    addParticipant,
    removeParticipant,
    addItem,
    removeItem,
    toggleItemParticipant,
    assignItemToAll,
  };
}

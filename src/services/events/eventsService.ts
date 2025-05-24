import { addDoc, deleteDoc, getDocs, query, updateDoc, where } from 'firebase/firestore/lite';
import { Event, CreateEventDTO, UpdateEventDTO } from '../../types/event';
import { eventsCollection } from '../firebase';
import { LogError } from '../logger';

export async function createEvent(data: CreateEventDTO): Promise<string | null> {
  try {
    const newEvent = new Event(
      data.name,
      data.type,
      data.startDate,
      data.status || 'planned',
      data.description,
      data.endDate,
      data.location,
      data.guests,
      data.menu,
      data.giftList,
      data.payments,
      data.suppliers,
      data.organizer,
      data.maxCapacity,
      data.rsvpRequired,
      data.rsvpDeadline,
      data.notes
    );

    await addDoc(eventsCollection, { ...newEvent })
    return newEvent.id;
  } catch (error) {
    LogError(`Error creating event: ${error}`);
    return null;
  }
}

export async function getAllEvents(): Promise<Event[]> {
  try {
    const eventsSnapshot = await getDocs(eventsCollection);
    return eventsSnapshot.docs.map(doc => doc.data()) as Event[];
  } catch (error) {
    LogError(`Error getting all events: ${error}`);
    return [];
  }
}

export async function getEventById(id: string): Promise<Event | null> {
  try {
    const eventQuery = query(eventsCollection, where("id", "==", id))
    const eventDoc = await getDocs(eventQuery);

    if (eventDoc.empty) {
      return null;
    }

    return eventDoc.docs[0].data() as Event;
  } catch (error) {
    LogError(`Error getting event: ${error}`);
    return null;
  }
}

export async function updateEvent(id: string, data: UpdateEventDTO): Promise<string> {
  try {
    const eventQuery = query(eventsCollection, where("id", "==", id))
    const eventDoc = await getDocs(eventQuery);

    if (eventDoc.empty) {
      return '';
    }

    const rawData = eventDoc.docs[0].data() as Event;
    const currentDocInstance = Event.fromFirestore(rawData!);

    currentDocInstance.applyUpdates!(data);

    await updateDoc(eventDoc.docs[0].ref, { ...currentDocInstance });
    return currentDocInstance.id;
  } catch (error) {
    LogError(`Error updating event: ${error}`);
    return '';
  }
}

export async function deleteEvent(id: string): Promise<boolean> {
  try {
    const eventQuery = query(eventsCollection, where("id", "==", id))
    const querySnap = await getDocs(eventQuery);

    if (querySnap.empty) {
      return false;
    }

    await Promise.all(querySnap.docs.map(doc => deleteDoc(doc.ref)));
    return true;
  } catch (error) {
    LogError(`Error deleting event: ${error}`);
    return false;
  }
}

import { addDoc, getDocs, query, where } from "firebase/firestore/lite";
import { suppliersCollection } from "../firebase";
import { LogError } from "../logger";

export const getGuest = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Guest ID not provided");
    }

    const guestQuery = query(suppliersCollection, where("id", "==", id));
    const guest = await getDocs(guestQuery);

    if (!guest.empty) {
      return guest.docs[0].data();
    }

    return null;
  } catch (e) {
    LogError(`Error getting guest: ${e}`);
    throw new Error("Error fetching guest");
  }
}

export const addNewGuest = async (name: string) => {
  try {
    if (!name) {
      throw new Error("Guest name not provided");
    }

    await addDoc(suppliersCollection, {
      name,
    });
  } catch (e) {
    LogError(`Error adding new guest: ${e}`);
    throw new Error("Error adding guest");
  }
} 
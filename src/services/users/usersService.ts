import { addDoc, deleteDoc, getDocs, query, updateDoc, where } from 'firebase/firestore/lite';
import { User, CreateUserDTO, UpdateUserDTO } from '../../types/user';
import { usersCollection } from '../firebase';
import { LogError } from '../logger';

export async function createUser(data: CreateUserDTO): Promise<string | null> {
  try {
    const newUser = new User(
      data.name,
      data.password,
      data.contact,
      data.documentNumber,
      data.events
    );

    await addDoc(usersCollection, { ...newUser });
    return newUser.id;
  } catch (error) {
    LogError(`Error creating user: ${error}`);
    return null;
  }
}

export async function getAllUsers(): Promise<User[]> {
  try {
    const usersSnapshot = await getDocs(usersCollection);
    return usersSnapshot.docs.map(doc => doc.data()) as User[];
  } catch (error) {
    LogError(`Error getting all users: ${error}`);
    return [];
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const userQuery = query(usersCollection, where("id", "==", id))
    const userDoc = await getDocs(userQuery);

    if (userDoc.empty) {
      return null;
    }

    return userDoc.docs[0].data() as User;
  } catch (error) {
    LogError(`Error getting user: ${error}`);
    return null;
  }
}

export async function updateUser(id: string, data: UpdateUserDTO): Promise<string> {
  try {
    const userQuery = query(usersCollection, where("id", "==", id))
    const userDoc = await getDocs(userQuery);

    if (userDoc.empty) {
      return '';
    }

    const rawData = userDoc.docs[0].data() as User;
    const currentDocInstance = User.fromFirestore(rawData!);

    currentDocInstance.applyUpdates!(data);

    await updateDoc(userDoc.docs[0].ref, { ...currentDocInstance });
    return currentDocInstance.id;
  } catch (error) {
    LogError(`Error updating user: ${error}`);
    return '';
  }
}
export async function deleteUser(id: string): Promise<boolean> {
  try {
    const userQuery = query(usersCollection, where("id", "==", id));
    const querySnap = await getDocs(userQuery);

    if (querySnap.empty) {
      return false;
    }

    await Promise.all(
      querySnap.docs.map(doc => updateDoc(doc.ref, { deleted: true }))
    );
    return true;
  } catch (error) {
    LogError(`Error deleting user: ${error}`);
    return false;
  }
}

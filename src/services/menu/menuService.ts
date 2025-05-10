import { addDoc, deleteDoc, getDocs, query, updateDoc, where } from 'firebase/firestore/lite';
import { MenuItem, CreateMenuItemDTO, UpdateMenuItemDTO } from '../../types/menu';
import { menuCollection } from '../firebase';
import { LogError } from '../logger';


export async function createMenuItem(data: CreateMenuItemDTO): Promise<string | null> {
  try {
    const newItem = new MenuItem(
      data.name,
      data.description,
      data.price,
      data.category,
      data.isAvailable
    );

    const docRef = await addDoc(menuCollection, { ...newItem })

    return docRef.id;
  } catch (error) {
    LogError(`Error creating menu item: ${error}`);
    return null;
  }
}

export async function getAllMenuItems(): Promise<MenuItem[]> {
  try {
    const menuSnapshot = await getDocs(menuCollection);
    return menuSnapshot.docs.map(doc => doc.data()) as MenuItem[];
  } catch (error) {
    LogError(`Error getting all menu items: ${error}`);
    return [];
  }
}

export async function getMenuItemById(id: string): Promise<MenuItem | null> {
  try {
    const menuQuery = query(menuCollection, where("id", "==", id))
    const menuDoc = await getDocs(menuQuery);

    if (menuDoc.empty) {
      return null;
    }

    return menuDoc.docs[0].data() as MenuItem;
  } catch (error) {
    LogError(`Error getting menu item: ${error}`);
    return null;
  }
}

export async function updateMenuItem(id: string, data: UpdateMenuItemDTO): Promise<boolean> {
  try {
    const menuQuery = query(menuCollection, where("id", "==", id))
    const menuDoc = await getDocs(menuQuery);

    if (menuDoc.empty) {
      return false;
    }

    const rawData = menuDoc.docs[0].data() as MenuItem;
    const currentDocInstance = MenuItem.fromFirestore(rawData!);;

    currentDocInstance.applyUpdates!(data);

    await updateDoc(menuDoc.docs[0].ref, { ...currentDocInstance });
    return true;
  } catch (error) {
    LogError(`Error updating menu item: ${error}`);
    return false;
  }
}

export async function deleteMenuItem(id: string): Promise<boolean> {
  try {
    const menuQuery = query(menuCollection, where("id", "==", id))
    const querySnap = await getDocs(menuQuery);

    if (querySnap.empty) {
      return false;
    }

    await Promise.all(querySnap.docs.map(doc => deleteDoc(doc.ref)));
    return true;
  } catch (error) {
    LogError(`Error deleting menu item: ${error}`);
    return false;
  }
}
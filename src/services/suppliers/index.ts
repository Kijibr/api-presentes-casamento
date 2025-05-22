import { addDoc, getDocs, query, updateDoc, where } from "firebase/firestore/lite";
import { suppliersCollection } from "../firebase";
import { LogError } from "../logger";
import { ICreateSupplierDto, IUpdateSupplierDto, Supplier } from "../../types/supplier";

export async function getSuppliersList(): Promise<Supplier[]> {
  try {
    const supplierSnapshot = await getDocs(suppliersCollection);
    return supplierSnapshot.docs.map(doc => doc.data()) as Supplier[];
  } catch (error) {
    LogError(`Error getting all supplier items: ${error}`);
    return [];
  }
}

export const getSupplierById = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Supplier ID not provided");
    }

    const supplierQuery = query(suppliersCollection, where("id", "==", id));
    const supplier = await getDocs(supplierQuery);

    if (!supplier.empty) {
      return supplier.docs[0].data();
    }

    return null;
  } catch (e) {
    LogError(`Error getting supplier: ${e}`);
    throw new Error("Error fetching supplier");
  }
}

export const addNewSupplier = async (supplier: ICreateSupplierDto) => {
  try {
    if (supplier.documentNumber === "" || supplier.documentNumber.length < 11) {
      throw new Error("Supplier document number is invalid");
    }

    const newItem = new Supplier(
      supplier.name,
      supplier.contact,
      supplier.documentNumber,
      supplier.address,
      supplier.services,
      supplier.serviceType,
      supplier.description,
      supplier.rate
    );

    await addDoc(suppliersCollection, {
      ...newItem
    });

    return newItem.id;
  } catch (e) {
    LogError(`Error adding new supplier: ${e}`);
    throw new Error("Error adding supplier");
  }
} 

export async function updateSupplier(id: string, data: IUpdateSupplierDto): Promise<string> {
  try {
    const supplierQuery = query(suppliersCollection, where("id", "==", id))
    const supplierDoc = await getDocs(supplierQuery);

    if (supplierDoc.empty) {
      return "";
    }

    const rawData = supplierDoc.docs[0].data() as Supplier;
    const currentDocInstance = Supplier.fromFirestore(rawData!);;

    currentDocInstance.applyUpdates!(data);

    await updateDoc(supplierDoc.docs[0].ref, { ...currentDocInstance });
    return currentDocInstance.id;
  } catch (error) {
    LogError(`Error updating supplier ${data.documentNumber}: ${error}`);
    return "";
  }
}

export async function disableSupplierAsync(id: string): Promise<boolean> {
  try {
    const supplierQuery = query(suppliersCollection, where("id", "==", id))
    const querySnap = await getDocs(supplierQuery);

    if (querySnap.empty) {
      return false;
    }

    const rawData = querySnap.docs[0].data() as Supplier;
    const currentDocInstance = Supplier.fromFirestore(rawData!);
       
    currentDocInstance.applyUpdates!(rawData);
    currentDocInstance.changeAvailability();

    await updateDoc(querySnap.docs[0].ref, { ...currentDocInstance });
    return true;
  } catch (error) {
    LogError(`Error deleting menu item: ${error}`);
    return false;
  }
}
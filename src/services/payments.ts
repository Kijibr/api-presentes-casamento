import { PaymentType } from "../types";
import { payersCollection } from "./firebase";
import { addDoc, getDocs, query, where } from "firebase/firestore/lite";
import { v4 as uuidv4 } from 'uuid';

export const addNewPayer = async (payload: PaymentType): Promise<string> => {
  const transactionId = uuidv4(); 
  try {
    payload = {
      ...payload,
      id: transactionId,
      createdAt: new Date().toISOString(),
      value: parseFloat(payload.value.toString())
    }
    
    await addDoc(payersCollection, payload);
    return transactionId;
  } catch (e) {
    console.error("Error save new payer: ", e);
    return transactionId;
  }
}

export const getPayment = async (id: string) => {
  const payerQuery = query(payersCollection, where("id", "==", id));
  const payer = await getDocs(payerQuery);

  if (!payer.empty)
    return payer.docs[0].data() as PaymentType;
  
  return null;
} 
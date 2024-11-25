import { PaymentType } from "../types";
import { paymentsCollection } from "./firebase";
import { addDoc, getDocs, query, updateDoc, where } from "firebase/firestore/lite";
import { v4 as uuidv4 } from 'uuid';

export const addNewPayment = async (payload: PaymentType): Promise<string> => {
  const transactionId = uuidv4();
  try {
    payload = {
      ...payload,
      id: transactionId,
      createdAt: new Date().toISOString(),
      originalValue: parseFloat(payload.originalValue.toString()),
      totalValue: parseFloat(payload.totalValue.toString())
    }

    await addDoc(paymentsCollection, payload);
    return transactionId;
  } catch (e) {
    console.error("Error save new payment: ", e);
    return transactionId;
  }
}

export const getPayment = async (id: string) => {
  const paymentQuery = query(paymentsCollection, where("id", "==", id));
  const payment = await getDocs(paymentQuery);

  if (!payment.empty) {
    const result = payment.docs[0].data() as PaymentType;
    return result;
  }

  return null;
}

export const updatePaymentStatus = async (paymentId: string, status: string) => {
  const paymentQuery = query(paymentsCollection, where("paymentId", "==", paymentId));
  const paymentsSnap = await getDocs(paymentQuery);

  if (!paymentsSnap.empty) {
    const paymentRef = paymentsSnap.docs[0].ref;

    await updateDoc(paymentRef, { status });
    return true;
  }

  return false;
}
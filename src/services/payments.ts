import { PaymentModel } from "../types";
import { paymentsCollection } from "./firebase";
import { addDoc, getDocs, query, updateDoc, where } from "firebase/firestore/lite";

export const addNewPayment = async (payload: PaymentModel): Promise<string> => {
  try {
    payload = {
      ...payload,
      originalValue: parseFloat(payload.originalValue.toString()),
      totalValue: parseFloat(payload.totalValue.toString())
    }

    await addDoc(paymentsCollection, payload);
    return payload.id;
  } catch (e) {
    console.error("Error save new payment: ", e);
    return payload.id;
  }
}

export const getPayment = async (id: string) => {
  const paymentQuery = query(paymentsCollection, where("id", "==", id));
  const payment = await getDocs(paymentQuery);

  if (!payment.empty) {
    const result = payment.docs[0].data() as PaymentModel;
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
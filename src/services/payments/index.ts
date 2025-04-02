import { PaymentModel } from "../../types";
import { paymentsCollection } from "../firebase";
import { addDoc, getDocs, query, updateDoc, where } from "firebase/firestore/lite";
import { LogError } from "../logger";
import { isPaymentExpired, getRemainingTime, formatRemainingTime } from "./expiration";

export const addNewPayment = async (payload: PaymentModel): Promise<string> => {
  try {
    if (!payload || !payload.id || !payload.originalValue || !payload.totalValue) {
      throw new Error("Invalid payment data");
    }

    const paymentData = {
      ...payload,
      originalValue: parseFloat(payload.originalValue.toString()),
      totalValue: parseFloat(payload.totalValue.toString())
    };

    const docRef = await addDoc(paymentsCollection, paymentData);
    return docRef.id;
  } catch (e) {
    LogError(`Error saving new payment: ${e}`);
    throw new Error("Error saving payment");
  }
}

export const getPayment = async (id: string) => {
  try {
    if (!id) {
      throw new Error("Payment ID not provided");
    }

    const paymentQuery = query(paymentsCollection, where("id", "==", id));
    const payment = await getDocs(paymentQuery);

    if (!payment.empty) {
      const result = payment.docs[0].data() as PaymentModel;
      
      // Verifica se o pagamento expirou
      const expired = isPaymentExpired(result);
      if (expired && !result.isExpired) {
        // Atualiza o status do pagamento para expirado
        await updateDoc(payment.docs[0].ref, { isExpired: true });
        result.isExpired = true;
      }

      return {
        ...result,
        remainingTime: getRemainingTime(result),
        remainingTimeFormatted: formatRemainingTime(getRemainingTime(result))
      };
    }

    return null;
  } catch (e) {
    LogError(`Error getting payment: ${e}`);
    throw new Error("Error fetching payment");
  }
}

export const updatePaymentStatus = async (paymentId: string, status: string) => {
  try {
    if (!paymentId || !status) {
      throw new Error("Invalid update data");
    }

    const paymentQuery = query(paymentsCollection, where("paymentId", "==", paymentId));
    const payment = await getDocs(paymentQuery);

    if (!payment.empty) {
      const paymentData = payment.docs[0].data() as PaymentModel;
      
      // Verifica se o pagamento expirou antes de atualizar o status
      if (isPaymentExpired(paymentData)) {
        throw new Error("Payment has expired");
      }

      await updateDoc(payment.docs[0].ref, { status });
      return true;
    }

    return false;
  } catch (e) {
    LogError(`Error updating payment status: ${e}`);
    throw new Error("Error updating payment status");
  }
} 
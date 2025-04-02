import { PaymentModel } from "../../types";
import { LogError } from "../logger";

export function isPaymentExpired(payment: PaymentModel): boolean {
  try {
    if (!payment.expiresAt) {
      LogError(`Payment ${payment.id} has no expiration date`);
      return true;
    }

    const expirationDate = new Date(payment.expiresAt);
    const currentDate = new Date();

    return currentDate > expirationDate;
  } catch (error) {
    LogError(`Error checking payment expiration: ${error}`);
    return true;
  }
}

export function getRemainingTime(payment: PaymentModel): number {
  try {
    if (!payment.expiresAt) {
      return 0;
    }

    const expirationDate = new Date(payment.expiresAt);
    const currentDate = new Date();
    const remainingTime = expirationDate.getTime() - currentDate.getTime();

    return Math.max(0, Math.floor(remainingTime / 1000)); // Retorna em segundos
  } catch (error) {
    LogError(`Error calculating remaining time: ${error}`);
    return 0;
  }
}

export function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) {
    return "Expired";
  }
  return `${seconds} seconds remaining`;
} 
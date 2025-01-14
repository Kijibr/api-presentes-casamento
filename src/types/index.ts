type BaseType = {
  id: string,
  createdAt: Date,
  updatedAt?: Date,
  name: string,
}

export enum PaymentMethods {
  Pix,
  CreditCard
};

export type GiftType = BaseType & {
  id: string,
  giftValue: string,
  image?: string
}

export type PaymentType = BaseType & {
  giftId: string,
  giftName: string,
  paymentMethod: PaymentMethods,
  installments?: number,
  paymentId?: number,
  qrCode?: string,
  totalValue: number,
  originalValue: number,
  installmentsValue?: number,
  status?: string,
}

export type GiftToPay = {
  paymentId: number,
  id: string,
  name: string,
  price: string,
  image?: string,
  qrCode: string,
}

type UserType = BaseType & {
  email: string;
  password: string;
}

export type GuestType = UserType & {
  confirmed: boolean;
  answered: boolean;
}
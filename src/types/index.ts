type BaseType = {
  id?: string,
  createdAt?: string,
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
  paymentId?: number,
  qrCode?: string,
  value: number,
}

export type GiftToPay = {
  paymentId: number,
  id: string,
  name: string,
  giftValue: string,
  image?: string,
  qrCode: string,
}

export type GuestType = BaseType & {
  password: string;
  confirmed: boolean;
  answered: boolean;
}
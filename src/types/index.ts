import { v4 as uuidv4 } from 'uuid';
export class BaseType {
  id: string;
  createdAt: string = new Date().toISOString();
  updatedAt?: string;

  constructor() {
    this.id = uuidv4();
  }

  updateItem?() {
    this.updatedAt = new Date().toISOString();
  }
}

export enum PaymentMethods {
  Pix = "pix",
  CreditCard = "credit_card"
};

export class GiftModel extends BaseType {
  name: string;
  giverId?: string;
  eventId?: string;
  price: number;
  image?: string;
  availability?: boolean;

  constructor(
    name: string,
    price: string,
    giverId?: string,
    eventId?: string,
    image?: string,
    availability?: boolean
  ) {
    super();
    this.name = name;
    this.giverId = giverId;
    this.eventId = eventId;
    this.price = parseFloat(price);
    this.image = image;
    this.availability = availability;
  }
}

export type EventType = BaseType & {
  name: string;
  description: string;
  status: 'planned' | 'cancelled' | 'completed';
  organizerId: string;
  eventDate: Date;
  address: Address & {
    coordinates?: {
      latitude: string;
      longitude: string;
    }
  }
  guests: GuestType[]
}
export class PaymentModel extends BaseType {
  giftId: string;
  giftName: string;
  payerName: string;
  paymentMethod: PaymentMethods;
  installments?: number;
  paymentId?: number;
  qrCode?: string;
  totalValue: number;
  originalValue: number;
  installmentsValue?: number;
  status?: string;
  expiresAt: string;
  isExpired: boolean;

  constructor(
    giftId: string,
    giftName: string,
    payerName: string,
    paymentMethod: PaymentMethods,
    totalValue: number,
    originalValue: number,
    installments?: number,
    installmentsValue?: number,
    paymentId?: number,
    qrCode?: string,
    status?: string
  ) {
    super();
    this.giftId = giftId;
    this.giftName = giftName;
    this.payerName = payerName;
    this.paymentMethod = paymentMethod;
    this.originalValue = originalValue;
    this.totalValue = totalValue;
    this.installments = installments;
    this.installmentsValue = installmentsValue;
    this.paymentId = paymentId;
    this.qrCode = qrCode;
    this.status = status;

    const expirationDate = new Date();
    expirationDate.setSeconds(expirationDate.getSeconds() + 30);
    this.expiresAt = expirationDate.toISOString();
    this.isExpired = false;
  }
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
  name: string;
  password: string;
}

export type GuestType = UserType & {
  confirmed: boolean;
  answered: boolean;
}

type Address = {
  street: string;
  number: number;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  country: string;
  zipCode: number;
}

type Payments = BaseType & {
  externalPaymentId: number;
  paymentMethod: PaymentMethods;
  giftId: string;
  totalValue: string;
  currency: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  payerId: string;
  description: string;
  cardDetails?: {
    cardHolderName: string;
    lastFourDigits: string;
    expiryDate: string; // MM/YY
  };
}

type Supplier = BaseType & {

  address: Address;
}
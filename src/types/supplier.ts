import { Address, BaseType, ContactType } from ".";

type ServiceType = {
  id: string;
  name: string;
  description: string;
  price: number;
  isAvailable: boolean;
  image?: string;
};

export class Supplier extends BaseType {
  name: string;
  contact: ContactType;
  serviceType?: string;
  description?: string;
  documentNumber: string;
  services?: ServiceType[];
  address: Address;
  rate?: number;
  enabled?: boolean = true;

  constructor(
    name: string,
    contact: ContactType,
    documentNumber: string,
    address: Address,
    services?: ServiceType[],
    serviceType?: string,
    description?: string,
    rate?: number,
  ) {
    super();
    this.name = name;
    this.contact = contact;
    this.documentNumber = documentNumber;
    this.address = address;
    this.services = services;
    this.serviceType = serviceType;
    this.description = description;
    this.rate = rate;
  }

  static fromFirestore(data: any): Supplier {
    const instance = new Supplier(
      data.name!,
      data.contact!,
      data.address!,
      data.documentNumber!,
      data.services!,
      data.serviceType!,
      data.description!,
      data.rate!,
    );

    instance.id = data.id;
    instance.createdAt = data.createdAt;

    return instance;
  }

  changeAvailability() {
    this.enabled = !this.enabled;
  }
}

export interface ICreateSupplierDto {
  name: string;
  contact: ContactType;
  documentNumber: string;
  address: Address;
  services?: ServiceType[];
  serviceType?: string;
  description?: string;
  rate?: number;
}

export interface IUpdateSupplierDto {
  name?: string;
  contact?: ContactType;
  documentNumber?: string;
  address?: Address;
  services?: ServiceType[];
  serviceType?: string;
  description?: string;
  rate?: number;
}
import { Address, BaseType, ContactType } from ".";

export class User extends BaseType {
  contact: ContactType;
  documentNumber: string;
  name: string;
  password: string;
  events: string[];
  
  constructor(
    name: string,
    password: string,
    contact: ContactType,
    documentNumber: string,
    events: string[] = []
  ) {
    super();
    this.name = name;
    this.password = password;
    this.contact = contact;
    this.documentNumber = documentNumber;
    this.events = events;
  }

  static fromFirestore(data: any): User {
    const instance = new User(
      data.name!,
      data.password!,
      data.contact!,
      data.documentNumber,
      data.events || []
    );

    instance.id = data.id;
    instance.createdAt = data.createdAt;

    return instance;
  }
}

export interface CreateUserDTO {
  name: string;
  password: string;
  contact: ContactType;
  documentNumber: string;
  events?: string[];
}

export interface UpdateUserDTO {
  name?: string;
  password?: string;
  contact?: ContactType;
  documentNumber?: string;
  events?: string[];
}

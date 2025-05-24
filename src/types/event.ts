import { Address, BaseType, GuestType } from ".";

export class Event extends BaseType {
  name: string;
  description?: string;
  startDate: Date;
  endDate?: Date;
  location: {
    name?: string;
    address?: Address;
    coordinates?: {
      latitude: string;
      longitude: string;
    }
  };
  type: 'wedding' | 'birthday' | 'corporate' | 'graduation' | 'show' | 'other';
  guests?: string[];
  menu?: string;
  giftList?: string;
  payments?: string[];
  suppliers?: string[];
  organizer?: string;
  maxCapacity?: number;
  rsvpRequired?: boolean;
  rsvpDeadline?: Date;
  notes?: string;
  status: 'planned' | 'ongoing' | 'completed' | 'cancelled';

  constructor(
    name: string,
    type: 'wedding' | 'birthday' | 'corporate' | 'graduation' | 'show' | 'other',
    startDate: Date,
    status: 'planned' | 'ongoing' | 'completed' | 'cancelled' = 'planned',
    description?: string,
    endDate?: Date,
    location?: { name?: string; address?: Address; coordinates?: { latitude: string; longitude: string } },
    guests?: string[],
    menu?: string,
    giftList?: string,
    payments?: string[],
    suppliers?: string[],
    organizer?: string,
    maxCapacity?: number,
    rsvpRequired?: boolean,
    rsvpDeadline?: Date,
    notes?: string,
  ) {
    super();
    this.name = name;
    this.type = type;
    this.startDate = startDate;
    this.status = status;
    this.description = description;
    this.endDate = endDate;
    this.location = location || {};
    this.guests = guests;
    this.menu = menu;
    this.giftList = giftList;
    this.payments = payments;
    this.suppliers = suppliers;
    this.organizer = organizer;
    this.maxCapacity = maxCapacity;
    this.rsvpRequired = rsvpRequired;
    this.rsvpDeadline = rsvpDeadline;
    this.notes = notes;
  }

  static fromFirestore(data: any): Event {
    const instance = new Event(
      data.name!,
      data.type!,
      new Date(data.startDate),
      data.status!,
      data.description,
      data.endDate ? new Date(data.endDate) : undefined,
      data.location,
      data.guests,
      data.menu,
      data.giftList,
      data.payments,
      data.suppliers,
      data.organizer,
      data.maxCapacity,
      data.rsvpRequired,
      data.rsvpDeadline ? new Date(data.rsvpDeadline) : undefined,
      data.notes
    );

    instance.id = data.id;
    instance.createdAt = data.createdAt;

    return instance;
  }
}

export interface CreateEventDTO {
  name: string;
  type: 'wedding' | 'birthday' | 'corporate' | 'graduation' | 'show' | 'other';
  startDate: Date;
  endDate?: Date;
  description?: string;
  location?: {
    name?: string;
    address?: Address;
    coordinates?: {
      latitude: string;
      longitude: string;
    }
  };
  guests?: string[];
  menu?: string;
  giftList?: string;
  payments?: string[];
  suppliers?: string[];
  organizer?: string;
  maxCapacity?: number;
  rsvpRequired?: boolean;
  rsvpDeadline?: Date;
  notes?: string;
  status?: 'planned' | 'ongoing' | 'completed' | 'cancelled';
}

export interface UpdateEventDTO {
  name?: string;
  type?: 'wedding' | 'birthday' | 'corporate' | 'graduation' | 'show' | 'other';
  startDate?: Date;
  endDate?: Date;
  description?: string;
  location?: {
    name?: string;
    address?: Address;
    coordinates?: {
      latitude: string;
      longitude: string;
    }
  };
  guests?: string[];
  menu?: string;
  giftList?: string;
  payments?: string[];
  suppliers?: string[];
  organizer?: string;
  maxCapacity?: number;
  rsvpRequired?: boolean;
  rsvpDeadline?: Date;
  notes?: string;
  status?: 'planned' | 'ongoing' | 'completed' | 'cancelled';
}

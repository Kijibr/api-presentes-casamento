import { BaseType } from ".";

export class MenuItem extends BaseType {
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable: boolean;
  
  constructor(
    name: string,
    description: string,
    price: number,
    category: string,
    isAvailable: boolean = true,
  ) {
    super();
    this.name = name;
    this.description = description;
    this.price = price;
    this.category = category;
    this.isAvailable = isAvailable;
  }
}

export interface CreateMenuItemDTO {
  name: string;
  description: string;
  price: number;
  category: string;
  isAvailable?: boolean;
}

export interface UpdateMenuItemDTO {
  name?: string;
  description?: string;
  price?: number;
  category?: string;
  isAvailable?: boolean;
} 
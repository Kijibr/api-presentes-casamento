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

  static fromFirestore(data: any): MenuItem {
    const instance = new MenuItem(
      data.name!,
      data.description!,
      data.price!,
      data.category!,
      data.isAvailable);

    instance.id = data.id;
    instance.createdAt = data.createdAt;

    return instance;
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
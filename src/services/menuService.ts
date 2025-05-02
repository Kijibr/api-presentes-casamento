import { MenuItem, CreateMenuItemDTO, UpdateMenuItemDTO } from '../types/menu';

class MenuService {
  private menuItems: MenuItem[] = [];

  async createMenuItem(data: CreateMenuItemDTO): Promise<MenuItem> {
    const newItem = new MenuItem(
      data.name,
      data.description,
      data.price,
      data.category,
      data.isAvailable
    );

    this.menuItems.push(newItem);
    return newItem;
  }

  async getMenuItems(): Promise<MenuItem[]> {
    return this.menuItems;
  }

  async getMenuItemById(id: string): Promise<MenuItem | null> {
    return this.menuItems.find(item => item.id === id) || null;
  }

  async updateMenuItem(id: string, data: UpdateMenuItemDTO): Promise<MenuItem | null> {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) return null;

    const item = this.menuItems[index];
    
    if (data.name) item.name = data.name;
    if (data.description) item.description = data.description;
    if (data.price) item.price = data.price;
    if (data.category) item.category = data.category;
    if (data.isAvailable !== undefined) item.isAvailable = data.isAvailable;

    item.updateItem!();
    return item;
  }

  async deleteMenuItem(id: string): Promise<boolean> {
    const index = this.menuItems.findIndex(item => item.id === id);
    if (index === -1) return false;

    this.menuItems.splice(index, 1);
    return true;
  }
}

export const menuService = new MenuService(); 
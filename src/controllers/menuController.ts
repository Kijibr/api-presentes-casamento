import { Request, Response } from 'express';
import { menuService } from '../services/menuService';
import { CreateMenuItemDTO, UpdateMenuItemDTO } from '../types/menu';

export class MenuController {
  async createMenuItem(req: Request, res: Response) {
    try {
      const data: CreateMenuItemDTO = req.body;
      
      if (!data.name || !data.description || !data.price || !data.category) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      if (data.price < 0) {
        return res.status(400).json({ error: 'O preço não pode ser negativo' });
      }

      const menuItem = await menuService.createMenuItem(data);
      return res.status(201).json(menuItem);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao criar item do cardápio' });
    }
  }

  async getMenuItems(req: Request, res: Response) {
    try {
      const menuItems = await menuService.getMenuItems();
      return res.json(menuItems);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar itens do cardápio' });
    }
  }

  async getMenuItemById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const menuItem = await menuService.getMenuItemById(id);

      if (!menuItem) {
        return res.status(404).json({ error: 'Item do cardápio não encontrado' });
      }

      return res.json(menuItem);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar item do cardápio' });
    }
  }

  async updateMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateMenuItemDTO = req.body;

      if (data.price !== undefined && data.price < 0) {
        return res.status(400).json({ error: 'O preço não pode ser negativo' });
      }

      const menuItem = await menuService.updateMenuItem(id, data);

      if (!menuItem) {
        return res.status(404).json({ error: 'Item do cardápio não encontrado' });
      }

      return res.json(menuItem);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar item do cardápio' });
    }
  }

  async deleteMenuItem(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await menuService.deleteMenuItem(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Item do cardápio não encontrado' });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao deletar item do cardápio' });
    }
  }
} 
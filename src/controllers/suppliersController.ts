import { Request, Response } from 'express';
import { ICreateSupplierDto } from '../types/supplier';
import { addNewSupplier, disableSupplierAsync, getSupplierById, getSuppliersList, updateSupplier } from '../services/suppliers';
import { LogError } from '../services/logger';
import { UpdateMenuItemDTO } from '../types/menu';

export class SuppliersController {
  async createSupplierItem(req: Request, res: Response) {
    const data: ICreateSupplierDto = req.body;

    try {
      if (!data.name || !data.documentNumber || !data.contact || !data.address) {
        return res.status(400).json({ error: 'Todos os campos obrigatórios devem ser preenchidos' });
      }

      if (data.documentNumber.length < 11) {
        return res.status(400).json({ error: 'O documento do fornecedor é inválido.' });
      }

      const menuItemId = await addNewSupplier(data);

      if (!menuItemId) {
        return res.status(400).json({ error: `Erro ao criar o novo fornecedor: ${data.name}` });
      }

      const menuItem = await getSupplierById(menuItemId);
      return res.status(201).json(menuItem);
    } catch (error) {
      LogError(`Erro ao criar o novo fornecedor ${data.name}: ${error}`);
      return res.status(500).json({ error: `Erro ao criar o novo fornecedor: ${data.name}` });
    }
  }

  async getSuppliers(req: Request, res: Response) {
    try {
      const suppliers = await getSuppliersList();
      return res.json(suppliers);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar lista de fornecedores.' });
    }
  }

  async getSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const menuItem = await getSupplierById(id);

      if (!menuItem) {
        return res.status(404).json({ error: 'Fornecedor não encontrado' });
      }

      return res.json(menuItem);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao buscar fornecedor' });
    }
  }

  async updateSupplierInfo(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const data: UpdateMenuItemDTO = req.body;

      if (data.price !== undefined && data.price < 0) {
        return res.status(400).json({ error: 'O preço não pode ser negativo' });
      }

      const updated = await updateSupplier(id, data);

      if (!updated) {
        return res.status(404).json({ error: 'Item do cardápio não encontrado' });
      }

      const menuItem = await getSupplierById(id);
      return res.json(menuItem);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao atualizar item do cardápio' });
    }
  }

  async disableSupplier(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const deleted = await disableSupplierAsync(id);

      if (!deleted) {
        return res.status(404).json({ error: 'Fornecedor não encontrado.' });
      }

      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao desabilitar fornecedor.' });
    }
  }
} 
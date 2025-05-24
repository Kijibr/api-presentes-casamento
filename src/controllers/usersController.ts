import { Request, Response } from 'express';
import { CreateUserDTO, UpdateUserDTO } from '../types/user';
import * as UserService from '../services/users/usersService';

export async function createUser(req: Request, res: Response) {
  try {
    const userData: CreateUserDTO = req.body;
    const userId = await UserService.createUser(userData);

    if (!userId) {
      return res.status(400).json({ error: 'Error creating user' });
    }

    return res.status(201).json({ id: userId });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getAllUsers(req: Request, res: Response) {
  try {
    const users = await UserService.getAllUsers();
    return res.status(200).json(users);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function getUserById(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await UserService.getUserById(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json(user);
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function updateUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userData: UpdateUserDTO = req.body;

    const updatedUserId = await UserService.updateUser(id, userData);

    if (!updatedUserId) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(200).json({ id: updatedUserId });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

export async function deleteUser(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const deleted = await UserService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.status(204).send();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
}

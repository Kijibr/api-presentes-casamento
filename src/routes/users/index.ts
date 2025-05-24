import { Router } from 'express';
import * as UsersController from '../../controllers/usersController';

const router = Router();

router.post('/add', UsersController.createUser);
router.get('/list', UsersController.getAllUsers);
router.get('/getById/:id', UsersController.getUserById);
router.put('/update/:id', UsersController.updateUser);
router.delete('/disable/:id', UsersController.deleteUser);

export default router;

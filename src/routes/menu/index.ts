import { Router } from 'express';
import { MenuController } from '../../controllers/menuController';

const router = Router();
const menuController = new MenuController();

router.post('/add', menuController.createMenuItem);
router.get('/list', menuController.getMenuItems);
router.get('/getById/:id', menuController.getMenuItemById);
router.put('/update/:id', menuController.updateMenuItem);
router.delete('/remove/:id', menuController.deleteMenuItem);

export default router; 
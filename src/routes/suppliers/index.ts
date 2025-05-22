import { SuppliersController } from '../../controllers/suppliersController';
import { Router } from 'express';

const router = Router();
const suppliersController = new SuppliersController();

router.post('/add', suppliersController.createSupplierItem);
router.get('/list', suppliersController.getSuppliers);
router.get('/getById/:id', suppliersController.getSupplier);
router.put('/update/:id', suppliersController.updateSupplierInfo);
router.patch('/disable/:id', suppliersController.disableSupplier);

export default router; 
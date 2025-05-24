import { Router } from 'express';
import * as EventsController from '../../controllers/eventsController';

const router = Router();

router.post('/add', EventsController.createEvent);
router.get('/list', EventsController.getAllEvents);
router.get('/getById/:id', EventsController.getEventById);
router.put('/update/:id', EventsController.updateEvent);
router.delete('/delete/:id', EventsController.deleteEvent);

export default router;

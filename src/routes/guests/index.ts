import { Request, Response, Router } from "express";
import { getGuest, markResponseAsync } from "../../services/guests";

const router = Router();

router.get('/:id', async (req: Request, res: Response) => {
  const guestId = req.params.id;
  const guestDetails = await getGuest(guestId);

  if (!guestDetails) {
    return res.status(404).send();
  }

  return res.json({
    id: guestDetails.id,
    confirmed: guestDetails.confirmed,
    answered: guestDetails.answered,
    name: guestDetails.name
  });
});

router.patch('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;

  const { confirmed, password } = req.body;
  const guestDetails = await markResponseAsync(id, password, confirmed);

  if (!guestDetails) {
    res.status(404).send();
    return; 
  }

  res.status(204).send();
  return; 
});

export default router;
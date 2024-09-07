import { Request, Response, Router } from "express";
import { getGuest } from "../../services/guests";

const router = Router();

router.get('/:id', async(req: Request, res: Response) => {
  const guestId = req.params.id;
  const guestDetails = await getGuest(guestId);
  
  if (!guestDetails){
    return res.status(404);
  }

  return res.json(guestDetails);
});

export default router;
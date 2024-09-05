import { Request, Response, Router } from "express";
import { getAllgifts } from "../../services/gifts";

const router = Router();

router.get("/list", async(req: Request, res: Response) =>{
  try {
    const giftsList = await getAllgifts();
    return res.send(giftsList);
  } catch (error) {
    res.json(error);
  }
});

export default router;
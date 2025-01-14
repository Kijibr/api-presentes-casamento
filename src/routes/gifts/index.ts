import { Request, Response, Router } from "express";
import { addGifts, addGiftsToCache, getAllgifts } from "../../controllers/giftsController";
import { GiftType } from "../../types";

const router = Router();

router.get("/list", async (req: Request, res: Response) => {
  try {
    const giftsList = await getAllgifts();
    return res.send(giftsList);
  } catch (error) {
    res.json(error);
  }
});

router.get("/updateGiftsList", async (req: Request, res: Response) => {
  try {
    await addGiftsToCache();
    return res.send(204);
  } catch (error) {
    res.json(error);
  }
});

router.post("/add", async (req: Request, res: Response) => {
  try {
    const giftPayload = req.body as GiftType;
    const newGift = await addGifts(giftPayload);
    if (newGift) {
      return res.send(201);
    }
  } catch (error) {
    res.json(error);
  }
});

export default router;
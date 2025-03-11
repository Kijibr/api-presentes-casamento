import { Request, Response, Router } from "express";
import { addGiftsAsync, addGiftsToCache, getAllgiftsAsync, removeGiftsAsync, updateGiftsAsync } from "../../controllers/giftsController";
import { GiftModel } from "../../types";

const router = Router();

router.get("/list", async (req: Request, res: Response) => {
  try {
    const giftsList = await getAllgiftsAsync();
    return res.send(giftsList);
  } catch (error) {
    res.json(error);
  }
});

router.get("/updateGiftsList", async (req: Request, res: Response) => {
  try {
    await addGiftsToCache();
    return res.sendStatus(204);
  } catch (error) {
    res.json(error);
  }
});

router.post("/add", async (req: Request, res: Response) => {
  try {
    const { name, price, giverId, eventId, image, fileName, availability } = req.body;

    const giftPayload = new GiftModel(
      name,
      price,
      giverId,
      eventId,
      image,
      availability
    );

    const newGift = await addGiftsAsync(giftPayload, fileName);
    if (newGift) {
      return res.status(201).send({ id: giftPayload.id });
    }
  } catch (error) {
    res.json(error);
  }
});

router.patch("/update", async (req: Request, res: Response) => {
  try {
    const { name, price, giverId, eventId, image, fileName, availability } = req.body;

    const giftPayload = new GiftModel(
      name,
      price,
      giverId,
      eventId,
      image,
      availability
    );
    const newGift = await updateGiftsAsync(giftPayload, fileName);
    if (newGift) {
      return res.sendStatus(204);
    }
  } catch (error) {
    res.json(error);
  }
});

router.delete("/remove", async (req: Request, res: Response) => {
  try {
    const giftId = req.params.giftId;
    await removeGiftsAsync(giftId);
    return res.sendStatus(204);
  } catch (error) {
    res.json(error);
  }
})
export default router;
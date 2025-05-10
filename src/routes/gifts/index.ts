import { Request, Response, Router } from "express";
import { addGiftsAsync, addGiftsToCache, getAllgiftsAsync, removeGiftsAsync, updateGiftsAsync } from "../../controllers/giftsController";
import { GiftModel } from "../../types";
import { LogError } from "../../services/logger";
import { uploadMiddleware } from "../../middlewares/files";

const router = Router();


router.get("/list", async (req: Request, res: Response) => {
  try {
    const giftsList = await getAllgiftsAsync();
    return res.json(giftsList);
  } catch (error) {
    LogError(`Error getting gifts list: ${error}`);
    return res.status(500).json({ error: "Error fetching gifts" });
  }
});

router.get("/updateGiftsList", async (req: Request, res: Response) => {
  try {
    await addGiftsToCache();
    return res.sendStatus(204);
  } catch (error) {
    LogError(`Error updating gifts list: ${error}`);
    return res.status(500).json({ error: "Error updating gifts list" });
  }
});

router.post("/add", uploadMiddleware, async (req: Request, res: Response) => {
  try {
    const giftData = JSON.parse(req.body.gift);
    const gift = new GiftModel(
      giftData.name,
      giftData.price,
      giftData.giverId,
      giftData.eventId,
      giftData.image,
      giftData.availability
    );

    const fileName = req.file?.originalname || '';
    const newGiftId = await addGiftsAsync(gift, fileName);
    if (!newGiftId) {
      return res.status(500).json({ error: "Error creating gift" });
    }

    return res.status(201).json({ id: newGiftId });
  } catch (error) {
    LogError(`Error creating gift: ${error}`);
    return res.status(500).json({ error: "Error creating gift" });
  }
});

router.patch("/update/:giftId", uploadMiddleware, async (req: Request, res: Response) => {
  try {
    const { name, price, giverId, eventId, image, fileName, availability, id } = req.body;

    if (!id || !name || !price || !eventId) {
      return res.status(400).json({ error: "Required fields not provided" });
    }

    const giftPayload = new GiftModel(
      name,
      price,
      giverId,
      eventId,
      image,
      availability
    );
    const { giftId } = req.params;
    giftPayload.id = giftId;

    const updated = await updateGiftsAsync(giftPayload, fileName);
    if (!updated) {
      return res.status(404).json({ error: "Gift not found" });
    }

    return res.sendStatus(204);
  } catch (error) {
    LogError(`Error updating gift: ${error}`);
    return res.status(500).json({ error: "Error updating gift" });
  }
});

router.delete("/remove/:giftId", async (req: Request, res: Response) => {
  try {
    const { giftId } = req.params;
    if (!giftId) {
      return res.status(400).json({ error: "Gift ID not provided" });
    }

    const removed = await removeGiftsAsync(giftId);
    if (!removed) {
      return res.status(404).json({ error: "Gift not found" });
    }

    return res.sendStatus(204);
  } catch (error) {
    LogError(`Error removing gift: ${error}`);
    return res.status(500).json({ error: "Error removing gift" });
  }
});

export default router;
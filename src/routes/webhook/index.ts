import { Request, Response, Router } from "express";
import { LogInformation } from "../../services/logger";

const router = Router();

/* GET home page. */
router.get('/', async (req: Request, res: Response) => {
  LogInformation("GET v1 REQ.body WEBHOOK")
  LogInformation(req.body)

  res.send("GET v1 OK");
});

router.post('/', async (req: Request, res: Response) => {
  LogInformation("POST V1 REQ.body WEBHOOK")
  LogInformation(req.body)
  res.send("POST v1 OK");
});

export default router;
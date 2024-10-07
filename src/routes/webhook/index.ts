import { Request, Response, Router } from "express";

const router = Router();

/* GET home page. */
router.get('/', async (req: Request, res: Response) => {
  console.log("GET v1 REQ.body WEBHOOK")
  console.log(req.body)

  res.send("GET v1 OK");
});

router.post('/', async (req: Request, res: Response) => {
  console.log("POST V1 REQ.body WEBHOOK")
  console.log(req.body)
  res.send("POST v1 OK");
});

export default router;
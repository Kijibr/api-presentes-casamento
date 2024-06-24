import { Request, Response, Router } from "express";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { randomUUID } from 'crypto';

const router = Router();

router.get('/', (req: Request, res: Response) => res.send('api casamento is running, ok!'));

router.post('/pix-payment', (req: Request, res: Response, next) => {

const mpAccessToken = process.env.MP_ACCESS_TOKEN || "";
const client = new MercadoPagoConfig({ 
  accessToken: mpAccessToken,
  options: {
    timeout: 5000,
    idempotencyKey: randomUUID()
  }
});

const payment = new Payment(client);
  const {
    transaction_amount, 
    description,
    email,
    identificationType,
    payerName,
    number  
  } = req.body;

  const body = {
    transaction_amount,
    description,
    payment_method_id: "pix",
    payer: {
      email,
      first_name: payerName,
    },
  };

  const requestOptions = { idempotencyKey: randomUUID() };

  payment.create({body, requestOptions})
  .then((response) => {
    res.send(response);
  })
  .catch((error) => {
    res.status(500).json({ error: error.message });
  });
});

export default router;

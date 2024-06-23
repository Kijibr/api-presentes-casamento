import { Request, Response, Router } from "express";

import { MercadoPagoConfig, Payment } from 'mercadopago';

const router = Router();

router.get('/', (req: Request, res: Response) => res.send('api casamento is running, ok!'));

router.post('/pix-payment', (req: Request, res: Response, next) => {

const mpAccessToken = process.env.MP_ACCESS_TOKEN || "";
const client = new MercadoPagoConfig({ 
  accessToken: mpAccessToken,
  options: {
    timeout: 30000,
    idempotencyKey: 'abc'
  }
});

const payment = new Payment(client);
  const {
    transaction_amount, 
    description,
    email,
    identificationType,
    number  
  } = req.body;

  const body = {
    transaction_amount,
    description,
    payment_method_id: "pix",
    payer: {
      email,
      identification: {
        type: identificationType,
        number,
      }
    },
  };

  const requestOptions = { idempotencyKey: '<IDEMPOTENCY_KEY>' };

  payment.create({body, requestOptions})
  .then((response) => {
    console.log("response payment: ", response)
    res.send(response);
  })
  .catch((error) => {
    console.log("error payment: ", error)
    res.status(500).json({ error: error.message });
  });
});

export default router;

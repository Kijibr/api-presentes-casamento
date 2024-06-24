import { Request, Response, Router } from "express";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { randomUUID } from 'crypto';

const router = Router();

router.post('/pix', (req: Request, res: Response, next) => {

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
      identification: {
        type: identificationType,
        number,
      }
    },
  };
  
  const { environment, payment } = getPaymentCredentials();
  const idempotencyKey = environment === "prd" ? randomUUID() : '<IDEMPOTENCY_KEY>'
  const requestOptions = { idempotencyKey: idempotencyKey };

  payment.create({body, requestOptions})
  .then((response) => {
    res.send(response);
  })
  .catch((error) => {
    res.status(500).json(error);
  });
});

router.get('/:id', (req: Request, res: Response) => {
  const { environment, payment } = getPaymentCredentials();
  const paymentId = req.params.id;
      console.log("response payment: ", environment)
  payment.get({
    id: paymentId
  }).then((response) => {
    console.log("response payment: ", response)
    res.send(response);
  })
  .catch((error) => {
    console.log("error payment: ", error)
    res.status(500).json(error);
  });
});
export default router;

function getPaymentCredentials() {
  const environment = process.env.ENVIRONMENT;
  const mpAccessToken = (environment === "prd" ? process.env.MP_ACCESS_TOKEN : process.env.MP_ACCESS_TOKEN_DEV) ?? "";
  const client = new MercadoPagoConfig({
    accessToken: mpAccessToken,
    options: {
      timeout: 5000,
      idempotencyKey: 'abc'
    }
  });

  const payment = new Payment(client);
  return { environment, payment };
}
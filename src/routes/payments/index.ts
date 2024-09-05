import { Request, Response, Router } from "express";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { randomUUID } from 'crypto';

const router = Router();

router.post('/pix', async (req: Request, res: Response, next) => {
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
    res.send({
      id: result.id,
      qr_code: result.point_of_interaction.transaction_data.qr_code
    });
  })
  .catch((error) => {
    res.status(500).json(error);
  });
});

router.post('/add/payers', async (req: Request, res: Response, next) => {
   
  const {
    giftId,
    giftName,
    transaction_amount, 
    description,
    email,
    identificationType,
    payerName,
    number  
  } = req.body;
  
  const newPayment = await addNewPayer({
      giftId,
      giftName,
      name: payerName,
      paymentId: result.id,
      value: transaction_amount
    })

    res.send({
      id: newPayment,
      gift: description,
      qr_code: result.point_of_interaction.transaction_data.qr_code
    });

});

router.get('/:id', async(req: Request, res: Response) => {
  const payment = getPaymentCredentials().payment;
  
  const paymentId = req.params.id;
  const payerDetails = await getPayment(paymentId);
  
  if (payerDetails === null){
    return res.status(404);
  }

  if (payerDetails?.paymentId){
    payment.get({
      id: payerDetails?.paymentId
    }).then((response) => { 
      res.send(response.status);
    })
    .catch((error) => {
      console.log("error payment: ", error)
      res.status(500).json(error);
    });
  }
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
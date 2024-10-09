import { Request, Response, Router } from "express";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { randomUUID } from 'crypto';
import { addNewPayer, getPayment } from "../../services/payments";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";

const router = Router();

router.post('/pix', async (req: Request, res: Response, next) => {
  const {
    giftId,
    giftName,
    transaction_amount,
    description,
    email,
    payerName
  } = req.body;

  const body: PaymentCreateRequest = {
    transaction_amount,
    description,
    payment_method_id: "pix",
    payer: {
      email,
      first_name: payerName
    }, 
    notification_url: "https://api-presentes-casamento.vercel.app/webhook"
  };

  const { environment, payment } = getPaymentCredentials();
  const idempotencyKey = environment === "prd" ? randomUUID() : '<IDEMPOTENCY_KEY>'
  const requestOptions = { idempotencyKey: idempotencyKey };

  payment.create({ body, requestOptions })
    .then((response: PaymentResponse) => {
      addNewPayer({
        giftId,
        giftName,
        name: payerName,
        paymentId: response.id,
        value: transaction_amount
      }).then((payerResponse: string) => {
        res.send({
          id: payerResponse,
          qr_code: response?.point_of_interaction?.transaction_data?.qr_code
        });
      }).catch((err) => res.status(400).json(
        `Error to generate new payment ${giftId} - ${payerName}`
      )).catch((error) => {
        res.status(500).json(error);
      });
    });
});

router.get('/:id', async (req: Request, res: Response) => {
  const payment = getPaymentCredentials().payment;

  const paymentId = req.params.id;
  const payerDetails = await getPayment(paymentId);

  if (payerDetails === null) {
    return res.status(404).send();
  }

  if (payerDetails?.paymentId) {
    payment.get({
      id: payerDetails?.paymentId
    }).then((response: PaymentResponse) => {
      res.json(response.status);
    }).catch((error) => {
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
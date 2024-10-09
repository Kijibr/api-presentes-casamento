import { Request, Response, Router } from "express";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { randomUUID } from 'crypto';
import { addNewPayer, getPayment } from "../../services/payments";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";

const router = Router();
const paymentWebHook = "https://api-presentes-casamento.vercel.app/webhook";

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
    notification_url: paymentWebHook
  };

  const { environment, payment } = getPaymentCredentials();
  const idempotencyKey = environment === "prd" ? randomUUID() : '<IDEMPOTENCY_KEY>'
  const requestOptions = { idempotencyKey: idempotencyKey };
  const createPayment: PaymentResponse = await payment.create({ body, requestOptions });
  if (createPayment) {
    console.log("informacoes: ", createPayment)
    const newPayer = await addNewPayer({
      giftId,
      giftName,
      name: payerName,
      paymentId: createPayment.id,
      value: transaction_amount
    });
    if (newPayer)
      return res.send({
        id: newPayer,
        qr_code: createPayment?.point_of_interaction?.transaction_data?.qr_code
      });
  };

  return res.status(400).json(
    `Error to generate new payment ${giftId} - ${payerName}`);
})

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
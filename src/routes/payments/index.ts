import { Request, Response, Router } from "express";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { randomUUID } from 'crypto';
import { addNewPayer, getPayment } from "../../services/payments";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";
import { PaymentMethods } from "../../types";

require('dotenv').config();

// const { environment, payment } = getPaymentCredentials();
const router = Router();
const paymentWebHook = "https://api-presentes-casamento.vercel.app/webhook";

router.post('/pix', async (req: Request, res: Response, next) => {
  const {
    giftId,
    giftName,
    transaction_amount,
    description,
    email = process.env.DEFAULT_EMAIL,
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
    const newPayer = await addNewPayer({
      giftId,
      giftName,
      name: payerName,
      paymentId: createPayment.id,
      paymentMethod: PaymentMethods.Pix,
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
});

router.post('/creditCard/process', async (req: Request, res: Response, next) => {
  const {
    giftId,
    giftName,
    transaction_amount,
    description,
    installments,
    token,
    payment_method_id,
    issuer_id,
    email = process.env.DEFAULT_EMAIL,
    payer,
    payerName
  } = req.body;

  const { environment, payment } = getPaymentCredentials();

  const idempotencyKey = environment === "prd" ? randomUUID() : randomUUID();
  const requestOptions = { idempotencyKey };

  const splittedName = payerName?.split(" ");

  const body: PaymentCreateRequest = {
    additional_info: {
      items: [
        {
          id: giftId,
          title: giftName,
          quantity: 1,
          unit_price: transaction_amount,
          description: description,
          category_id: giftId
        }
      ],
      payer: {
        first_name: splittedName[0]!,
        last_name: splittedName[1]!
      }
    },
    transaction_amount,
    token: token,
    description: description,
    installments: installments,
    payment_method_id: payment_method_id,
    issuer_id: issuer_id,
    payer: {
      entity_type: "individual",
      first_name: splittedName[0]!,
      last_name: splittedName[1]!,
      email: email,
      identification: payer.identification
    },
    statement_descriptor: "MERCADO_PAGO",
    external_reference: giftId,
    binary_mode: false,
    notification_url: `${process.env.API_URI}/webhook`
  }

  payment.create({ body, requestOptions })
    .then(async (result: PaymentResponse) => {
      console.log(result, JSON.stringify(result.card));
      const newPayer = await addNewPayer({
        giftId,
        giftName,
        name: payerName,
        paymentId: result.id,
        paymentMethod: PaymentMethods.Pix,
        value: transaction_amount
      });
      return res.status(200).json({
        id: newPayer,
        status: result.status
      });

    })
    .catch((error) => {
      console.log(`Error to generate the credit card payment: ${giftId} - ${JSON.stringify(error)}`);
      return res.status(400).json(
        `Error to generate new payment ${giftId} - ${payerName}`);
    });
});

router.get('/:id', async (req: Request, res: Response) => {
  const { payment } = getPaymentCredentials();

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
      console.log("error to find payment: ", error)
      res.status(400).json(error);
    });
  }
});
export default router;

function getPaymentCredentials() {
  const environment = process.env.ENVIRONMENT;
  const mpAccessToken = environment === "prd" ? process.env.MP_ACCESS_TOKEN : process.env.MP_ACCESS_TOKEN_DEV;
  const client = new MercadoPagoConfig({
    accessToken: mpAccessToken!,
    options: {
      timeout: 5000,
      idempotencyKey: 'abc'
    }
  });

  const payment = new Payment(client);
  return { environment, payment };
}
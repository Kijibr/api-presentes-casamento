import { Request, Response, Router } from "express";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { randomUUID } from 'crypto';
import { addNewPayment, getPayment, updatePaymentStatus } from "../../services/payments";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";
import { PaymentMethods, PaymentModel } from "../../types";
import { appConfig } from "../../config/keys";

// const { environment, payment } = getPaymentCredentials();
const router = Router();
const paymentWebHook = "https://api-presentes-casamento.vercel.app/webhook";

router.post('/pix', async (req: Request, res: Response, next) => {
  const {
    giftId,
    giftName,
    transaction_amount,
    description,
    email = appConfig.defaultEmail,
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
    const qrCode = createPayment?.point_of_interaction?.transaction_data?.qr_code_base64!;
    const newPayer = await addNewPayment(new PaymentModel(
      giftId,
      giftName,
      payerName,
      PaymentMethods.Pix,
      parseFloat(transaction_amount.toString()),
      parseFloat(transaction_amount.toString()),
      undefined,
      undefined,
      createPayment.id,
      qrCode,
      createPayment.status
    ));

    if (newPayer)
      return res.send({
        id: newPayer,
        qr_code: qrCode
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
    email = appConfig.defaultEmail,
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
    notification_url: `${appConfig.appUrl}/webhook`
  }

  payment.create({ body, requestOptions })
    .then(async (result: PaymentResponse) => {
      console.log(result, JSON.stringify(result.card));
      const newPayer = await addNewPayment(new PaymentModel(
        giftId,
        giftName,
        payerName,
        PaymentMethods.CreditCard,
        result.transaction_details?.total_paid_amount!,
        transaction_amount,
        installments,
        result.transaction_details?.installment_amount!,
        result.id,
        undefined,
        result.status
      ));

      return res.status(200).json({
        id: result.id,
        status: result.status,
        success: result.status === "approved"
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
  const paymentDetails = await getPayment(paymentId);
  if (paymentDetails === null) {
    return res.status(404).send();
  }

  if (paymentDetails?.paymentId) {
    payment.get({
      id: paymentDetails?.paymentId
    }).then((response: PaymentResponse) => {
      if (paymentDetails.status !== response.status)
        updatePaymentStatus(paymentDetails?.paymentId?.toString()!, response.status!);

      res.json(response.status);
    }).catch((error) => {
      console.log("error to find payment: ", error)
      res.status(400).json(error);
    });
  }
});
export default router;

function getPaymentCredentials() {
  const environment = appConfig.environment;
  const mpAccessToken = environment === "prd" ? appConfig.mercadoPagoAccessToken : appConfig.mercadoPagoAccessTokenDev;
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
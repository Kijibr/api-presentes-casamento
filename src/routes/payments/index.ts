import { Request, Response, Router } from "express";

import { MercadoPagoConfig, Payment } from 'mercadopago';
import { randomUUID } from 'crypto';
import { addNewPayment, getPayment, updatePaymentStatus } from "../../services/payments";
import { PaymentResponse } from "mercadopago/dist/clients/payment/commonTypes";
import { PaymentCreateRequest } from "mercadopago/dist/clients/payment/create/types";
import { PaymentMethods, PaymentModel } from "../../types";
import { appConfig } from "../../config/keys";
import { LogError } from "../../services/logger";
import { getRemainingTime, formatRemainingTime } from "../../services/payments/expiration";

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

router.post('/creditCard/process', async (req: Request, res: Response) => {
  try {
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

    const result: PaymentResponse = await payment.create({ body, requestOptions });
    
    const paymentObject = new PaymentModel(
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
    );

    const newPaymentId = await addNewPayment(paymentObject);
    const remainingTime = getRemainingTime(paymentObject);
    const remainingTimeFormatted = formatRemainingTime(remainingTime);

    return res.status(200).json({
      id: newPaymentId,
      status: result.status,
      success: result.status === "approved",
      expiresAt: paymentObject.expiresAt,
      remainingTime,
      remainingTimeFormatted
    });
  } catch (error) {
    LogError(`Error processing credit card payment: ${error}`);
    return res.status(500).json({ error: "Error processing payment" });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const paymentId = req.params.id;
    const paymentDetails = await getPayment(paymentId);

    if (!paymentDetails) {
      return res.status(404).json({ error: "Payment not found" });
    }

    if (paymentDetails.isExpired) {
      return res.status(400).json({
        error: "Payment has expired",
        remainingTime: 0,
        remainingTimeFormatted: "Expired"
      });
    }

    const remainingTime = getRemainingTime(paymentDetails);
    const remainingTimeFormatted = formatRemainingTime(remainingTime);

    return res.json({
      ...paymentDetails,
      remainingTime,
      remainingTimeFormatted
    });
  } catch (error) {
    LogError(`Error getting payment details: ${error}`);
    return res.status(500).json({ error: "Error fetching payment details" });
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
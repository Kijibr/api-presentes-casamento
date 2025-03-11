import dotenv from 'dotenv';

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

export const appConfig = {
  appPort: process.env.API_PORT,
  appUrl: process.env.VITE_APP_URL,
  fbAuthDomain: process.env.FB_AUTH_DOMAIN,
  fbProjectId: process.env.FB_PROJECT_ID,
  fbApiKey: process.env.FB_API_KEY,
  storageBucket: process.env.FB_STORAGE_BUCKET,
  fbMessagingSenderId: process.env.FB_MESSAGING_SENDER_ID,
  fbAppId: process.env.FB_APP_ID,
  fbMeasurementId: process.env.FB_MEASUREMENT_ID,

  defaultEmail: process.env.DEFAULT_EMAIL,
  environment: process.env.ENVIRONMENT,

  mercadoPagoAccessToken: process.env.MP_ACCESS_TOKEN,
  mercadoPagoAccessTokenDev: process.env.MP_ACCESS_TOKEN_DEV,

};

// Verifica se as variáveis de ambiente estão definidas
if (!appConfig.fbApiKey || !appConfig.storageBucket || !appConfig.fbMessagingSenderId || !appConfig.fbAppId || !appConfig.fbMeasurementId) {
  throw new Error("As variáveis de ambiente da base de dados não estão definidas.");
} 
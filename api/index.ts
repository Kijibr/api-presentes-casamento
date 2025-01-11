import express, { Request, Response } from "express";
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentsRouter from '../src/routes/payments';
import giftsRouter from '../src/routes/gifts';
import guestsRouter from '../src/routes/guests';
import webHookRouter from '../src/routes/webhook';
import { authMiddleware } from "./middlewares/auth";
import { LogInformation } from "../src/services/logger";

dotenv.config();
const app = express();

const PORT = process.env.API_PORT || '5005';
app.use(cors({
  origin: process.env.VITE_APP_URL
}));

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => res.send('api casamento is running, ok!'));
app.use('/payment', authMiddleware, paymentsRouter);
app.use('/gifts', authMiddleware, giftsRouter);
app.use('/guests', authMiddleware, guestsRouter);
app.use('/webhook', webHookRouter);

app.listen(PORT, () => {
  LogInformation("Server running at PORT: " + PORT);
}).on("error", (error) => {
  throw new Error(error.message);
});

export default app;

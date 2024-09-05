import express, { Request, Response } from "express";
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentsRouter from '../src/routes/payments';
import giftsRouter from '../src/routes/gifts';

dotenv.config();
const app = express();

const PORT = process.env.API_PORT || '5005';
app.use(cors());

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/', (req: Request, res: Response) => res.send('api casamento is running, ok!'));
app.use('/payment', paymentsRouter);
app.use('/gifts', giftsRouter);

app.listen(PORT, () => { 
  console.log("Server running at PORT: ", PORT); 
}).on("error", (error) => {
  throw new Error(error.message);
});

export default app;

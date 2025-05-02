import express, { Request, Response } from "express";
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { LogInformation } from "../src/services/logger";
import { appConfig } from "../src/config/keys";
import routes from "../src/routes";

const app = express();

const PORT = appConfig.appPort || '5005';
app.use(cors({
  origin: appConfig.appUrl
}));

app.use(express.json({
  limit: '10mb'
}));
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req: Request, res: Response, next: Function) => {
  LogInformation(`Request: ${req.method} ${req.url}`);
  next();
});

app.get('/', (req: Request, res: Response) => res.send('api casamento is running, ok!'));

app.use('/api', routes);

app.listen(PORT, () => {
  LogInformation("Server running at PORT: " + PORT);
}).on("error", (error) => {
  throw new Error(error.message);
});

export default app;

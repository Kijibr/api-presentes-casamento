import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { LogInformation } from '../src/services/logger';
import { appConfig } from '../src/config/keys';
import routes from '../src/routes';
import serverless from 'serverless-http';

const app = express();
const PORT = appConfig.appPort || 5005;

app.use(cors({ origin: appConfig.appUrl }));
app.use(express.json({ limit: '10mb' }));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req: Request, res: Response, next) => {
  LogInformation(`Request: ${req.method} ${req.url}`);
  next();
});

app.get('/', (req: Request, res: Response) => {
  res.send('API casamento is running, ok!');
});

app.use('/api', routes);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    LogInformation(`Server running at http://localhost:${PORT}`);
  });
}

// ✅ Exportar sempre fora de qualquer bloco condicional
export const handler = serverless(app);

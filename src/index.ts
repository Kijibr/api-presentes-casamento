import express, { Request, Response } from 'express';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import cors from 'cors';
import { LogInformation } from './services/logger';
import { appConfig } from './config/keys';
import routes from './routes';

const app = express();
const PORT = appConfig.appPort || 5005;

// Configurações do CORS
app.use(cors({
  origin: appConfig.appUrl,
}));

// Configurações de middleware
app.use(express.json({ limit: '10mb' }));
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Logger para cada requisição
app.use((req: Request, res: Response, next: Function) => {
  LogInformation(`Request: ${req.method} ${req.url}`);
  next();
});

// Rota de teste
app.get('/', (req: Request, res: Response) => {
  res.send('API casamento is running, ok!');
});

// Rotas da API
app.use('/api', routes);

// Exportando o handler para uso com serverless-http (para Vercel)
if (process.env.NODE_ENV !== 'production') {  // Quando rodar localmente, usamos o Express normalmente
  app.listen(PORT, () => {
    LogInformation(`Server running at http://localhost:${PORT}`);
  });
}

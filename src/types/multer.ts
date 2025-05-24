import { Request } from 'express';

declare module 'multer' {
  export interface MulterRequest extends Request {
    file?: Express.Multer.File;
  }
}

declare module 'express' {
  interface Request {
    file?: Express.Multer.File;
  }
} 
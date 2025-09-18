import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class TimingMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();

    const originalRender = res.render.bind(res);
    res.render = function(view: string, locals?: any, callback?: any) {
      const elapsed = Date.now() - startTime;

      console.log(`Timing Middleware: ${req.method} ${req.url} - ${elapsed}ms`);

      const extendedLocals = {
        ...locals,
        serverElapsedTime: elapsed,
      };

      console.log('Передаем в шаблон serverElapsedTime:', elapsed);
      console.log('Все данные для шаблона:', Object.keys(extendedLocals));

      return originalRender(view, extendedLocals, callback);
    };

    next();
  }
}
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';

@Injectable()
export class TimingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        const elapsed = Date.now() - startTime;

        console.log(
          `${request.method} ${request.url} - ${elapsed}ms`
        );

        const isApiRequest =
          request.url.startsWith('/api') ||
          request.url.startsWith('/graphql') ||
          request.accepts('application/json');

        const isPageRender =
          !isApiRequest &&
          (request.accepts('text/html') ||
            request.headers.accept?.includes('text/html'));

        if (isApiRequest) {
          response.setHeader('X-Elapsed-Time', `${elapsed}ms`);
        } else if (isPageRender) {
          if (response.locals) {
            response.locals.serverElapsedTime = elapsed;
            console.log("✅ ServerElapsedTime установлено:", elapsed);
            console.log("✅ response.locals:", response.locals);
          } else {
            console.log("❌ response.locals не существует!");
          }
        }
      }),
    );
  }
}
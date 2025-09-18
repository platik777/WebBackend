import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

@Injectable()
export class ETagInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const isApiRequest = request.url.startsWith('/api');

    if (!isApiRequest) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((data) => {
        if (data && typeof data === 'object') {
          const contentHash = crypto
            .createHash('md5')
            .update(JSON.stringify(data))
            .digest('hex');

          const etag = `"${contentHash}"`;

          response.setHeader('ETag', etag);

          const ifNoneMatch = request.headers['if-none-match'];

          if (ifNoneMatch && ifNoneMatch === etag) {
            response.status(304);
            response.end();
            return;
          }
        }
      }),
    );
  }
}
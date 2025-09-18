import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Reflector } from '@nestjs/core';
import { Response } from 'express';
import { CACHE_CONTROL_KEY } from '../decorators/cache-control.decorator';

@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  constructor(private reflector: Reflector) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const cacheControl = this.reflector.getAllAndOverride<string>(
      CACHE_CONTROL_KEY,
      [
        context.getHandler(),
        context.getClass(),
      ],
    );

    if (!cacheControl) {
      return next.handle();
    }

    const response = context.switchToHttp().getResponse<Response>();

    return next.handle().pipe(
      tap(() => {
        response.setHeader('Cache-Control', cacheControl);
      }),
    );
  }
}
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '@prisma/client';

interface ErrorResponse {
  statusCode: number;
  timestamp: string;
  path: string;
  method: string;
  message: string | string[];
  error?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const errorResponse = this.buildErrorResponse(exception, request);

    this.logger.error(
      `HTTP Status: ${errorResponse.statusCode} Error Message: ${JSON.stringify(errorResponse.message)}`,
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(errorResponse.statusCode).json(errorResponse);
  }

  private buildErrorResponse(exception: unknown, request: Request): ErrorResponse {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Внутренняя ошибка сервера';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      error = exception.name;

      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const response = exceptionResponse as any;
        message = response.message || response.error || message;
        error = response.error || error;
      }
    } else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      // Обработка ошибок Prisma
      status = HttpStatus.BAD_REQUEST;
      error = 'Database Error';

      switch (exception.code) {
        case 'P2002':
          message = 'Запись с такими данными уже существует';
          status = HttpStatus.CONFLICT;
          break;
        case 'P2025':
          message = 'Запись не найдена';
          status = HttpStatus.NOT_FOUND;
          break;
        case 'P2003':
          message = 'Нарушена связь между записями';
          status = HttpStatus.BAD_REQUEST;
          break;
        case 'P2014':
          message = 'Невозможно выполнить операцию из-за связанных данных';
          status = HttpStatus.CONFLICT;
          break;
        default:
          message = 'Ошибка базы данных';
      }
    } else if (exception instanceof Prisma.PrismaClientValidationError) {
      status = HttpStatus.BAD_REQUEST;
      error = 'Validation Error';
      message = 'Некорректные данные запроса';
    } else if (exception instanceof Error) {
      message = exception.message;
      error = exception.name;
    }

    return {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message,
      error,
    };
  }
}
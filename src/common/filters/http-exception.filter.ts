import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost): any {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const error = exception.getResponse() as
      | string
      | { error: string; statusCode: number; message: string | string[] };

    if (request.url.includes('/refresh')) {
      // RefreshToken 에러 처리
      if (status === 401) {
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          message: 'Expired RefreshToken',
          data: null,
        });
      } else {
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          message: error,
          data: null,
        });
      }
    } else {
      // 그 외 API에 대한 예외 처리
      if (exception instanceof UnauthorizedException) {
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          message: 'Expired AccessToken',
          data: null,
        });
      } else if (typeof error === 'string') {
        response.status(status).json({
          statusCode: status,
          timestamp: new Date().toISOString(),
          message: error,
          data: null,
        });
      } else {
        response.status(status).json({
          statusCode: status,
          message: error.message,
          timestamp: new Date().toISOString(),
          data: null,
        });
      }
    }
  }
}

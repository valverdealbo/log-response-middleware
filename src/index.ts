/* eslint-disable import/no-unresolved,@typescript-eslint/ban-types */
import type { RequestHandler, Request, Response, NextFunction } from 'express';
import winston from 'winston';
import stringify from 'fast-safe-stringify';

export interface LogMessage {
  origin: string;
  user: string;
  request: {
    method: string;
    url: string;
    body?: object;
  };
  response: {
    status: number;
    error?: {
      name: string;
      message: string;
    };
    length: unknown;
    ms: string;
  };
}

export function createLogResponseMiddleware(logger: winston.Logger): RequestHandler {
  return function logResponse(request: Request, response: Response, next: NextFunction): void {
    const startTime = process.hrtime();
    response.on('finish', () => {
      const diffTime = process.hrtime(startTime);
      const responseMs = (diffTime[0] * 1e3 + diffTime[1] / 1e6).toFixed(3);
      const message: LogMessage = {
        origin: request.ip ?? request.connection?.remoteAddress ?? '-',
        user: response.locals.user?.username ?? '-',
        request: {
          method: request.method,
          url: request.originalUrl ?? request.url ?? '-',
        },
        response: {
          status: response.statusCode,
          length: response.getHeader('content-length') ?? '0',
          ms: responseMs,
        },
      };
      if (request.body !== undefined) {
        message.request.body = request.body;
      }
      if (message.response.status >= 400) {
        if (response.locals.responseError !== undefined) {
          message.response.error = response.locals.responseError;
        }
        logger.error(stringify(message));
      } else {
        logger.info(stringify(message));
      }
    });
    next();
  };
}

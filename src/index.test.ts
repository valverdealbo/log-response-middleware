/* eslint-disable @typescript-eslint/no-explicit-any */
import events from 'events';
import { Logger } from 'winston';
import { createLogResponseMiddleware } from '.';

describe('createLogResponseMiddleware()', () => {
  const info = jest.fn();
  const error = jest.fn();
  const logger = ({ info, error } as unknown) as Logger;
  const next = jest.fn();
  let request: any;
  let response: any;

  beforeEach(() => {
    info.mockRestore();
    error.mockRestore();
    next.mockRestore();
  });

  test('should log a success', () => {
    request = {
      ip: '127.0.0.1',
      method: 'GET',
      originalUrl: '/login',
    };
    response = new events.EventEmitter();
    response.locals = { user: { username: 'bob' } };
    response.statusCode = 200;
    response.getHeader = (): string => '100';
    const logResponse = createLogResponseMiddleware(logger);
    logResponse(request, response, next);
    expect(next).toHaveBeenCalled();
    expect(info).not.toHaveBeenCalled();
    response.emit('finish');
    expect(info).toHaveBeenCalled();
    const message = JSON.parse(info.mock.calls[0][0]);
    expect(message).toEqual({
      origin: request.ip,
      user: response.locals.user.username,
      request: {
        method: request.method,
        url: request.originalUrl,
      },
      response: expect.objectContaining({
        status: response.statusCode,
        length: response.getHeader(),
      }),
    });
    expect(message.response).toHaveProperty('ms');
  });

  test('should log an error', () => {
    request = {
      connection: { remoteAddress: '127.0.0.1' },
      method: 'POST',
      url: '/find',
      body: { find: {} },
    };
    response = new events.EventEmitter();
    response.locals = { user: { username: 'bob' }, responseError: { name: 'BadRequest', message: 'missing query' } };
    response.statusCode = 400;
    response.getHeader = (): string => '100';
    const logResponse = createLogResponseMiddleware(logger);
    logResponse(request, response, next);
    expect(next).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    response.emit('finish');
    expect(error).toHaveBeenCalled();
    const message = JSON.parse(error.mock.calls[0][0]);
    expect(message).toEqual({
      origin: request.connection.remoteAddress,
      user: response.locals.user.username,
      request: {
        method: request.method,
        url: request.url,
        body: request.body,
      },
      response: expect.objectContaining({
        status: response.statusCode,
        length: response.getHeader(),
        error: response.locals.responseError,
      }),
    });
    expect(message.response).toHaveProperty('ms');
  });

  test('should use default values or skip properties not found on request or response', () => {
    request = {
      method: 'GET',
    };
    response = new events.EventEmitter();
    response.locals = {};
    response.statusCode = 400;
    response.getHeader = (): undefined => undefined;
    const logResponse = createLogResponseMiddleware(logger);
    logResponse(request, response, next);
    expect(next).toHaveBeenCalled();
    expect(error).not.toHaveBeenCalled();
    response.emit('finish');
    expect(error).toHaveBeenCalled();
    const message = JSON.parse(error.mock.calls[0][0]);
    expect(message).toEqual({
      origin: '-',
      user: '-',
      request: {
        method: request.method,
        url: '-',
      },
      response: expect.objectContaining({
        status: response.statusCode,
        length: '0',
      }),
    });
    expect(message.response).toHaveProperty('ms');
  });
});

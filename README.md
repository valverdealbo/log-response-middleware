# @valbo/log-response-middleware

Express middleware that logs each response using a Winston logger.

![npm (scoped)](https://img.shields.io/npm/v/@valbo/log-response-middleware)
[![semantic-release](https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg)](https://github.com/semantic-release/semantic-release)
![Build Status](https://img.shields.io/github/workflow/status/valverdealbo/log-response-middleware/CI)
[![Coverage Status](https://coveralls.io/repos/github/valverdealbo/log-response-middleware/badge.svg?branch=main)](https://coveralls.io/github/valverdealbo/log-response-middleware?branch=main)
[![Known Vulnerabilities](https://snyk.io/test/github/valverdealbo/log-response-middleware/badge.svg?targetFile=package.json)](https://snyk.io/test/github/valverdealbo/log-response-middleware?targetFile=package.json)

## Install

```bash
npm install @valbo/log-response-middleware
```

## Usage

Use it as soon as possible in the middleware chain. It will register a callback on the **finish** event of the response, so that when the response is sent it will log it with the provided logger.

```typescript
import winston from 'winston';
import { createLogResponseMiddleware } from '@valbo/log-response-middleware';

app.use(createLogResponseMiddleware(winston));
```

Logs after the response is sent:

```json
{"origin":"::1","user":"admin","request":{"method":"GET","url":"/login"},"response":{"status":200,"length":"226","ms":"105.558"}}
```

This package also exports a **LogMessage** interface which describes the format of the object that is logged, if you need it:

```typescript
export interface LogMessage {
  origin: string;
  user: string; // from response.locals.user.username
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
```

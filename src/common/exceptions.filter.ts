import {
  Catch,
  ArgumentsHost,
  HttpStatus,
  HttpException,
  Inject,
} from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Request, Response } from 'express';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { ZodError } from 'zod';

type MyResponseObj = {
  statusCode: number;
  timestamp: string;
  path: string;
  response: string | object;
};

@Catch()
export class ExceptionsFilter extends BaseExceptionFilter {
  // private readonly logger = new MyLoggerService(ExceptionsFilter.name);
  @Inject(WINSTON_MODULE_NEST_PROVIDER)
  private readonly logger: Logger;

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Use this to find out the exact error (in some cases the error message is incomplete)
    console.dir(exception, { depth: null });

    const myResponseObj: MyResponseObj = {
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path: request.url,
      // path: request ? request.url : '',
      response: '',
    };

    // Add more Prisma Error Types if you want
    if (exception instanceof HttpException) {
      const getStatusCode = exception.getStatus();
      const getResponse = exception.getResponse() as any;

      myResponseObj.statusCode = getStatusCode;
      if (typeof getResponse == 'object') {
        myResponseObj.response = getResponse.error;
      } else {
        myResponseObj.response = getResponse;
      }
    } else if (exception instanceof PrismaClientValidationError) {
      myResponseObj.statusCode = 422;
      myResponseObj.response = exception.message.replaceAll(/\n/g, ' ');
    } else if (exception instanceof ZodError) {
      myResponseObj.statusCode = 400;
      myResponseObj.response = exception._zod.def.map((err) => {
        return err.message;
      });
    } else {
      myResponseObj.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      myResponseObj.response = 'Internal Server Error';
    }

    // console.dir(response, { depth: null });

    // response.status(myResponseObj.statusCode).json(myResponseObj);

    this.logger.error(
      typeof myResponseObj.response === 'string'
        ? myResponseObj.response
        : JSON.stringify(myResponseObj.response),
      undefined,
      ExceptionsFilter.name,
    );
  }
}

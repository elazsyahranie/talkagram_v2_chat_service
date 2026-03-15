import { Catch, ArgumentsHost } from '@nestjs/common';
import { BaseRpcExceptionFilter, RpcException } from '@nestjs/microservices';
import { PrismaClientValidationError } from '@prisma/client/runtime/library';
import { Observable, throwError } from 'rxjs';
import { ZodError } from 'zod';

// type MyResponseObj = {
//   code: number;
//   timestamp: string;
//   path: string;
//   response: string | object;
// };

@Catch()
export class GrpcExceptionsFilter extends BaseRpcExceptionFilter {
  catch(exception: any, _host: ArgumentsHost): Observable<any> {
    // Use this to find out the exact error (in some cases the error message is incomplete)
    console.dir(exception, { depth: null });

    if (exception instanceof RpcException) {
      const error = exception.getError();

      const code =
        typeof error === 'object' && 'code' in error ? (error as any).code : 13;
      const message =
        typeof error === 'object' && 'message' in error
          ? (error as any).message
          : error;

      return throwError(() => ({
        code,
        message,
      }));
    } else if (exception instanceof PrismaClientValidationError) {
      return throwError(() => ({
        code: 3,
        message: exception.message.replaceAll(/\n/g, ' '),
      }));
    } else if (exception instanceof ZodError) {
      return throwError(() => ({
        code: 3,
        message: exception._zod.def.map((err) => {
          return err.message;
        }),
        // details: exception.errors,
      }));
    } else {
      const error = {
        code: 13, // INTERNAL
        message: exception?.message || 'Internal server error',
      };

      return throwError(() => error);
    }
  }
}

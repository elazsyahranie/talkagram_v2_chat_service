import { ValidationPipe } from '@nestjs/common';
import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
// import { MyLoggerService } from './my-logger/my-logger.service';
// import { AllExceptionFilter } from './all-exceptions.filter';
// import { ExceptionsFilter } from './common/exceptions.filter';
dotenv.config();
import { winstonConfig } from './logger/winston.config';
import { WinstonModule } from 'nest-winston';
// import { ErrorFilter } from './common/error.filter';
// import { Reflector } from '@nestjs/core';
import {
  Transport,
  // MicroserviceOptions
} from '@nestjs/microservices';
import { ExceptionsFilter } from './common/exceptions.filter';
import { GrpcExceptionsFilter } from './common/grpc-exceptions.filter';

async function bootstrap() {
  /* 
    Implementasikan kodingan yang ada pada Chats 2 Service 
    di sini ya, juga di media_service 
  */

  const app = await NestFactory.create(
    AppModule,
    { logger: WinstonModule.createLogger(winstonConfig) },
    // {
    // bufferLogs: true
    // }
  );

  /* 
    This code enables 'class-validator' to be used globally.
    Note that this code works only for HTTP requests. For WebSockets, 
    the ValidationPipe is implemented in `chats.gateway.ts`
  */
  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     whitelist: true,
  //     transform: true,
  //     forbidNonWhitelisted: true,
  //   }),
  // );

  // Start listening for incoming messages
  await app.listen(process.env.CHATS_SERVICE_HTTP_PORT ?? 4002);

  app.useGlobalFilters(
    app.get(ExceptionsFilter),
    app.get(GrpcExceptionsFilter),
  );

  app.connectMicroservice(
    {
      transport: Transport.TCP,
      options: {
        host: process.env.CHATS_SERVICE_HOST || 'localhost',
        port: process.env.CHATS_SERVICE_PORT
          ? parseInt(process.env.CHATS_SERVICE_PORT, 10)
          : 3002,
      },
    },
    { inheritAppConfig: true },
  );

  await app.startAllMicroservices();

  console.log(
    `Chat Service is listening on port ${process.env.CHATS_SERVICE_PORT}`,
  );
  // // const { httpAdapter } = app.get(HttpAdapterHost);
  // // app.useGlobalFilters(new ExceptionsFilter());
  // // app.useGlobalFilters(new ErrorFilter());

  // // app.useLogger(app.get(MyLoggerService))
  // app.enableCors(); // The current setting allows all origins to acces your API (not recommended for production environments)
  // // app.setGlobalPrefix('api'); // Global prefix
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

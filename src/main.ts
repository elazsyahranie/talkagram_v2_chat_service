import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';
import { MyLoggerService } from './my-logger/my-logger.service';
// import { AllExceptionFilter } from './all-exceptions.filter';
import { ExceptionsFilter } from './common/exceptions.filter';
dotenv.config();
import { winstonConfig } from './logger/winston.config';
import { WinstonModule } from 'nest-winston';
import { ErrorFilter } from './common/error.filter';
import { Reflector } from '@nestjs/core';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    AppModule,
    {
      transport: Transport.TCP,
      options: {
        host: process.env.USERS_SERVICE_HOST || 'localhost',
        port: process.env.USERS_SERVICE_PORT
          ? parseInt(process.env.USERS_SERVICE_PORT, 10)
          : 3001,
      },
    },
  );

  // Start listening for incoming messages
  await app.listen();
  console.log('User Service is listening on port 3001');
  // const app = await NestFactory.create(
  //   AppModule,
  //   { logger: WinstonModule.createLogger(winstonConfig) },
  //   // {
  //   // bufferLogs: true
  //   // }
  // );

  // // const { httpAdapter } = app.get(HttpAdapterHost);
  // // app.useGlobalFilters(new ExceptionsFilter());
  // // app.useGlobalFilters(new ErrorFilter());

  // // app.useLogger(app.get(MyLoggerService))
  // app.enableCors(); // The current setting allows all origins to acces your API (not recommended for production environments)
  // // app.setGlobalPrefix('api'); // Global prefix
  // await app.listen(process.env.PORT ?? 3000);
}
bootstrap();

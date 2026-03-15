import { Module, Global } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ValidationService } from './validation.service';
import { GrpcExceptionsFilter } from './grpc-exceptions.filter';
import { APP_FILTER } from '@nestjs/core';
// import { MulterModule } from '@nestjs/platform-express';
// import { diskStorage } from 'multer';
// import { extname } from 'path';

@Global()
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
  ],
  providers: [
    // PrismaService,
    ValidationService,
    { provide: APP_FILTER, useClass: GrpcExceptionsFilter },
  ],
  exports: [ValidationService],
})
export class CommonModule {}

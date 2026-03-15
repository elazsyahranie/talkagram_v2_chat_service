import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';
import { EmployeesModule } from './employees/employees.module';
// import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
// import { APP_GUARD } from '@nestjs/core';
// import { MyLoggerModule } from './my-logger/my-logger.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './logger/winston.config';
// import { ExceptionsFilter } from './common/exceptions.filter';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { RedisModule } from './redis.module';
import { StaffsModule } from './staffs/staffs.module';
import { StoresController } from './stores/stores.controller';
import { StoresService } from './stores/stores.service';
// import { GrpcsExceptionFilter } from './common/grpc-exceptions.filter';
// import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    UsersModule,
    DatabaseModule,
    EmployeesModule,
    CommonModule,
    WinstonModule.forRoot(winstonConfig),
    ServeStaticModule.forRoot({
      rootPath: join(process.cwd(), 'uploads'),
      // rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    // ThrottlerModule.forRoot([
    //   { name: 'short', ttl: 1000, limit: 3 },
    //   { name: 'long', ttl: 60000, limit: 3 },
    // ]),
    // MyLoggerModule,
    AuthModule,
    RedisModule,
    StaffsModule,
  ],
  controllers: [AppController, StoresController],
  providers: [
    AppService,
    // { provide: APP_GUARD, useClass: ThrottlerGuard } Activates the throttle
    // {
    //   provide: APP_FILTER,
    //   useClass: ExceptionsFilter,
    // },
    // {
    //   provide: APP_FILTER,
    //   useClass: GrpcsExceptionFilter,
    // },
    StoresService,
  ],
  exports: [WinstonModule],
})
export class AppModule {}

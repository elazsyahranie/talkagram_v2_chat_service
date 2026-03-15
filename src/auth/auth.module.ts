import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
// import { AuthService } from './auth.service';
import { AuthenticationGuard } from './authentication.guard';
import { APP_GUARD } from '@nestjs/core';

@Module({
  // controllers: [AuthController],
  providers: [
    // AuthenticationGuard,
    // Use the code below if you want to make the 'AuthenticationGuard' global
    // NOTE: You don't need to manually add any global guards to controllers
    // {
    //   provide: APP_GUARD,
    //   useClass: AuthenticationGuard,
    // },
  ],
  // exports: [AuthenticationGuard],
})
export class AuthModule {}

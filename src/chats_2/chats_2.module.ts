import { Module } from '@nestjs/common';
import { Chats2Service } from './chats_2.service';
import { Chats2Controller } from './chats_2.controller';
import { JwtModule } from '@nestjs/jwt';
import { DatabaseModule } from 'src/database/database.module';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_SECRET_KEY,
      // signOptions: { expiresIn: '60s' },
      signOptions: {},
    }),
  ],
  providers: [Chats2Service],
  controllers: [Chats2Controller],
})
export class Chats2Module {}

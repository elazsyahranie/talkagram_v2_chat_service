import { Module } from '@nestjs/common';
import { ChatGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_SECRET_KEY,
      // signOptions: { expiresIn: '60s' },
      signOptions: {},
    }),
  ],
  providers: [ChatGateway, ChatsService],
})
export class ChatModule {}

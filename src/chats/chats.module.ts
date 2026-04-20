import { Module } from '@nestjs/common';
import { ChatGateway } from './chats.gateway';
import { ChatsService } from './chats.service';

@Module({
  providers: [ChatGateway, ChatsService],
})
export class ChatModule {}

import { Module } from '@nestjs/common';
import { ChatGateway } from './chats.gateway';
import { ChatsService } from './chats.service';
import { JwtModule } from '@nestjs/jwt';
import { ChatsController } from './chats.controller';
import { DatabaseModule } from 'src/database/database.module';
import { ClientsModule, Transport } from '@nestjs/microservices';
import * as dotenv from 'dotenv';
import { MediaClient } from './client/media.client';
dotenv.config();

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_SECRET_KEY,
      // signOptions: { expiresIn: '60s' },
      signOptions: {},
    }),
    ClientsModule.register([
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MEDIA_SERVICE_HOST || 'localhost',
          port: process.env.MEDIA_SERVICE_PORT
            ? parseInt(process.env.MEDIA_SERVICE_PORT, 10)
            : 3001,
        },
      },
    ]),
  ],
  controllers: [ChatsController],
  providers: [ChatsModule, ChatsService, ChatGateway, MediaClient],
})
export class ChatsModule {}

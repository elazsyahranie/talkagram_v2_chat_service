import { UsePipes, ValidationPipe } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
  WsException,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { JwtService } from '@nestjs/jwt';
import { CreateRoomDto } from './dto/createRoom.dto';
import { sendMessageDto } from './dto/sendMessage.dto';

@UsePipes(
  new ValidationPipe({
    whitelist: true,
    transform: true,
    forbidNonWhitelisted: true,
  }),
)
@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly chatsService: ChatsService,
    private jwtService: JwtService,
  ) {}
  @WebSocketServer()
  server: Server;

  // handleConnection(client: Socket) {
  //   console.log('New client connected:', client.id);
  //   // console.dir(client.handshake, { depth: null });
  // }
  handleConnection(client: Socket) {
    const token = client.handshake.auth?.token;

    // console.dir(client, { depth: null });

    if (!token) {
      client.emit('error', {
        status: 'error',
        message: 'No token!',
      });
      client.disconnect();
      return;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.TOKEN_SECRET_KEY,
      });

      client.data.user = payload;

      console.log('Authenticated user:', payload.id);
    } catch {
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    console.log('Client disconnected:', client.id);
  }

  // Join room
  // @SubscribeMessage('createRoom')
  // handleCreateRoom(
  //   @MessageBody() data: CreateRoomDto,
  //   @ConnectedSocket() client: Socket,
  // ) {
  //   console.log('createRoom - chats.gateway.ts');
  //   const participants = [...new Set(data.interlocutors)];
  //   // this.chatsService.createRoom([...participants, client.data.user.id]);
  //   // client.join(data.room);
  //   // throw new WsException('Invalid data');
  // }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    console.log('joinRoom');
    client.join(data.room);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() message: sendMessageDto) {
    // console.log('Message received');
    // console.dir(payload, { depth: null });
    this.chatsService.addChat(message);
    this.server.emit('sendMessage', message);
  }
}

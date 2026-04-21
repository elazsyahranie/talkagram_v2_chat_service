import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatsService } from './chats.service';
import { JwtService } from '@nestjs/jwt';

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
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.room);
    console.log(`Client ${client.id} joined room ${data.room}`);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() payload: any) {
    // console.log('Message received');
    // console.dir(payload, { depth: null });
    this.chatsService.addChat(payload);
    this.server.emit('sendMessage', payload);
  }
}

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
import { CreateRoomDto } from './dto/create-room.dto';
import { sendMessageDto } from './dto/send-message.dto';
import { v4 as uuidv4 } from 'uuid';

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
  // Constructor is usually used for dependency injections
  constructor(
    private readonly chatsService: ChatsService,
    private jwtService: JwtService,
  ) {}
  // Class property
  /* Map create the list of key-value pairs {'roomId' => [participanId, participantId]} */
  private roomParticipants = new Map<string, string[]>();

  @WebSocketServer()
  server: Server;

  // handleConnection(client: Socket) {
  //   console.log('New client connected:', client.id);
  //   // console.dir(client.handshake, { depth: null });
  // }
  async handleConnection(client: Socket) {
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

      // Store the payload on the 'client.data.user'
      client.data.user = payload;
      const user_id = payload.id;

      /* 
        Untuk notifikasi, kita buatkan room pada server Socket.
        Room ini tidak perlu kita simpan dengan format yng sama pada database,
        karena tidak mungkin kita mengirim pesan realtime ke user yang sedang
        tidak terhubung ke server Socket
      */
      client.join(`user:${user_id}`);
      // console.dir(this.server.sockets.adapter.rooms, { depth: null });

      /* 
        Di sini kita buatkan logic untuk join personal room untuk tiap connection 
      */
      // const findRoom = await this.chatsService.findOrAddPersonalRoom(user_id);
      // if (findRoom) {
      //   const { room_id } = findRoom;

      //   client.join(room_id);
      //   console.log(`${client.id} has joined the personal room ${room_id}`);
      // }

      console.log('Authenticated user:', user_id);
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

  /* 
    1) Pastikan agar `const roomParticipants` nya menjadi `class property` aga bisa diakses lebih mudah
  */
  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { room: string; interlocutor: string },
    @ConnectedSocket() client: Socket,
  ) {
    // console.dir(client.data.user.id, { depth: null });
    const roomId = uuidv4();
    // const roomParticipants = new Map<string, string[]>();
    this.roomParticipants.set(roomId, [client.data.user.id, data.interlocutor]);

    // console.log()
    client.join(roomId);
    console.log(`${client.id} has joined the room ${roomId}`);

    const rooms = this.server.sockets.adapter.rooms;
    console.dir(rooms, { depth: null });

    console.dir(this.roomParticipants, { depth: null });
  }

  @SubscribeMessage('sendPersonalMessage')
  async handlePersonalMessage(
    @MessageBody() data: { interlocutor: string; message: string },
    @ConnectedSocket() client: Socket,
  ) {
    /* 
      1) Sebelum pesan pertama di mulai, room belum terbentuk 
      2) Baru setelah pesan pertama terkirim, proses pembentukan room dimulai 
        1) Pertama, cek di database (atau Redis) apakah user dan lawan bicara nya sudah memiliki room atau belum 
        2) Jika sudah ada, maka gabungkan user tersebut pada server Socket.io ke room yang sudah tersimpan di database 
        3) Jika belum, maka kita create dulu room nya
        4) Ingat, memory Socket.io itu bukan tempat data disimpan permanen
    */

    /* The ID of user extracted from the token */
    const userId: string = client.data.user.id;
    const { interlocutor, message } = data;

    // This function returns the room ID
    /* 
      The 'sender_id' here would be the ID of a 'RoomParticipants' table,
      not the user_id
    */
    const findRoom = await this.chatsService.findOrAddPersonalChatRoom(
      userId,
      interlocutor,
    );

    if (findRoom) {
      const { room_id, room_participant_id } = findRoom;

      client.join(room_id);
      console.log(
        `${userId} and ${interlocutor} has joined the room ${room_id}`,
      );

      // const receiverPersonalRooms = this.server.sockets.adapter.rooms.get(
      //   `user:${interlocutor}`,
      // );
      // console.dir(this.server.sockets.adapter.rooms, { depth: null });
      // console.log(`user:${interlocutor}`);
      // if (receiverPersonalRooms) {
      //   console.dir(receiverPersonalRooms.values(), { depth: null });
      // }
      // this.server.emit('sendPersonalMessage', message);
      this.server.to(room_id).emit('sendPersonalMessage', message);
      await this.chatsService.addPersonalChat(
        room_id,
        room_participant_id,
        message,
      );

      // Notify the users of new messages
      this.server.to(`user:${interlocutor}`).emit('newNotification', message);
    }

    // client.join(room_id);
    // console.log(`${userId} and ${interlocutor} has joined the room ${room_id}`);

    // this.server.emit('sendPersonalMessage', message);
    // await this.chatsService.addPersonalChat(
    //   room_id,
    //   room_participant_id,
    //   message,
    // );

    // this.roomParticipants.set(roomId, [client.data.user.id, data.interlocutor]);
    // console.dir(this.roomParticipants, { depth: null });
    // // this.chatsService.addChat(message);
    // // this.server.emit('sendMessage', message);
  }

  @SubscribeMessage('sendMessage')
  handleMessage(@MessageBody() message: sendMessageDto) {
    // console.log('Message received');
    // console.dir(payload, { depth: null });
    // this.chatsService.addPersonalChat(message);
    this.server.emit('sendMessage', message);
  }
}

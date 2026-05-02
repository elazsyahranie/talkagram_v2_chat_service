import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/createRoom.dto';
import { sendMessageDto } from './dto/sendMessage.dto';

@Injectable()
export class ChatsService {
  constructor() {}
  createRoom(data: CreateRoomDto) {
    console.log('createRoom');
    console.dir(data, { depth: null });
  }

  addChat(message: sendMessageDto) {
    console.log('addChat');
    console.dir(message, { depth: null });
  }
}

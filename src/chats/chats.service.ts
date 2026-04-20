import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
} from '@nestjs/common';

@Injectable()
export class ChatsService {
  constructor() {}

  addChat(chat: any) {
    console.log('Chats Service');
    console.dir(chat, { depth: null });
  }
}

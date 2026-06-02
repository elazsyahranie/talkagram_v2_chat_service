import {
  Controller,
  Body,
  Inject,
  // HttpException,
  // HttpStatus,
} from '@nestjs/common';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  MessagePattern,
  // ClientProxy
} from '@nestjs/microservices';
import { Chats2Service } from './chats_2.service';
// import { CreateRoomDto } from './dto/createRoom.dto';
import { CreateGrupDto } from './dto/create-group.dto';
import { Prisma } from '@prisma/client';

@Controller('chats_2')
export class Chats2Controller {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly chatsService: Chats2Service,
  ) {}

  @MessagePattern({ cmd: 'chats2CreateGroup' })
  async createGroup(@Body() requestBody: CreateGrupDto) {
    // console.log('chats2CreateGroup');
    // console.dir(requestBody, { depth: null });
    const result = await this.chatsService.createGroup(requestBody);
    return result;
  }
}

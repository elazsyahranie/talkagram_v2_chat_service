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
import { ChatsService } from './chats.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CreateGrupDto } from './dto/create-group.dto';
import { Prisma } from '@prisma/client';

@Controller('chats')
export class ChatsController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly chatsService: ChatsService,
  ) {}

  @MessagePattern({ cmd: 'createRoom' })
  async createRoom(@Body() request: Prisma.RoomsCreateInput) {}

  @MessagePattern({ cmd: 'chatsCreateGroup' })
  async createGroup(@Body() requestBody: CreateGrupDto) {
    const result = await this.chatsService.createGroup(requestBody);
    return result;
  }
}

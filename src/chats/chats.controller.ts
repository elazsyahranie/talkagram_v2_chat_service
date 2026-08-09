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
import { CreateGroupDto } from './dto/create-group.dto';
import { Prisma } from '@prisma/client';
import { GetRoomsData, GetRoomsResult } from './dto/get-rooms-result.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { AddGroupParticipants } from './dto/add-group-participants.dto';
import { UpdateGroupParticipants } from './dto/update-group-participants.dto';
import { SelfUpdateGroupParticipant } from './dto/self-update-group-participant.dto';
import { DeleteGroupParticipants } from './dto/delete-group-participants.dto';
import { SelfDeleteGroupParticipant } from './dto/self-delete-group-participant.dto';
import { DeleteGroupDto } from './dto/delete-group.dto';

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
  async createGroup(@Body() requestBody: CreateGroupDto) {
    const result = await this.chatsService.createGroup(requestBody);
    return result;
  }

  @MessagePattern({ cmd: 'chatsAddGroupParticipants' })
  async addGroupParticipants(@Body() requestBody: AddGroupParticipants) {
    const result = await this.chatsService.addGroupParticipants(requestBody);
    return result;
  }

  @MessagePattern({ cmd: 'chatsGetRoomsByUser' })
  async getRoomsByUserId(
    @Body()
    body: {
      user: string;
      order: string;
      page: number;
      limit: number;
    },
  ): Promise<GetRoomsResult> {
    const { user, order, page, limit } = body;
    // console.dir(body, { depth: null });
    const result = await this.chatsService.getRoomsByUser(
      user,
      order,
      page,
      limit,
    );
    return result;
  }

  @MessagePattern({ cmd: 'chatsSelfUpdateGroupParticipant' })
  async selfUpdateGroupParticipant(
    @Body() requestBody: SelfUpdateGroupParticipant,
  ) {
    const result =
      await this.chatsService.selfUpdateGroupPaticipant(requestBody);
    return result;
  }

  @MessagePattern({ cmd: 'chatsUpdateGroupParticipants' })
  async updateGroupParticipants(@Body() requestBody: UpdateGroupParticipants) {
    const result = await this.chatsService.updateGroupParticipants(requestBody);
    return result;
  }

  @MessagePattern({ cmd: 'chatsUpdateGroup' })
  async updateRoom(@Body() requestBody: UpdateGroupDto) {
    const result = await this.chatsService.updateGroup(requestBody);
    return result;
  }

  @MessagePattern({ cmd: 'chatsSelfDeleteGroupParticipant' })
  async selfDeleteGroupParticipant(
    @Body() requestBody: SelfDeleteGroupParticipant,
  ) {
    const result =
      await this.chatsService.selfDeleteGroupParticipant(requestBody);
    return result;
  }

  @MessagePattern({ cmd: 'chatsDeleteGroupParticipants' })
  async deleteGroupParticipants(@Body() requestBody: DeleteGroupParticipants) {
    const result = await this.chatsService.deleteGroupParticipants(requestBody);
    return result;
  }

  @MessagePattern({ cmd: 'chatsDeleteGroup' })
  async deleteGroup(@Body() requestBody: DeleteGroupDto) {
    const result = await this.chatsService.deleteGroup(requestBody);
    return result;
  }
}

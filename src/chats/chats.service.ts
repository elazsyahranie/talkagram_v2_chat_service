import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/createRoom.dto';
import { RpcException } from '@nestjs/microservices';
import { sendMessageDto } from './dto/sendMessage.dto';
import { Prisma } from '@prisma/client';
import { CreateGrupDto } from './dto/create-group.dto';
import { ValidationService } from 'src/common/validation.service';
import { ChatValidation } from './chats.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from 'src/database/database.service';

@Injectable()
export class ChatsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private validationService: ValidationService,
    private readonly databaseService: DatabaseService,
  ) {}
  async createGroup(requestBody: CreateGrupDto) {
    this.validationService.validate(ChatValidation.CREATEGROUP, requestBody);

    // console.log('Create group');
    // console.dir(requestBody, { depth: null });

    // this.validationService.validate(ChatValidation.CREATEGROUP, requestBody);

    const room_id = uuidv4();
    const createGroupBody: Prisma.RoomsCreateInput = {
      id: room_id,
      name: requestBody.name,
      type: 'Group',
      description: requestBody.description,
    };

    // const groupParticipants: Partial<Prisma.RoomParticipantsCreateManyInput[]> =
    //   [];
    const roomParticipantsBody: Prisma.RoomParticipantsCreateManyInput[] = [
      { id: uuidv4(), user_id: requestBody.admin, role: 'Admin', room_id },
    ];
    requestBody.otherParticipants.forEach((user_id) => {
      roomParticipantsBody.push({
        id: uuidv4(),
        user_id,
        role: 'User',
        room_id,
      });
    });

    await this.databaseService.$transaction([
      this.databaseService.rooms.create({
        data: createGroupBody,
      }),
      this.databaseService.roomParticipants.createMany({
        data: roomParticipantsBody,
      }),
    ]);

    return { status: 'Group creation succeeded' };
  }

  createRoom(requestBody: Prisma.RoomsCreateInput) {
    console.log('Create room');
    console.dir(requestBody, { depth: null });

    return { status: 'successss' };
    // console.log('createRoom');
    // console.dir(participants, { depth: null });
    // if (participants.length < 3) {
    //   console.log('Personal Chat');
    // } else {
    //   console.log('Group');
    // }

    // const roomId
    // const roomData = {

    // }
  }

  addChat(message: sendMessageDto) {
    console.log('addChat');
    console.dir(message, { depth: null });
  }
}

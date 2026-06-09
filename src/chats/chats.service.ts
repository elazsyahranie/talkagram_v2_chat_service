import {
  Injectable,
  Inject,
  NotFoundException,
  HttpException,
} from '@nestjs/common';
import { CreateRoomDto } from './dto/create-room.dto';
import { RpcException } from '@nestjs/microservices';
import { sendMessageDto } from './dto/send-message.dto';
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

  createRoomPersonalChat(requestBody: any) {
    console.log('Create room');
    console.dir(requestBody, { depth: null });

    return { status: 'successs' };
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

  async findOrAddRoom(participants: string[]): Promise<string> {
    const dmKey = participants.sort().join(':');

    /* Find a personal chat room containing each participants IDs */
    const findRoom = await this.databaseService.rooms.findFirst({
      where: { dm_key: dmKey },
    });

    let room_id = '';
    if (!findRoom) {
      room_id = uuidv4();
      const createRoomBody: Prisma.RoomsCreateInput = {
        id: room_id,
        type: 'Personal Chat',
        dm_key: dmKey,
      };
      const roomParticipantsBody: Prisma.RoomParticipantsCreateManyInput[] = [];
      participants.forEach((user_id) => {
        roomParticipantsBody.push({
          id: uuidv4(),
          user_id,
          role: 'User',
          room_id,
        });
      });

      await this.databaseService.$transaction([
        this.databaseService.rooms.create({
          data: createRoomBody,
        }),
        this.databaseService.roomParticipants.createMany({
          data: roomParticipantsBody,
        }),
      ]);
    } else {
      room_id = findRoom.id;
    }

    return room_id;
  }

  // Tambahkan logic untuk menyimpan chat pada database
  async addPersonalChat(room: string, chat: string): Promise<void | string> {}
}

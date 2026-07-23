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
import { CreateGroupDto } from './dto/create-group.dto';
import { ValidationService } from 'src/common/validation.service';
import { ChatValidation } from './chats.validation';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { v4 as uuidv4 } from 'uuid';
import { DatabaseService } from 'src/database/database.service';
import { GetRoomsData, GetRoomsResult } from './dto/get-rooms-result.dto';
import { UpdateGroupDto } from './dto/update-group.dto';
import { UpdateGroupParticipants } from './dto/update-group-participants.dto';

@Injectable()
export class ChatsService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private validationService: ValidationService,
    private readonly databaseService: DatabaseService,
  ) {}
  async createGroup(requestBody: CreateGroupDto) {
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

  async findOrAddPersonalRoom(
    user_id: string,
  ): Promise<{ room_id: string } | null> {
    const findRoomByUserIdKey = await this.databaseService.rooms.findFirst({
      where: { type: 'Personal Room', user_id_key: user_id },
    });

    if (findRoomByUserIdKey) {
      return { room_id: findRoomByUserIdKey.id };
    } else {
      const room_id = uuidv4();
      const createRoomBody: Prisma.RoomsCreateInput = {
        id: room_id,
        type: 'Personal Room',
        user_id_key: user_id,
      };
      await this.databaseService.rooms.create({
        data: createRoomBody,
      });

      return { room_id };
    }
  }

  // Ada yang error di sini
  async findOrAddPersonalChatRoom(
    sender: string,
    receiver: string,
  ): Promise<{ room_id: string }> {
    // Promise<string> {
    /* Alphabetically sort the ID of user and their receiver to help find their personal chat room */
    const dmKey = [sender, receiver].sort().join(':');

    /* Find a personal chat room containing each participants IDs */
    const findRoom = await this.databaseService.rooms.findFirst({
      where: {
        dm_key: dmKey,
      },
    });

    let room_id = '';
    // let room_participant_id = '';
    if (!findRoom) {
      room_id = uuidv4();
      const createRoomBody: Prisma.RoomsCreateInput = {
        id: room_id,
        type: 'Personal Chat',
        dm_key: dmKey,
      };

      const roomParticipantsBody: Prisma.RoomParticipantsCreateManyInput[] = [];
      // room_participant_id = uuidv4();
      const senderData = {
        id: uuidv4(),
        user_id: sender,
        role: 'User',
        room_id,
      };
      roomParticipantsBody.push(senderData);
      const receiverData = {
        id: uuidv4(),
        user_id: receiver,
        role: 'User',
        room_id,
      };
      roomParticipantsBody.push(receiverData);

      await this.databaseService.$transaction([
        this.databaseService.rooms.create({
          data: createRoomBody,
        }),
        this.databaseService.roomParticipants.createMany({
          data: roomParticipantsBody,
        }),
      ]);

      // return { room_id };
    } else {
      room_id = findRoom.id;
    }

    return { room_id };
  }

  // Tambahkan logic untuk menyimpan chat pada database
  async addPersonalChat(
    room: string,
    sender: string,
    chat: string,
  ): Promise<string> {
    const chat_id = uuidv4();
    // await this.databaseService.chats.create({
    //   data: {
    //     id: chat_id,
    //     chat,
    //     sender,
    //     room_id: room,
    //   },
    // });
    const createdAt = new Date();

    await this.databaseService.$transaction([
      this.databaseService.chats.create({
        data: {
          id: chat_id,
          chat,
          sender,
          room_id: room,
          createdAt,
        },
      }),
      this.databaseService.rooms.update({
        where: { id: room },
        data: { latest_chat_id: chat_id, lastActivityAt: createdAt },
      }),
    ]);

    return 'success';
  }

  async getRoomsByUser(
    user: string,
    order: string,
    page: number,
    limit: number,
  ): Promise<GetRoomsResult> {
    const where: Prisma.RoomsWhereInput = {};
    where.rooms_participants = {
      some: {
        user_id: user,
      },
    };

    const totalData = await this.databaseService.rooms.count({
      where,
    });

    const totalPage = Math.ceil(totalData / limit);
    const offset = page * limit - limit;

    const orderBy: Prisma.RoomsOrderByWithRelationInput = {};
    if (order === 'latest') {
      orderBy.lastActivityAt = 'desc';
    } else if (order === 'newest') {
      orderBy.lastActivityAt = 'asc';
    }

    const result = await this.databaseService.rooms.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        latest_chat_id: true,
        lastActivityAt: true,
        // chats: {
        //   select: { id: true, sender: true, chat: true, createdAt: true },
        // },
        latestChat: {
          select: {
            id: true,
            sender: true,
            chat: true,
            createdAt: true,
          },
        },
        rooms_participants: {
          select: {
            id: true,
            user_id: true,
          },
        },
      },
      skip: offset,
      take: limit,
      orderBy,
    });
    if (!result.length) {
      // throw new NotFoundException('Not found!');
      throw new RpcException({
        code: 5,
        message: 'Not found!',
      });
    }

    const finalResult = result.map((obj) => {
      const { id, name, type, lastActivityAt, latestChat } = obj;

      let modifiedLatestChat: {
        id: string;
        // createdAt: Date;
        sender: string;
        chat: string;
      } | null = null;
      if (latestChat) {
        modifiedLatestChat = {
          id: latestChat.id,
          sender: latestChat.id,
          chat: latestChat.chat,
        };
      }

      return { id, name, type, lastActivityAt, latestChat: modifiedLatestChat };
    });

    return { totalData, totalPage, page, data: finalResult };
  }

  /* 
    The following is to update the group, not the participants. 
    Participants update is on a different function 
  */
  async updateGroup(requestBody: UpdateGroupDto) {
    this.validationService.validate(ChatValidation.UPDATEGROUP, requestBody);

    // Send response if form-data was sent blank
    if (!requestBody) {
      return { status: 'success' };
    }

    let { admin, room_id } = requestBody;
    //Validate whether the user is the admin of the group or not
    const groupAdminValidation =
      await this.databaseService.roomParticipants.findFirst({
        where: { room_id: room_id, user_id: admin, role: 'Admin' },
      });
    if (!groupAdminValidation) {
      throw new RpcException({
        code: 16,
        message: 'Unauthorized',
      });
    }

    let updatedData: UpdateGroupDto = {};
    if (requestBody.name) updatedData.name = requestBody.name;
    if (requestBody.description)
      updatedData.description = requestBody.description;

    await this.databaseService.rooms.update({
      where: { id: room_id },
      data: updatedData,
    });

    this.logger.log('Group updated!', 'ChatsService');

    // return { status: 'Group update succeed', data: requestBody };
    return { status: 'success' };
  }

  async updateGroupParticipants(requestBody: UpdateGroupParticipants) {
    console.log('requestBody');
    console.dir(requestBody, { depth: null });

    this.validationService.validate(
      ChatValidation.UPDATEGROUPPARTICIPANTS,
      requestBody,
    );

    return { status: 'succeeded', data: { ...requestBody } };
  }
}

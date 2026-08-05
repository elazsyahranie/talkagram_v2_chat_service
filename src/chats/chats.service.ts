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
import { AddGroupParticipants } from './dto/add-group-participants.dto';
import { UpdateGroupParticipants } from './dto/update-group-participants.dto';
import { SelfUpdateGroupParticipant } from './dto/self-update-group-participant.dto';
import { DeleteGroupParticipants } from './dto/delete-group-participants.dto';
import { SelfDeleteGroupParticipant } from './dto/self-delete-group-participant.dto';
import { DeleteGroupDto } from './dto/delete-group.dto';

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

  async addGroupParticipants(requestBody: AddGroupParticipants) {
    this.validationService.validate(
      ChatValidation.ADDGROUPPARTICIPANTS,
      requestBody,
    );

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

    // Prevent any duplicate users in the `participants` array of objects
    const seen = new Set();
    const uniqueParticipants = requestBody.participants.filter((obj) => {
      if (seen.has(obj.user)) {
        return false;
      }
      seen.add(obj.user);
      return true;
    });

    await Promise.all(
      uniqueParticipants.map(async (obj) => {
        /* 
          Make sure that only those that haven't been added 
          to the group could be added to the group
        */
        const findParticipant =
          await this.databaseService.roomParticipants.findFirst({
            where: { room_id: room_id, user_id: obj.user },
          });

        if (!findParticipant) {
          await this.databaseService.roomParticipants.create({
            data: {
              id: uuidv4(),
              room_id: room_id,
              user_id: obj.user,
              role: obj.role,
            },
          });
        }
      }),
    );

    return {
      status: 'success',
    };
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

  async updateGroupParticipants(requestBody: UpdateGroupParticipants) {
    this.validationService.validate(
      ChatValidation.UPDATEGROUPPARTICIPANTS,
      requestBody,
    );

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

    /* 
      1) Prevent any duplicate users in the `participants` array of objects 
      2) Prevent the user from updating itself as a participant here
    */
    const seen = new Set();
    const uniqueParticipants = requestBody.participants.filter((obj) => {
      if (seen.has(obj.user) || obj.user === admin) {
        return false;
      }
      seen.add(obj.user);
      return true;
    });

    await Promise.all(
      uniqueParticipants.map(async (obj) => {
        /* 
          Make sure that only those that have been a part 
          of the group could be added to the group
        */
        const findParticipant =
          await this.databaseService.roomParticipants.findFirst({
            where: { room_id: room_id, user_id: obj.user },
          });

        if (findParticipant) {
          // We're using the ID taken from 'findParticipant' above
          await this.databaseService.roomParticipants.update({
            where: { id: findParticipant.id },
            data: { role: obj.role },
          });
        }
      }),
    );

    return { status: 'success' };
  }

  async selfUpdateGroupPaticipant(requestBody: SelfUpdateGroupParticipant) {
    this.validationService.validate(
      ChatValidation.SELFUPDATEGROUPPARTICIPANT,
      requestBody,
    );

    let { user, room_id, role } = requestBody;
    //Validate whether the user is the admin of the group or not
    const groupAdminValidation =
      await this.databaseService.roomParticipants.findFirst({
        where: { room_id: room_id, user_id: user, role: 'Admin' },
      });
    if (!groupAdminValidation) {
      throw new RpcException({
        code: 16,
        message: 'Unauthorized',
      });
    }

    /* 
      If the user wants to remove its admin status, 
      make sure that the group has other admins  
    */
    if (role !== 'Admin') {
      const findOtherAdmins = await this.databaseService.roomParticipants.count(
        {
          where: { room_id, role: 'Admin' },
        },
      );
      if (findOtherAdmins < 2) {
        throw new RpcException({
          code: 16,
          message: 'Unauthorized',
        });
      }
    }

    await this.databaseService.roomParticipants.update({
      where: { id: groupAdminValidation.id },
      data: { role },
    });

    return {
      status: 'success',
    };
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

  async deleteGroupParticipants(requestBody: DeleteGroupParticipants) {
    this.validationService.validate(
      ChatValidation.DELETEGROUPPARTICIPANTS,
      requestBody,
    );

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

    /* 
      1) Prevent any duplicate users in the `participants` array of objects 
      2) Prevent the user from updating itself as a participant here
    */
    const seen = new Set();
    const uniqueParticipants = requestBody.participantsForDeletion.filter(
      (obj) => {
        if (seen.has(obj) || obj === admin) {
          return false;
        }
        seen.add(obj);
        return true;
      },
    );

    await Promise.all(
      uniqueParticipants.map(async (obj) => {
        /* 
          Make sure that only those that have been a part 
          of the group could be added to the group
        */
        const findParticipant =
          await this.databaseService.roomParticipants.findFirst({
            where: { room_id: room_id, user_id: obj },
          });

        if (findParticipant) {
          // We're using the ID taken from 'findParticipant' above
          await this.databaseService.roomParticipants.delete({
            where: { id: findParticipant.id },
          });
        }
      }),
    );

    return { status: 'succeess' };
  }

  async selfDeleteGroupParticipant(requestBody: SelfDeleteGroupParticipant) {
    this.validationService.validate(
      ChatValidation.SELFDELETEGROUPPARTICIPANT,
      requestBody,
    );

    /* 
      Check if the user exit ir not. 
      If not, then simply don't execute the rest of the logic
    */
    const { user, room_id } = requestBody;
    const checkParticipant =
      await this.databaseService.roomParticipants.findFirst({
        where: { user_id: user, room_id: room_id },
      });
    if (checkParticipant) {
      /* 
        If the user is an admin, then we need 
        to make sure that there are other admins 
        in the group in order to execute the logic
      */
      const { role } = checkParticipant;
      if (role === 'Admin') {
        const countAllAdmins =
          await this.databaseService.roomParticipants.count({
            where: { room_id, role: 'Admin' },
          });
        if (countAllAdmins < 2) {
          throw new RpcException({
            code: 16,
            message: 'Unauthorized',
          });
        }
      }

      await this.databaseService.roomParticipants.delete({
        where: { id: checkParticipant.id },
      });

      this.logger.log(
        `Participant ${user} self-delete from room ${room_id}!`,
        'ChatsService',
      );
    }

    return { status: 'succeeded' };
  }

  async deleteGroup(requestBody: DeleteGroupDto) {
    return { status: 'succeeded - delete group', data: requestBody };
  }
}

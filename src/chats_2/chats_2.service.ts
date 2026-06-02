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
export class Chats2Service {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private validationService: ValidationService,
    private readonly databaseService: DatabaseService,
  ) {}

  async createGroup(requestBody: CreateGrupDto) {
    this.validationService.validate(ChatValidation.CREATEGROUP, requestBody);

    return { data: requestBody };
  }
}

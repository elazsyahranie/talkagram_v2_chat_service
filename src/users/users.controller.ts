import {
  Controller,
  Body,
  Inject,
  // HttpException,
  // HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import {
  MessagePattern,
  // ClientProxy
} from '@nestjs/microservices';
import { GetUserResult, GetUsersResult } from './dto/get-users-result.dto';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly usersService: UsersService,
  ) {}
  // private readonly logger = new MyLoggerService(UsersController.name);

  @MessagePattern({ cmd: 'usersLogin' })
  async login(@Body() request: LoginUserDto) {
    const result = await this.usersService.login(request);
    return {
      data: result,
    };
  }
  @MessagePattern({ cmd: 'usersRegister' })
  async create(@Body() userData: Prisma.UsersCreateInput) {
    const createUser = await this.usersService.create(userData);

    return createUser;
  }

  @MessagePattern({ cmd: 'usersGetProfile' })
  getProfile(@Body() id: string): Promise<GetUserResult> {
    this.logger.log(`Profile ${id} fetched`, 'UsersService');
    return this.usersService.findOne(id);
  }

  @MessagePattern({ cmd: 'usersGetAll' })
  findAll(
    @Body()
    body: {
      page: number;
      limit: number;
      order: string;
      keywords: string;
      role: 'Admin' | 'User';
    },
  ): Promise<GetUsersResult> {
    const { page, limit, order, keywords, role } = body;
    this.logger.log(`Users fetched`, 'UsersService');
    return this.usersService.findAll(page, limit, order, keywords, role);
  }

  @MessagePattern({ cmd: 'usersGetDetail' })
  findOne(@Body() id: string): Promise<GetUserResult> {
    this.logger.log(`User id:${id} fetched`, 'UsersService');
    return this.usersService.findOne(id);
  }

  /* 
    Sending a competely blank form-data would throw error message
    This could be handled by either frontend (not sending the data to API if the form is completely blank)
    Or by backend (make a condition to not process the request any further if the request being sent is blank) 
  */
  @MessagePattern({ cmd: 'usersUpdate' })
  async update(
    @Body() body: { id: string; updatedUser: Prisma.UsersUpdateInput },
  ) {
    const { id, updatedUser } = body;
    return this.usersService.update(id, updatedUser);
  }

  @MessagePattern({ cmd: 'usersDeleteForAdmin' })
  deleteForAdmin(@Body() body: { id: string; admin_id: string }) {
    const { id, admin_id } = body;
    this.logger.log(`Admin ${admin_id} deleted user id:${id}`, 'UsersService');
    return this.usersService.delete(id);
  }

  @MessagePattern({ cmd: 'usersDelete' })
  delete(@Body() id: string) {
    this.logger.log(`User id:${id} deleted`, 'UsersService');
    return this.usersService.delete(id);
  }
}

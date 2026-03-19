import {
  Controller,
  Body,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { Prisma } from '@prisma/client';
import { LoginUserDto } from './dto/login-user.dto';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { MessagePattern, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, timeout, catchError, throwError } from 'rxjs';

@Controller('users')
export class UsersController {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private readonly usersService: UsersService,
    @Inject('MEDIA_SERVICE') private readonly mediaClient: ClientProxy,
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
  async create(
    @Body() userData: Prisma.UsersCreateInput,
    // @UploadedFile() profile: Express.Multer.File,
    // @UploadedFiles()
    // files: {
    //   profile?: Express.Multer.File[];
    //   header?: Express.Multer.File[];
    // },
  ) {
    const createUser = await this.usersService.create(
      userData,
      // files.profile ? files.profile[0] : undefined,
      // files.header ? files.header[0] : undefined,
    );

    try {
      await firstValueFrom(
        this.mediaClient.send({ cmd: 'userImagesAdd' }, userData).pipe(
          timeout(5000),
          catchError((error) => {
            throw new HttpException(
              error.message || 'Media service unavailable',
              error.code || HttpStatus.SERVICE_UNAVAILABLE,
            );
          }),
        ),
      );

      // return result;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException(
        'Media service unavailable',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }

    return createUser;
  }

  @MessagePattern({ cmd: 'usersGetProfile' })
  getProfile(@Body() id: string) {
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
  ) {
    const { page, limit, order, keywords, role } = body;
    return this.usersService.findAll(page, limit, order, keywords, role);
  }

  @MessagePattern({ cmd: 'usersGetDetail' })
  findOne(@Body() id: string) {
    this.logger.log(`User id:${id} fetched`, 'UsersService');
    return this.usersService.findOne(id);
  }

  // Sending a competely blank form-data would throw error message
  // This could be handled by either frontend (not sending the data to API if the form is completely blank)
  // Or by backend (make a condition to not process the request any further if the request being sent is blank)
  @MessagePattern({ cmd: 'usersUpdate' })
  update(@Body() body: { id: string; updatedUser: Prisma.UsersUpdateInput }) {
    const { id, updatedUser } = body;
    return this.usersService.update(
      id,
      updatedUser,
      // files?.profile?.[0],
      // files?.header?.[0],
    );
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

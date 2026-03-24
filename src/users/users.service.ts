import { Injectable, Inject } from '@nestjs/common';
// import type { LoggerService } from '@nestjs/common';
// import { UpdateUserDto } from './dto/update-user.dto';
// import { CreateUserDto } from './dto/create-user.dto';
import { Prisma } from '@prisma/client';
import { DatabaseService } from 'src/database/database.service';
import { ValidationService } from '../common/validation.service';
import { UserValidation } from './users.validation';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginUserDto } from './dto/login-user.dto';
import { v4 as uuidv4 } from 'uuid';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
// import { UserImageDto } from './dto/user-image.dto';
// import { deleteFileIfExists } from 'src/file-upload.util';
import * as dotenv from 'dotenv';
import Redis from 'ioredis';
dotenv.config();
import { RpcException } from '@nestjs/microservices';
// import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: Logger,
    private validationService: ValidationService,
    private jwtService: JwtService,
    private readonly databaseService: DatabaseService,
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
  ) {}

  async create(requestBody: Prisma.UsersCreateInput) {
    let { first_name, middle_name, last_name } = requestBody;
    requestBody.name =
      `${first_name ? first_name : ''} ${middle_name ? middle_name : ''} ${last_name ? last_name : ''}`.trim();

    this.validationService.validate(UserValidation.REGISTER, requestBody);

    const user_id = uuidv4();
    requestBody.id = user_id;
    requestBody.password = await bcrypt.hash(requestBody.password, 10);

    const [emailDuplicate, usernameDuplicate, phoneDuplicate] =
      await Promise.all([
        this.databaseService.users.count({
          where: {
            email: requestBody.email,
          },
        }),
        this.databaseService.users.count({
          where: {
            username: requestBody.username,
          },
        }),
        this.databaseService.users.count({
          where: {
            phone: requestBody.phone,
          },
        }),
      ]);

    if (emailDuplicate != 0)
      // throw new HttpException('Email already used!', 409);
      throw new RpcException({
        code: 10,
        message: 'Email already used!',
      });
    if (usernameDuplicate != 0)
      // throw new HttpException('Username already used!', 409);
      throw new RpcException({
        code: 10,
        message: 'Username already used!',
      });
    if (phoneDuplicate != 0)
      // throw new HttpException('Phone already used!', 409);
      throw new RpcException({
        code: 10,
        message: 'Phone already used!',
      });

    const createUser = await this.databaseService.users.create({
      data: requestBody,
    });

    // if (profile) {
    //   const imageDataBody: UserImageDto = {
    //     filename: profile.filename,
    //     path: profile.path.replace(/\\/g, '/'),
    //     type: 'Profile',
    //     user_id: user_id,
    //   };
    //   await this.databaseService.userImages.create({
    //     data: { ...imageDataBody },
    //   });
    // }

    // if (header) {
    //   const imageDataBody: UserImageDto = {
    //     filename: header.filename,
    //     path: header.path.replace(/\\/g, '/'),
    //     type: 'Header',
    //     user_id: user_id,
    //   };

    //   await this.databaseService.userImages.create({
    //     data: { ...imageDataBody },
    //   });
    // }

    this.logger.log('User created!', 'UsersService');

    return { user_id, name: createUser.name, email: createUser.email };
  }

  async login(requestBody: LoginUserDto) {
    this.validationService.validate(UserValidation.LOGIN, requestBody);

    let findUser = await this.databaseService.users.findFirst({
      where: {
        OR: [
          {
            email: requestBody.email,
          },
          {
            phone: requestBody.phone,
          },
          {
            username: requestBody.username,
          },
        ],
      },
    });
    if (!findUser) {
      throw new RpcException({
        code: 5,
        message: 'No user found!',
      });
    }

    const isPasswordValid = await bcrypt.compare(
      requestBody.password,
      findUser.password,
    );
    if (!isPasswordValid) {
      // throw new RpcException('Password invalid!');
      throw new RpcException({
        code: 16,
        message: 'Password invalid!',
      });
    }

    const token = await this.jwtService.signAsync({
      id: findUser.id,
      name: findUser.name,
      role: findUser.role,
      email: findUser.email,
    });

    this.logger.log('User logged in!', 'UsersService');

    return {
      name: findUser.name,
      email: findUser.email,
      token,
    };
  }

  async findAll(
    page: number,
    limit: number,
    order: string,
    keywords?: string,
    role?: 'Admin' | 'User',
  ) {
    const where: Prisma.UsersWhereInput = {};
    if (keywords)
      // where.name = {
      //   contains: keywords,
      //   mode: 'insensitive',
      // };
      where.OR = [
        {
          name: {
            contains: keywords,
            mode: 'insensitive',
          },
        },
        // {
        //   company: {
        //     name: {
        //       contains: keywords,
        //       mode: 'insensitive',
        //     },
        //   },
        // },
      ];
    if (role) {
      where.role = role;
    }

    const orderBy: Prisma.UsersOrderByWithRelationInput = {};
    if (order === 'a-z') {
      orderBy.name = 'asc';
    } else if (order === 'z-a') {
      orderBy.name = 'desc';
    } else if (order === 'latest') {
      orderBy.createdAt = 'desc';
    } else if (order === 'oldest') {
      orderBy.createdAt = 'asc';
    }

    const totalData = await this.databaseService.users.count({ where });

    const totalPage = Math.ceil(totalData / limit);
    const offset = page * limit - limit;

    const result = await this.databaseService.users.findMany({
      where,
      select: {
        id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        about: true,
        // company: {
        //   select: {
        //     id: true,
        //     code: true,
        //     name: true,
        //     createdAt: true,
        //   },
        // },
        // user_images: {
        //   select: {
        //     id: true,
        //     path: true,
        //     type: true,
        //   },
        // },
      },
      skip: offset,
      take: limit,
      orderBy,
      // omit: { password: true, createdAt: true, updatedAt: true },
      // include: {
      //   company: true,
      //   user_images: true,
      // },
    });
    if (!result.length) {
      // throw new NotFoundException('Not found!');
      throw new RpcException({
        code: 5,
        message: 'Not found!',
      });
    }

    // const finalResult = result.map((obj) => {
    //   const userImages = obj.user_images.length
    //     ? obj.user_images.map((obj) => {
    //         return { ...obj, path: `${process.env.PROJECT_URL}/${obj.path}` };
    //       })
    //     : [];

    //   return { ...obj, user_images: userImages };
    // });

    this.logger.log('Users fetched!', 'UsersService');

    return {
      totalData,
      totalPage,
      page,
      // data: finalResult,
      data: result,
    };
  }

  async findOne(id: string) {
    const cacheKey = `user:${id}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return { data: JSON.parse(cached) };
    }

    const data = await this.databaseService.users.findUnique({
      where: { id },
      // omit: { password: true, createdAt: true, updatedAt: true },
      select: {
        id: true,
        first_name: true,
        middle_name: true,
        last_name: true,
        name: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        about: true,
        // company: {
        //   select: {
        //     id: true,
        //     code: true,
        //     name: true,
        //     createdAt: true,
        //   },
        // },
        // user_images: {
        //   select: {
        //     id: true,
        //     path: true,
        //     type: true,
        //   },
        // },
      },
    });
    if (!data) {
      // throw new NotFoundException(404, 'User not found!');
      throw new RpcException({
        code: 5,
        message: 'User not found!',
      });
    }

    // const userImages = data.user_images.length
    //   ? data.user_images.map((obj) => {
    //       return { ...obj, path: `${process.env.PROJECT_URL}/${obj.path}` };
    //     })
    //   : [];

    // this.logger.log('One user fetched!', 'UsersService');

    // const finalData = { ...data, user_images: userImages };

    // This means that the data cached in Redis would be stored for 3600 seconds (Time-To-Live or TTL)
    // Normally, any caches in Redis should have expiry times instead of being stored permanently
    await this.redis.setex(cacheKey, 3600, JSON.stringify({ ...data }));

    return {
      data,
    };
  }

  // Sekarang tambahkan logic nya untuk hapus data yang di cache
  async update(
    id: string,
    user: Prisma.UsersUpdateInput,
    // profile?: Express.Multer.File,
    // header?: Express.Multer.File,
  ) {
    // Send response if the form-data being sent is blank
    if (!user) {
      return { status: 'success' };
    }

    const findUser = await this.databaseService.users.findUnique({
      where: {
        id,
      },
    });
    if (!findUser) {
      // throw new HttpException('User not found!', 404);
      throw new RpcException({
        code: 5,
        message: 'No user found!',
      });
    }

    // Selesaikan yang ini ya, buat agar bisa kosong semua
    let { first_name, middle_name, last_name } = user;
    user.name =
      `${first_name ? first_name : findUser.first_name ? findUser.first_name : ''} ${middle_name ? middle_name : findUser.middle_name ? findUser.middle_name : ''} ${last_name ? last_name : findUser.last_name ? findUser.last_name : ''}`.trim();

    // Update password only if it's sent
    if (user.password) user.password = await bcrypt.hash(user.password, 10);

    this.validationService.validate(UserValidation.UPDATE, user);

    const cacheKey = `user:${id}`;
    await this.redis.del(cacheKey);

    await this.databaseService.users.update({
      where: { id },
      data: user,
    });

    // if (profile) {
    //   const imageDataBody: UserImageDto = {
    //     filename: profile.filename,
    //     path: profile.path.replace(/\\/g, '/'),
    //     type: 'Profile',
    //     user_id: id,
    //   };
    //   await this.databaseService.$transaction([
    //     // 'delete' only accepts unique columns
    //     // Or you can use 'composite unique key' (although we don't use it here)
    //     this.databaseService.userImages.deleteMany({
    //       where: {
    //         user_id: id,
    //         type: 'Profile',
    //       },
    //     }),
    //     this.databaseService.userImages.create({
    //       data: { ...imageDataBody },
    //     }),
    //   ]);
    // }
    // if (header) {
    //   const imageDataBody: UserImageDto = {
    //     filename: header.filename,
    //     path: header.path.replace(/\\/g, '/'),
    //     type: 'Header',
    //     user_id: id,
    //   };

    //   await this.databaseService.$transaction([
    //     // 'delete' only accepts unique columns
    //     // Or you can use 'composite unique key' (although we don't use it here)
    //     this.databaseService.userImages.deleteMany({
    //       where: {
    //         user_id: id,
    //         type: 'Header',
    //       },
    //     }),
    //     this.databaseService.userImages.create({
    //       data: { ...imageDataBody },
    //     }),
    //   ]);
    // }

    this.logger.log('User updated!', 'UsersService');

    return {
      status: 'success',
    };
  }

  async delete(id: string) {
    const findUser = await this.databaseService.users.findFirst({
      where: {
        id,
      },
      select: {
        id: true,
        // user_images: {
        //   select: {
        //     id: true,
        //     path: true,
        //     type: true,
        //   },
        // },
      },
    });

    if (!findUser) {
      // throw new HttpException('User not found!', 404);
      throw new RpcException({
        code: 5,
        message: 'No user found!',
      });
    }

    const cacheKey = `user:${id}`;
    await this.redis.del(cacheKey);

    await this.databaseService.users.delete({
      where: {
        id,
      },
    });

    // if (findUser.user_images.length) {
    //   const filePaths = findUser.user_images.map((obj) => {
    //     return obj.path;
    //   });
    //   deleteFileIfExists(filePaths);
    // }

    this.logger.log('User deleted!', 'UsersService');

    return { status: 'success' };
  }
}

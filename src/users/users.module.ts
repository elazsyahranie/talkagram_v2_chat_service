import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { DatabaseModule } from 'src/database/database.module';
// import { ValidationService } from 'src/common/validation.service';
import { JwtModule } from '@nestjs/jwt';
import * as dotenv from 'dotenv';
import { AuthModule } from 'src/auth/auth.module';
dotenv.config();
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.TOKEN_SECRET_KEY,
      // signOptions: { expiresIn: '60s' },
      signOptions: {},
    }),
    AuthModule,
    ClientsModule.register([
      {
        name: 'MEDIA_SERVICE',
        transport: Transport.TCP,
        options: {
          host: process.env.MEDIA_SERVICE_HOST || 'localhost',
          port: process.env.MEDIA_SERVICE_PORT
            ? parseInt(process.env.MEDIA_SERVICE_PORT, 10)
            : 3001,
        },
      },
    ]),
  ],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}

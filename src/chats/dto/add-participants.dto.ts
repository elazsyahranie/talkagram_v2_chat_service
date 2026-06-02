import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddParticipantDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsArray()
  @IsString({ each: true })
  @IsNotEmpty()
  participants: string[];

  //   @IsString()
  //   @IsNotEmpty()
  //   admin: string;

  @IsString()
  description: string;

  //   profile: Express.Multer.File;
  //   header: Express.Multer.File;
}

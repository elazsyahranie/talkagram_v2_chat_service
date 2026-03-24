import { IsEmail, IsEnum, IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @IsUUID()
  id: string;

  @IsString()
  first_name: string;

  @IsString()
  middle_name: string;

  @IsString()
  last_name: string;

  @IsString()
  name: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  phone: string;

  @IsEmail()
  @IsNotEmpty()
  password: string;

  @IsEnum(['Admin', 'Intern'], {
    message: 'Invalid input!',
  })
  @IsNotEmpty()
  role: 'Admin' | 'Intern';

  @IsString()
  about: string;

  profile: Express.Multer.File;
  header: Express.Multer.File;
}

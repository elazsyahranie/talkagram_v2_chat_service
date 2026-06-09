import { IsNotEmpty, IsString } from 'class-validator';

export class sendMessageDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsString()
  @IsNotEmpty()
  interlocutor: string;
}

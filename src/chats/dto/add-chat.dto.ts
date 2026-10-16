import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class AddChatDto {
  @IsString()
  @IsNotEmpty()
  room: string;

  @IsArray()
  @IsNotEmpty()
  sender: string;

  @IsString()
  chat: string;
}

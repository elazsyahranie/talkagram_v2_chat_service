import { IsArray, IsNotEmpty, IsString, IsEnum } from 'class-validator';
import { CHAT_TYPE, INVALID_INPUT } from 'src/common/constants/app.constants';

export class AddChatDto {
  @IsString()
  @IsNotEmpty()
  room: string;

  @IsArray()
  @IsNotEmpty()
  sender: string;

  @IsString()
  chat: string;

  @IsEnum(CHAT_TYPE, {
    message: INVALID_INPUT,
  })
  @IsNotEmpty()
  @IsString()
  type: string;
}

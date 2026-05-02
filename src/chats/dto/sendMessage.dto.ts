import { IsString } from 'class-validator';

export class sendMessageDto {
  @IsString()
  message: string;
}

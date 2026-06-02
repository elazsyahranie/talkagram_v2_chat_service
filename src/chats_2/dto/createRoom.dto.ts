import { IsArray, ArrayNotEmpty, IsString } from 'class-validator';

export class CreateRoomDto {
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  interlocutors: string[];
}

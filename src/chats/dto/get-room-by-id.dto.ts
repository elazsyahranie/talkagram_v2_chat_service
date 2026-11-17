import { IsArray, ArrayNotEmpty, IsString, IsNotEmpty } from 'class-validator';

export class GetRoomByIdDto {
  //   @IsArray()
  //   @ArrayNotEmpty()
  @IsString()
  @IsNotEmpty()
  room_id: string;

  @IsString()
  @IsNotEmpty()
  user_id: string;
}

import {
  // IsArray,
  // ArrayNotEmpty,
  IsOptional,
  IsInt,
  Min,
  IsString,
  IsNotEmpty,
} from 'class-validator';

export class GetRoomByIdDto {
  //   @IsArray()
  //   @ArrayNotEmpty()
  @IsString()
  @IsNotEmpty()
  room_id: string;

  @IsString()
  @IsNotEmpty()
  sender_id: string;

  // @IsOptional()
  // @IsInt()
  // @Min(1)
  @IsNotEmpty()
  @IsInt()
  page: number;

  @IsNotEmpty()
  @IsInt()
  limit: number;

  @IsString()
  @IsNotEmpty()
  order: string;

  @IsString()
  @IsNotEmpty()
  keywords: string;
}

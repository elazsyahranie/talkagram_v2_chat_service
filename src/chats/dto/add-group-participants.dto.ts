import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
// import { ArrayMinSize } from 'class-validator';

export class AddGroupParticipants {
  @IsString()
  @IsNotEmpty()
  admin: string;

  @IsString()
  @IsNotEmpty()
  room_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  @ArrayMinSize(1)
  participants: ParticipantDto[];
}

export class ParticipantDto {
  @IsString()
  user: string;

  @IsEnum(['Admin', 'User'], {
    message: 'Invalid input!',
  })
  @IsNotEmpty()
  role: string;
}

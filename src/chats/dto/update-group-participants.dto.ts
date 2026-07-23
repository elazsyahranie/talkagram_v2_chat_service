import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateGroupParticipants {
  @IsString()
  @IsNotEmpty()
  admin_id: string;

  @IsString()
  @IsNotEmpty()
  room_id: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ParticipantDto)
  participants: ParticipantDto[];
}

export class ParticipantDto {
  @IsEnum(['Admin', 'User'], {
    message: 'Invalid input!',
  })
  @IsNotEmpty()
  role: string;
}

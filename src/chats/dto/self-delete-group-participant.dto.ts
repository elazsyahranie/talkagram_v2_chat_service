import { ParticipantDto } from './add-group-participants.dto';
import { IsNotEmpty, IsString } from 'class-validator';
import { PartialType } from '@nestjs/mapped-types';

export class SelfDeleteGroupParticipant extends PartialType(ParticipantDto) {
  @IsString()
  @IsNotEmpty()
  room_id: string;
}

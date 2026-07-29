import {
  AddGroupParticipants,
  ParticipantDto,
} from './add-group-participants.dto';
import {
  IsArray,
  IsNotEmpty,
  IsString,
  ValidateNested,
  IsEnum,
} from 'class-validator';
// import { PartialType } from '@nestjs/mapped-types';

export class SelfUpdateGroupParticipant extends ParticipantDto {}

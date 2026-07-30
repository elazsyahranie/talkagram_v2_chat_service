import {
  IsArray,
  //   IsNotEmpty,
  //   IsString,
  //   ValidateNested,
  //   IsEnum,
  ArrayMinSize,
} from 'class-validator';
import { AddGroupParticipants } from './add-group-participants.dto';
import { PartialType } from '@nestjs/mapped-types';

export class DeleteGroupParticipants extends PartialType(AddGroupParticipants) {
  @IsArray()
  @ArrayMinSize(1)
  participantsForDeletion: string[];
}

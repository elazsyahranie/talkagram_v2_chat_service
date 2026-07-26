// import {
//   IsArray,
//   IsNotEmpty,
//   IsString,
//   ValidateNested,
//   IsEnum,
//   ArrayMinSize,
// } from 'class-validator';
// import { Type } from 'class-transformer';
import { AddGroupParticipants } from './add-group-participants.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateGroupParticipants extends PartialType(
  AddGroupParticipants,
) {}

// export class UpdateGroupParticipants extends PartialType(AddGroupParticipants) {
//   @IsArray()
//   @ValidateNested({ each: true })
//   @Type(() => ParticipantDto)
//   @ArrayMinSize(1)
//   participants: ParticipantDto[];
// }

// export class ParticipantDto {
//   @IsString()
//   user: string;

//   @IsEnum(['Admin', 'User'], {
//     message: 'Invalid input!',
//   })
//   @IsNotEmpty()
//   role: string;
// }

import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { CreateGroupDto } from './create-group.dto';
import { PartialType } from '@nestjs/mapped-types';

export class UpdateGroupDto extends PartialType(CreateGroupDto) {
  @IsString()
  //   @IsNotEmpty() // The 'room_id' is optional in the DTO but not in the Zod validation
  @IsUUID()
  room_id?: string;

  @IsString()
  name?: string;

  @IsString()
  description?: string;
}

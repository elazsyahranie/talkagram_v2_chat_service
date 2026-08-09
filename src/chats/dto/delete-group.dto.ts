import { IsString, IsNotEmpty, IsUUID } from 'class-validator';
import { CreateGroupDto } from './create-group.dto';
import { PartialType } from '@nestjs/mapped-types';

export class DeleteGroupDto extends PartialType(CreateGroupDto) {
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  room_id: string;
}

import {
  IsArray,
  IsNotEmpty,
  IsString,
  IsUUID,
  ValidateNested,
  ArrayNotEmpty,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateGroupDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  // @IsArray()
  // @ValidateNested({ each: true })
  // @Type(() => RoomParticipantsDto)
  // participants: RoomParticipantsDto[];

  @IsString()
  @IsUUID()
  @IsNotEmpty()
  admin: string;

  @IsArray() // Ensures the property itself is an array
  @ArrayNotEmpty() // Ensures the array is not empty
  @ArrayMinSize(1) // Ensures a minimum number of elements
  @IsString({ each: true }) // Validates every item in the array is a string
  otherParticipants: string[];

  @IsString()
  description: string;
}

// export class RoomParticipantsDto {
//   @IsString()
//   @IsUUID()
//   @IsNotEmpty()
//   user: string;

//   @IsEnum(['Admin', 'User'], {
//     message: 'Invalid input!',
//   })
//   @IsNotEmpty()
//   role: 'Admin' | 'User';
// }

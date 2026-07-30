import { z, ZodType } from 'zod';

export class ChatValidation {
  static readonly CREATEROOM: ZodType = z.object({
    name: z.string().min(1).max(100),
    participants: z
      .array(z.string())
      .min(2, 'At least two participants are needed'),
    about: z.string().min(1).max(100).optional(),
  });

  static readonly PARTICIPANTS: ZodType = z.object({
    user: z.string().min(1).max(100),
    role: z.literal(['Admin', 'User'], {
      error: (iss) =>
        iss.input === undefined ? 'Role is required!' : 'Invalid input!',
    }),
  });

  static readonly ADDGROUPPARTICIPANTS: ZodType = z.object({
    admin: z.string().min(1).max(100),
    room_id: z.string().min(1).max(100),
    participants: z
      .array(this.PARTICIPANTS)
      .min(1, 'At least one participant is required')
      .max(100),
    // about: z.string().min(1).max(100).optional(),
  });

  static readonly SELFUPDATEGROUPPARTICIPANT: ZodType = z.object({
    user: z.string().min(1).max(100),
    room_id: z.string().min(1).max(100),
    role: z.literal(['Admin', 'User'], {
      error: (iss) =>
        iss.input === undefined ? 'Role is required!' : 'Invalid input!',
    }),
  });

  static readonly UPDATEGROUPPARTICIPANTS: ZodType = z.object({
    admin: z.string().min(1).max(100),
    room_id: z.string().min(1).max(100),
    participants: z
      .array(this.PARTICIPANTS)
      .min(1, 'At least one participant is required')
      .max(100),
  });

  static readonly UPDATEGROUP: ZodType = z.object({
    name: z.string().min(1).max(100).optional(),
    room_id: z.string().min(1).max(100),
    // participants: z.array(z.string()).optional(),
    about: z.string().min(1).max(100).optional(),
  });

  static readonly DELETEGROUPPARTICIPANTS: ZodType = z.object({
    admin: z.string().min(1).max(100),
    room_id: z.string().min(1).max(100),
    participantsForDeletion: z
      .array(z.string().trim().min(1, 'At least one participant is required'))
      .min(1, 'At least one participant is required')
      .max(100),
  });

  // Custom, more permissive validation (if needed)
  // const permissiveUuid = z.string().refine((val) =>
  //   /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(val),
  //   { message: "Invalid UUID format" }
  // );

  static readonly CREATEGROUP: ZodType = z.object({
    name: z
      .string('Group name required!')
      .min(1, 'Group name required!')
      .max(100),
    admin: z.uuid(),
    otherParticipants: z
      .array(z.string())
      .min(1, 'At least another participant is needed'),
    // participants: z
    //   .array(this.PARTICIPANTS)
    //   .min(2, 'At least two participants are needed'),
    // participants: z
    //   .array(
    //     z.object({
    //       user: z.string(),
    //       role: z.literal(['Admin', 'User'], {
    //         error: (iss) =>
    //           iss.input === undefined ? 'Role is required!' : 'Invalid input!',
    //       }),
    //     }),
    //   )
    //   .min(2, 'At least two participants are needed'),
    about: z.string().min(1).max(100).optional(),
  });
}

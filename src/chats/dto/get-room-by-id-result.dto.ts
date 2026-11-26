export interface GetRoomByIdResult {
  totalData: number;
  totalPage: number;
  page: number;
  data: ChatsData[];
  room: RoomData | null;
}

export interface ChatsData {
  id: string;
  sender: string;
  chat: string;
  createdAt: Date;
  updatedAt: Date;
  room_id: string;
  type: string | null;
}

export interface RoomData {
  id: string;
  name: string | null;
  type: string;
  description: string | null;
  rooms_participants: RoomParticipantsData[];
}

export interface RoomParticipantsData {
  id: string;
  user_id: string;
  room_id: string;
  role: string;
  description: string | null;
}

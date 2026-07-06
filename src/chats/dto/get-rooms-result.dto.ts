export class GetRoomsData {
  data: RoomsData[];
}

export class GetRoomsResult {
  totalData: number;
  totalPage: number;
  page: number;
  data: RoomsData[];
}

export class RoomsData {
  id: string;
  name: string | null;
  type: string;
  // latest_chat_id: string | null;
  lastActivityAt: Date | null;
  latestChat: {
    id: string;
    // createdAt: Date;
    sender: string;
    chat: string;
  } | null;
  // rooms_participants: {
  //   id: string;
  //   user_id: string;
  // }[];
}

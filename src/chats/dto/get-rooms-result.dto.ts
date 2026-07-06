export class GetRoomsData {
  data: RoomsData[];
}

export class RoomsData {
  id: string;
  name: string | null;
  type: string;
  latest_chat_id: string | null;
  latestChat: {
    id: string;
    createdAt: Date;
    sender: string;
    chat: string;
  } | null;
}

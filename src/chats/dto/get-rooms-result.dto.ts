export class GetRoomsData {
  data: RoomsData[];
}

export class RoomsData {
  id: string;
  name: string | null;
  type: string;
}

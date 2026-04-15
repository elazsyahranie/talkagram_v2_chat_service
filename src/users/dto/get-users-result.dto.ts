// import { IsNotEmpty, IsString } from 'class-validator';

export class GetUserResult {
  data: UserData;
}

export class GetUsersResult {
  totalData: number;
  totalPage: number;
  page: number;
  data: UserData[];
}

export class UserData {
  id: string;
  first_name: string | null;
  middle_name: string | null;
  last_name: string | null;
  name: string;
  username: string;
  email: string;
  phone: string;
  role: string;
  about: string | null;
}

export class UserImagesResult {
  id: string;
  user_id: string;
  path: string;
  type: string;
}

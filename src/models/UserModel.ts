export interface UserCreateRequest {
  username: string;

  password: string;

  nickname: string;

  gander: Gender;
}

export enum Gender {
  MALE = '男',
  FEMALE = '女',
  UNKNOWN = '未知'
}

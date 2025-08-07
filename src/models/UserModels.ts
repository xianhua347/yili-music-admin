/**
 * User Value Object
 */
export interface UserVO {
  id?: number;
  username?: string;
  nickname?: string;
  gender?: string;
  locked?: boolean;
  enabled?: boolean;
  lastLoginIp?: string;
  lastLoginTime?: string;
  createdTime?: string;
  updatedTime?: string;
  roles?: string[]; // Assuming roles is an array of strings
}

/**
 * User Create Data Transfer Object
 */
export interface UserCreateDTO {
  username?: string;
  password?: string;
  nickname?: string;
  gender?: string;
}

/**
 * User Update Data Transfer Object
 */
export interface UserUpdateDTO {
  nickname?: string;
  gender?: string;
  locked?: boolean;
  enabled?: boolean;
  roles?: string[]; // Assuming roles is an array of strings
}

/**
 * User Query Request
 */
export interface UserQueryRequest {
  username?: string;
  nickname?: string;
  gender?: string;
  locked?: boolean;
  enabled?: boolean;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export type JwtResponse = RefreshTokenResponse & {
  expiryDate: Date;
};

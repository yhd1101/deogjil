import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadInterface } from './tokenPayload.interface';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  //토큰 생성함수
  public generateAccessToken(userId: string) {
    const payload: TokenPayloadInterface = { userId };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESSTOKEN_SECRET_KEY'),
      expiresIn: `${this.configService.get('ACCESSTOKEN_EXPIRATION_TIME')}m`,
    });
    return `Authentication=${accessToken}; HttpOnly; path=/; Max-Age=${this.configService.get(
      'ACCESSTOKEN_EXPIRATION_TIME',
    )}`;

    // return accessToken;
  }

  public generateRefreshToken(userId: string) {
    const payload: TokenPayloadInterface = { userId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESHTOKEN_SECRET_KEY'),
      expiresIn: `${this.configService.get('REFRESHTOKEN_EXPIRATION_TIME')}`,
    });
    //프론트에 쿠키 담아줌
    const cookie = `Refresh=${refreshToken}; HttpOnly; path=/; Max-Age=${this.configService.get(
      'REFRESHTOKEN_EXPIRATION_TIME',
    )}`;

    return { cookie, refreshToken };
  }
  //로그아웃
  public getCookiesForLogOut() {
    return [`Authentication=; HttpOnly; path=/; Max-Age=0`];
  }
}

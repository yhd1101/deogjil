import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';
import { TokenPayloadInterface } from '../tokenPayload.interface';
import { Request } from 'express';

@Injectable()
export class JwtRefreshAuthStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh-token',
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly usersService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          return req?.cookies?.Refresh;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      secretOrKey: configService.get('REFRESHTOKEN_SECRET_KEY'),
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: TokenPayloadInterface) {
    const refreshToken = req.cookies?.Refresh;

    // 검증 로직 추가
    const isValid = await this.usersService.getUserIfRefreshTokenMatches(
      refreshToken,
      payload.userId,
    );

    if (!isValid) {
      req.res.clearCookie('Refresh');
      throw new UnauthorizedException('Refresh token expired or invalid');
    }

    // 유효한 경우, 사용자 객체를 반환
    return this.usersService.getUserById(payload.userId);
  }
}

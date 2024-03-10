import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadInterface } from '../tokenPayload.interface';

@Injectable()
export class JwtAccessAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  private extractedToken: string; // 추출된 토큰을 저장할 변수
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: (req) => {
        const authHeader = req.headers['authorization'];
        if (!authHeader) {
          throw new UnauthorizedException('Authorization header is missing');
        }
        this.extractedToken = authHeader.split(' ')[1]; // 토큰을 저장
        return this.extractedToken;
      },
      secretOrKey: configService.get('ACCESSTOKEN_SECRET_KEY'),
    });
  }

  async validate(payload: TokenPayloadInterface) {
    const access = this.extractedToken;
    const isBlacklisted = await this.userService.isTokenBlacklisted(access);
    if (isBlacklisted) {
      throw new UnauthorizedException('Token is blacklisted');
    }
    // 저장된 토큰 사용
    console.log('Using extracted token:', this.extractedToken);
    return this.userService.getUserById(payload.userId);
  }
}

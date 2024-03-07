import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserService } from '../../user/user.service';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadInterface } from '../tokenPayload.interface';

@Injectable()
export class JwtAccessAuthStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private userService: UserService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('ACCESSTOKEN_SECRET_KEY'),
    });
  }

  async validate(payload: TokenPayloadInterface) {
    console.log('2222', payload);
    return this.userService.getUserById(payload.userId);
  }
}

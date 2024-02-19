import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Reflector } from '@nestjs/core';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadInterface } from '../tokenPayload.interface';
import { UserService } from '../../user/user.service'; // UserService 경로에 맞게 수정

@Injectable()
export class OptionalJwtAuthStrategy
  extends PassportStrategy(Strategy, 'optional-jwt')
  implements CanActivate
{
  constructor(
    private readonly reflector: Reflector,
    private readonly configService: ConfigService,
    private readonly userService: UserService, // UserService 주입
  ) {
    super(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: configService.get('ACCESSTOKEN_SECRET_KEY'),
      },
      'optional-jwt-auth-strategy',
    );
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 로그인 여부를 확인하지 않고 항상 권한을 허용하도록 수정
    return true;
  }

  async validate(payload: TokenPayloadInterface) {
    console.log('Token Payload:', payload);

    // payload에서 userId를 추출하여 UserService를 사용하여 유저 정보를 가져옴
    const user = await this.userService.getUserById(payload.userId);

    // user 정보를 반환
    return user;
  }
}

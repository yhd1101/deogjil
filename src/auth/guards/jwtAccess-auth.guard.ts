import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard('jwt') {
  handleRequest(err, user, info) {
    // Passport에서 발생한 인증 관련 오류 처리
    if (err || !user) {
      if (err && err.name === 'TokenExpiredError') {
        throw new UnauthorizedException('Expired AccessToken');
      }
      throw err || new UnauthorizedException();
    }
    return user;
  }
}

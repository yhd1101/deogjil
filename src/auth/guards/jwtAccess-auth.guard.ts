import { ExecutionContext, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAccessAuthGuard extends AuthGuard('jwt') {
  // canActivate(context: ExecutionContext) {
  //   const request = context.switchToHttp().getRequest();
  //   const isSpecificEndpoint = request.route.path === '/api/content'; // 해당 엔드포인트의 경로를 정확하게 지정해주세요.
  //
  //   if (isSpecificEndpoint) {
  //     return true;
  //   }
  //
  //   return super.canActivate(context);
  // }
}

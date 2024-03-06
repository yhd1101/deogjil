import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { KakaoAuthStrategy } from './strategies/kakao-auth.strategy';
import { JwtAccessAuthStrategy } from './strategies/jwtAccess-auth.strategy';

import { LocalAuthStrategy } from './strategies/local-auth.strategy';
import { JwtRefreshAuthStrategy } from './strategies/jwtRefresh-auth.strategy';

@Module({
  imports: [ConfigModule, UserModule, JwtModule.register({}), PassportModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    LocalAuthStrategy,
    JwtAccessAuthStrategy,
    JwtRefreshAuthStrategy,
    KakaoAuthStrategy,
  ],
})
export class AuthModule {}

import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ConfigModule } from '@nestjs/config';
import { UserModule } from '../user/user.module';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { KakaoAuthStrategy } from './strategies/kakao-auth.strategy';
import { JwtAuthStrategy } from './strategies/jwt-auth.strategy';

@Module({
  imports: [ConfigModule, UserModule, JwtModule.register({}), PassportModule],
  controllers: [AuthController],
  providers: [AuthService, JwtAuthStrategy, KakaoAuthStrategy],
})
export class AuthModule {}

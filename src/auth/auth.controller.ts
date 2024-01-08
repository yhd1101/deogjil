import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  UseGuards,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { UserService } from '../user/user.service';
import { JwtRefreshAuthGuard } from './guards/jwtRefresh-auth.guard';
import { RequestWithUserInterface } from './requestWithUser.interface';
import { JwtAccessAuthGuard } from './guards/jwtAccess-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @HttpCode(200)
  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @HttpCode(200)
  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async kakaoLoginCallBack(@Req() req: any): Promise<any> {
    const { user } = req;
    console.log('111111', user);
    const accessToken = await this.authService.generateAccessToken(user.id);
    const { cookie: refreshTokenCookie, refreshToken } =
      await this.authService.generateRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    req.res.setHeader('Set-Cookie', [accessToken, refreshTokenCookie]);
    return user;
    //return { accessToken, refreshToken, user };
  }

  //refreshtoken api
  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh')
  async refreshToken(@Req() req: RequestWithUserInterface) {
    const accessTokenCookie = await this.authService.generateAccessToken(
      req.user.id,
    );
    req.res.setHeader('Set-Cookie', accessTokenCookie);
    return req.user;
  }

  //로그아웃
  @UseGuards(JwtAccessAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logOut(@Req() req: RequestWithUserInterface) {
    await this.userService.removeRefreshToken(req.user.id);
    req.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }
}

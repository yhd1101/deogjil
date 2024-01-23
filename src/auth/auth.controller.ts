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
  Res,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { KakaoAuthGuard } from './guards/kakao-auth.guard';
import { UserService } from '../user/user.service';
import { JwtRefreshAuthGuard } from './guards/jwtRefresh-auth.guard';
import { RequestWithUserInterface } from './requestWithUser.interface';
import { JwtAccessAuthGuard } from './guards/jwtAccess-auth.guard';
import {
  ApiBody,
  ApiCreatedResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { User } from '../user/entities/user.entity';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { LocalAuthGuard } from './guards/local-auth.guard';
@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('signup')
  @ApiCreatedResponse({
    description: 'the record has been success with user',
    type: User,
  }) //성공시 응답을 해주겠다.
  async userSignup(@Body() createUserDto: CreateUserDto) {
    return await this.authService.createUser(createUserDto);
  }

  @Post('login')
  @ApiOperation({ summary: '로그인API', description: '로그인해주는 api' })
  @ApiCreatedResponse({ description: '로그인함', type: User })
  @ApiBody({ type: LoginUserDto })
  @HttpCode(200)
  @UseGuards(LocalAuthGuard) //Guard에서 검증됨
  async userLogin(@Req() req: RequestWithUserInterface) {
    const user = req.user;
    const accessToken = await this.authService.generateAccessToken(user.id);
    const { cookie: refreshTokenCookie, refreshToken } =
      await this.authService.generateRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    req.res.setHeader('Set-Cookie', [accessToken, refreshTokenCookie]);

    return user;
    // return await this.authService.Login(loginUserDto);
  }

  @HttpCode(200)
  @Get('kakao')
  @UseGuards(KakaoAuthGuard)
  async kakaoLogin(): Promise<any> {
    return HttpStatus.OK;
  }

  @HttpCode(200)
  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async kakaoLoginCallBack(@Req() req: any, @Res() res: any): Promise<any> {
    const { user } = req;
    console.log('111111', user);

    // 액세스 토큰 생성
    const accessToken = await this.authService.generateAccessToken(user.id);

    // 리프레시 토큰 및 쿠키 생성
    const { cookie: refreshTokenCookie, refreshToken } =
      await this.authService.generateRefreshToken(user.id);

    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    user.currentHashedRefreshToken = undefined;

    // 쿠키 설정 및 리다이렉트
    res.setHeader('Set-Cookie', [refreshTokenCookie]);
    res.setHeader('Authorization', 'Bearer ' + accessToken);
    res.redirect('http://localhost:3000/api/auth/kakao/callback');
    // return { accessToken, user };
  }

  // @HttpCode(200)
  // @Get('kakao/callback')
  // @UseGuards(KakaoAuthGuard)
  // async kakaoLoginCallBack(@Res() res: any): Promise<any> {
  //   const { user } = req;
  //   console.log('111111', user);
  //   const accessToken = await this.authService.generateAccessToken(user.id);
  //   const { cookie: refreshTokenCookie, refreshToken } =
  //     await this.authService.generateRefreshToken(user.id);
  //   await this.userService.setCurrentRefreshToken(refreshToken, user.id);
  //   user.currentHashedRefreshToken = undefined;
  //
  //   // 액세스 토큰을 URL에 포함시켜 리다이렉트
  //   res.redirect(`/success?accessToken=${encodeURIComponent(accessToken)}`);
  //   // 또는 클라이언트에게 전달할 수 있는 다른 방식을 사용할 수 있음
  //
  //   // 리프레시 토큰을 쿠키에 담아 전달
  //   res.setHeader('Set-Cookie', [refreshTokenCookie]);
  //   //return { accessToken, user };
  //   //return { accessToken, refreshToken, user };
  // }

  // @HttpCode(200)
  // @Get('kakao/callback')
  // @UseGuards(KakaoAuthGuard)
  // async kakaoLoginCallBack(@Req() req: any): Promise<any> {
  //   const { user } = req;
  //   console.log('111111', user);
  //   const accessToken = await this.authService.generateAccessToken(user.id);
  //   const { cookie: refreshTokenCookie, refreshToken } =
  //     await this.authService.generateRefreshToken(user.id);
  //   await this.userService.setCurrentRefreshToken(refreshToken, user.id);
  //   user.currentHashedRefreshToken = undefined;
  //   req.res.setHeader('Set-Cookie', [refreshTokenCookie]);
  //   return { accessToken, user };
  //   //return { accessToken, refreshToken, user };
  // }

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

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
  Query,
  BadRequestException,
  UnauthorizedException,
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
  ApiQuery,
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
    req.res.setHeader('Set-Cookie', [refreshTokenCookie]);

    return { accessToken, user };
    // return await this.authService.Login(loginUserDto);
  }

  // @Post('/kakaologin')
  // async kakaoLogin(@Body() body: any, @Res() res): Promise<any> {
  //   try {
  //     const { code, domain } = body;
  //     if (!code || !domain) {
  //       throw new BadRequestException('카카오 정보가 없습니다.');
  //     }
  //
  //     // 카카오 토큰 조회 후 계정 정보 가져오기
  //     const kakao = await this.authService.kakaoLogin({ code, domain });
  //
  //     console.log(`kakaoUserInfo : ${JSON.stringify(kakao)}`);
  //     if (!kakao.id) {
  //       throw new BadRequestException('카카오 정보가 없습니다.');
  //     }
  //
  //     // 카카오 계정 정보를 기반으로 액세스 토큰 및 리프레시 토큰 발급
  //     const accessToken = await this.authService.generateAccessToken(kakao.id);
  //     const { cookie: refreshTokenCookie, refreshToken } =
  //       await this.authService.generateRefreshToken(kakao.id);
  //     await this.userService.setCurrentRefreshToken(refreshToken, kakao.id);
  //
  //     // 리프레시 토큰 쿠키 설정
  //     res.setHeader('Set-Cookie', [refreshTokenCookie]);
  //
  //     // 클라이언트로 액세스 토큰 및 사용자 정보 전달
  //     res.send({
  //       accessToken,
  //       user: kakao,
  //       message: 'success',
  //     });
  //   } catch (e) {
  //     console.log(e);
  //     throw new UnauthorizedException();
  //   }
  // }

  // @HttpCode(200)
  // @Get('kakao')
  // @UseGuards(KakaoAuthGuard)
  // async kakaoLogin(): Promise<any> {
  //   return HttpStatus.OK;
  // }

  @Get('kakao/callback')
  @UseGuards(KakaoAuthGuard)
  async handleKakaoCallback(@Req() req: RequestWithUserInterface) {
    const user = req.user;
    const accessToken = await this.authService.generateAccessToken(user.id);
    const { cookie: refreshTokenCookie, refreshToken } =
      await this.authService.generateRefreshToken(user.id);
    await this.userService.setCurrentRefreshToken(refreshToken, user.id);
    req.res.setHeader('Set-Cookie', [refreshTokenCookie]);

    return { accessToken, user };
  }

  // @HttpCode(200)
  // @Get('kakao/callback')
  // @UseGuards(KakaoAuthGuard)
  // async kakaoLoginCallBack(@Req() req: any, @Res() res: any): Promise<any> {
  //   const { user } = req;
  //   console.log('111111', user);
  //
  //   // 액세스 토큰 생성
  //   const accessToken = await this.authService.generateAccessToken(user.id);
  //
  //   // 리프레시 토큰 및 쿠키 생성
  //   const { cookie: refreshTokenCookie, refreshToken } =
  //     await this.authService.generateRefreshToken(user.id);
  //
  //   await this.userService.setCurrentRefreshToken(refreshToken, user.id);
  //   user.currentHashedRefreshToken = undefined;
  //
  //   // 쿠키 설정 및 리다이렉트
  //   res.setHeader('Set-Cookie', [refreshTokenCookie]);
  //   res.setHeader('Authorization', 'Bearer ' + accessToken);
  //   res.redirect('http://localhost:3000/api/auth/kakao/callback');
  //   // return { accessToken, user };
  // }
  //

  // @HttpCode(200)
  // @Get('authorize')
  // @UseGuards(KakaoAuthGuard)
  // async kakaoauhtorize() {
  //   return HttpStatus.OK;
  // }
  //
  // @HttpCode(200)
  // @Get('token')
  // @UseGuards(KakaoAuthGuard)
  // async requestToken(@Req() req: any): Promise<any> {
  //   const { user } = req;
  //   const accessToken = await this.authService.generateAccessToken(user.id);
  //   const { cookie: refreshTokenCookie, refreshToken } =
  //     await this.authService.generateRefreshToken(user.id);
  //   await this.userService.setCurrentRefreshToken(refreshToken, user.id);
  //   user.currentHashedRefreshToken = undefined;
  //   req.res.setHeader('Set-Cookie', [refreshTokenCookie]);
  //   return { accessToken, user };
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

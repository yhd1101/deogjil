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
  Req,
  Res,
  Query,
  BadRequestException,
  UnauthorizedException,
  UseInterceptors,
  UploadedFile,
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
  ApiBearerAuth,
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
import { FileInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/utils/multer.options';
import { UpdateUserDto } from '../user/dto/update-user.dto';
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
  @ApiOperation({
    summary: '로그인API',
    description: '로그인해주는 api입니다 login',
  })
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

  @Get('profile')
  @ApiBearerAuth('access-token')
  @HttpCode(200)
  @ApiOperation({ summary: '프로필정보', description: '프로필정보 불러오기' })
  @UseGuards(JwtAccessAuthGuard)
  async getUserInfo(@Req() req: RequestWithUserInterface) {
    const { user } = req;
    const data = await this.authService.profile(user.id);
    user.password = undefined;
    return { data };
  }
  @Patch()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @UseInterceptors(FileInterceptor('files'))
  @ApiOperation({
    summary: '유저 업데이트',
    description: '유저정보 업데이트 닉네임 10자이내',
  })
  async updateUser(
    @Req() req: RequestWithUserInterface,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const { user } = req;
    return await this.authService.updateProfile(user.id, updateUserDto, file);
  }
  @Get('check')
  @ApiOperation({
    summary: '닉네임 중복체크',
    description: '닉네임 중복체크 true면 중복 ',
  })
  async checkNickname(
    @Query('nickname') nickname: string,
  ): Promise<{ isDuplicate: boolean }> {
    const isDuplicate = await this.userService.checkNicknameDuplicate(nickname);
    return { isDuplicate };
  }

  @Delete()
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: '계정삭제', description: '계정삭제' })
  async deleteUser(@Req() req: RequestWithUserInterface) {
    const { user } = req;
    return await this.authService.delete(user.id);
  }

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

  @UseGuards(JwtRefreshAuthGuard)
  @ApiBearerAuth('access-token')
  @Get('refresh')
  async refreshToken(@Req() req: RequestWithUserInterface) {
    const accessTokenCookie = await this.authService.generateAccessToken(
      req.user.id,
    );
    req.res.setHeader('Set-Cookie', accessTokenCookie);
    return req.user;
  }

  @UseGuards(JwtAccessAuthGuard)
  @ApiBearerAuth('access-token')
  @Post('logout')
  @HttpCode(200)
  async logOut(@Req() req: RequestWithUserInterface) {
    await this.userService.removeRefreshToken(req.user.id);
    req.res.setHeader('Set-Cookie', this.authService.getCookiesForLogOut());
  }
}

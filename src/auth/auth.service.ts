import {
  HttpException,
  HttpStatus,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadInterface } from './tokenPayload.interface';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { Provider } from '../user/entities/provider.enum';
import * as qs from 'qs';
import axios from 'axios';
import { UpdateUserDto } from '../user/dto/update-user.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async createUser(createUserDto: CreateUserDto) {
    const user = await this.userService.CreateUser({
      ...createUserDto,
      provider: Provider.LOCAL,
    });
    user.password = undefined;
    console.log(user);

    return user;
  }
  async profile(id: string) {
    const userInfo = await this.userService.getUserInfo(id);

    return userInfo;
  }
  // async logout(token: string) {
  //   const logoutToken = await this.userService.addToBlacklist(token);
  //   return logoutToken;
  // }

  async updateProfile(
    id: string,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    const user = await this.userService.updateUser(id, updateUserDto, file);
    return user;
  }
  async delete(id: string) {
    const userInfo = await this.userService.deleteByUser(id);
    return userInfo;
  }

  async Login(loginUserDto: LoginUserDto) {
    const user = await this.userService.getUserByEmail(loginUserDto.email);
    const isPasswordMatched = await user.validatePassword(
      loginUserDto.password,
    );

    if (!isPasswordMatched) {
      throw new HttpException(
        'Password do not matched',
        HttpStatus.BAD_REQUEST,
      );
    } //email에서 입력한 패스워드랑 우리가 찾는 패스워드가 같지 않으면
    // user.password = undefined;
    return user;
  }

  //토큰 생성함수
  public generateAccessToken(userId: string) {
    const payload: TokenPayloadInterface = { userId };
    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.get('ACCESSTOKEN_SECRET_KEY'),
      expiresIn: `${this.configService.get('ACCESSTOKEN_EXPIRATION_TIME')}m`,
    });
    return accessToken;
  }

  public generateRefreshToken(userId: string) {
    const payload: TokenPayloadInterface = { userId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESHTOKEN_SECRET_KEY'),
      expiresIn: `${this.configService.get('REFRESHTOKEN_EXPIRATION_TIME')}m`,
    });
    //
    const cookie = `Refresh=${refreshToken}; HttpOnly; Secure; path=/; Max-Age=${this.configService.get(
      'REFRESHTOKEN_EXPIRATION_TIME',
    )}; SameSite=None; Domain=.dukpool.co.kr`;
    // const cookie = `Refresh=${refreshToken}; HttpOnly; SameSite=None; path=/; Max-Age=${this.configService.get(
    //   'REFRESHTOKEN_EXPIRATION_TIME',
    // )}; Domain=localhost`;

    return { cookie, refreshToken };
  }

  //로그아웃
  public getCookiesForLogOut() {
    return [`Authentication=; HttpOnly; path=/; Max-Age=0`];
  }
}

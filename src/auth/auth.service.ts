import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenPayloadInterface } from './tokenPayload.interface';
import { CreateUserDto } from '../user/dto/create-user.dto';
import { LoginUserDto } from '../user/dto/login-user.dto';
import { Provider } from '../user/entities/provider.enum';

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

    return user;
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
    // return `Authentication=${accessToken}; HttpOnly; path=/; Max-Age=${this.configService.get(
    //   'ACCESSTOKEN_EXPIRATION_TIME',
    // )}`;

    return accessToken;
  }

  public generateRefreshToken(userId: string) {
    const payload: TokenPayloadInterface = { userId };
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get('REFRESHTOKEN_SECRET_KEY'),
      expiresIn: `${this.configService.get('REFRESHTOKEN_EXPIRATION_TIME')}`,
    });
    //프론트에 쿠키 담아줌
    const cookie = `Refresh=${refreshToken}; HttpOnly; path=/; Max-Age=${this.configService.get(
      'REFRESHTOKEN_EXPIRATION_TIME',
    )}`;

    return { cookie, refreshToken };
  }
  //로그아웃
  public getCookiesForLogOut() {
    return [`Authentication=; HttpOnly; path=/; Max-Age=0`];
  }
}

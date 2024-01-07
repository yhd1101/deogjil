import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-kakao';
import { Provider } from '../../user/entities/provider.enum';
import { ConfigService } from '@nestjs/config';
import { UserService } from '../../user/user.service';

@Injectable()
export class KakaoAuthStrategy extends PassportStrategy(
  Strategy,
  Provider.KAKAO,
) {
  constructor(
    private readonly configService: ConfigService,
    private readonly userService: UserService,
  ) {
    super({
      clientID: configService.get('KAKAO_AUTH_CLIENTID'),
      callbackURL: configService.get('KAKAO_AUTH_CALLBACK_URL'),
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: any,
  ): Promise<any> {
    const { displayName, provider } = profile;
    const { profile_image } = profile._json.properties;
    const { email } = profile._json.kakao_account;
    const userInput = {
      name: displayName,
      email,
      provider,
      profileImg: profile_image,
    };
    console.log(userInput);
    try {
      const user = await this.userService.getUserByEmail(email);
      if (user.provider !== provider) {
        throw new HttpException(
          `You are already subscribed to ${user.provider}`,
          HttpStatus.CONFLICT,
        );
      }
      done(null, user);
    } catch (err) {
      if (err.status === 404) {
        const newUser = await this.userService.CreateUser({
          email,
          name: displayName,
          provider,
          profileImg: profile_image,
        });
        done(null, newUser);
      }
    }
  }
}

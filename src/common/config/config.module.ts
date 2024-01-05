import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from '@hapi/joi';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        POSTGRES_HOST: Joi.string().required(),
        POSTGRES_PORT: Joi.number().required(),
        POSTGRES_USERNAME: Joi.string().required(),
        POSTGRES_PASSWORD: Joi.string().required(),
        POSTGRES_DB: Joi.string().required(),

        ACCESSTOKEN_SECRET_KEY: Joi.string().required(),
        ACCESSTOKEN_EXPIRATION_TIME: Joi.number().required(),

        KAKAO_AUTH_CLIENTID: Joi.string().required(),
        KAKAO_AUTH_CALLBACK_URL: Joi.string().required(),
      }),
    }),
  ],
})
export class AppConfigModule {}

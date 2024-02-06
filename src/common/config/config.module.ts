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

        REFRESHTOKEN_SECRET_KEY: Joi.string().required(),
        REFRESHTOKEN_EXPIRATION_TIME: Joi.string().required(),

        KAKAO_AUTH_CLIENTID: Joi.string().required(),
        KAKAO_AUTH_CALLBACK_URL: Joi.string().required(),

        AWS_S3_ACCESS_KEY: Joi.string().required(),
        AWS_S3_SECRET_KEY: Joi.string().required(),
        AWS_S3_REGION: Joi.string().required(),
        AWS_S3_BUCKET_NAME: Joi.string().required(),
      }),
    }),
  ],
})
export class AppConfigModule {}

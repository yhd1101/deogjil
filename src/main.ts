import { NestFactory, Reflector } from '@nestjs/core';
import { AppModule } from './app.module';
import { BaseAPIDocument } from './common/config/swagger.document';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ClassSerializerInterceptor, ValidationPipe } from '@nestjs/common';
import { TransformInterceptor } from './common/interceptors/transfrom.interceptor';
import * as path from 'path';
import { NestExpressApplication } from '@nestjs/platform-express';
import passport from 'passport';
import * as expressBasicAuth from 'express-basic-auth';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:8000',
      'http://localhost:8000/api-docs',
      'https://www.dukpool.co.kr',
      'http://localhost:3000',
    ],
    credentials: true,
  });
  app.setGlobalPrefix('api');
  app.useGlobalFilters(new HttpExceptionFilter());
  app.useGlobalInterceptors(new ClassSerializerInterceptor(app.get(Reflector)));
  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalPipes(new ValidationPipe({ transform: true })); //적용을하겠다
  app.use(
    //이 부분 추가
    ['/api-docs'], // docs(swagger end point)에 진입시
    expressBasicAuth({
      challenge: true,
      users: {
        [process.env.SWAGGER_USER]: process.env.SWAGGER_PASSWORD, // 지정된 ID/비밀번호
      },
    }),
  );

  const config = new BaseAPIDocument().initializeOptions();
  const documet = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, documet);
  app.useStaticAssets(path.join(__dirname, './common', 'uploads'), {
    prefix: '/media',
  });
  await app.listen(8000);
}
bootstrap();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BaseAPIDocument } from './common/config/swagger.document';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors();
  app.setGlobalPrefix('api');

  const config = new BaseAPIDocument().initializeOptions();
  const documet = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, documet);

  await app.listen(8000);
}
bootstrap();

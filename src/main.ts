import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BaseAPIDocument } from './common/config/swagger.document';
import { SwaggerModule } from '@nestjs/swagger';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'http://localhost:8000',
      'http://localhost:8000/api-docs',
    ],
    credentials: true,
  });
  app.setGlobalPrefix('api');

  const config = new BaseAPIDocument().initializeOptions();
  const documet = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, documet);

  await app.listen(8000);
}
bootstrap();

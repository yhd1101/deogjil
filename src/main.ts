import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BaseAPIDocument } from './common/config/swagger.document';
import { SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new BaseAPIDocument().initializeOptions();
  const documet = SwaggerModule.createDocument(app, config);

  SwaggerModule.setup('api-docs', app, documet);

  app.enableCors();
  app.setGlobalPrefix('api');
  await app.listen(8000);
}
bootstrap();

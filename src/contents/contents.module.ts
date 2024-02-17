import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { SearchModule } from '../search/search.module';
import { CommentContentModule } from '../comment-content/comment-content.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as multer from 'multer';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
      storage: multer.memoryStorage(),
    }),
    TypeOrmModule.forFeature([Content]),
    CommentContentModule,
    ConfigModule.forRoot(),
  ],
  controllers: [ContentsController],
  providers: [ContentsService, ConfigService],
  exports: [ContentsService],
})
export class ContentsModule {}

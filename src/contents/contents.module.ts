import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { CommentContentModule } from '../comment-content/comment-content.module';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as multer from 'multer';
import { Like } from '../likes/entities/like.entity';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
      storage: multer.memoryStorage(),
    }),
    TypeOrmModule.forFeature([Content, Like]),
    CommentContentModule,
    ConfigModule.forRoot(),
  ],
  controllers: [ContentsController],
  providers: [ContentsService, ConfigService],
  exports: [ContentsService],
})
export class ContentsModule {}

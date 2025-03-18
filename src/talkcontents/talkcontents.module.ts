import { Module } from '@nestjs/common';
import { TalkcontentsService } from './talkcontents.service';
import { TalkcontentsController } from './talkcontents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Talkcontent } from './entities/talkcontent.entity';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import * as multer from 'multer';
import { LikeTalkContent } from '../like-talk-content/entities/like-talk-content.entity';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
      storage: multer.memoryStorage(),
    }),
    TypeOrmModule.forFeature([Talkcontent, LikeTalkContent]),
    ConfigModule.forRoot(),
  ],
  controllers: [TalkcontentsController],
  providers: [TalkcontentsService, ConfigService],
  exports: [TalkcontentsService],
})
export class TalkcontentsModule {}

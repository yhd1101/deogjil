import { Module } from '@nestjs/common';
import { LikeTalkContentService } from './like-talk-content.service';
import { LikeTalkContentController } from './like-talk-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LikeTalkContent } from './entities/like-talk-content.entity';
import { Talkcontent } from '../talkcontents/entities/talkcontent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LikeTalkContent, Talkcontent])],
  controllers: [LikeTalkContentController],
  providers: [LikeTalkContentService],
})
export class LikeTalkContentModule {}

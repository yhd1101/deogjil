import { Module } from '@nestjs/common';
import { CommentTalkContentService } from './comment-talk-content.service';
import { CommentTalkContentController } from './comment-talk-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentTalkContent } from './entities/comment-talk-content.entity';
import { Talkcontent } from '../talkcontents/entities/talkcontent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentTalkContent, Talkcontent])],
  controllers: [CommentTalkContentController],
  providers: [CommentTalkContentService],
})
export class CommentTalkContentModule {}

import { Module } from '@nestjs/common';
import { CommentContentService } from './comment-content.service';
import { CommentContentController } from './comment-content.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentContent } from './entities/comment-content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommentContent])],
  controllers: [CommentContentController],
  providers: [CommentContentService],
  exports: [CommentContentService],
})
export class CommentContentModule {}

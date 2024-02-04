import { Module } from '@nestjs/common';
import { ContentsService } from './contents.service';
import { ContentsController } from './contents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { SearchModule } from '../search/search.module';
import { CommentContentModule } from '../comment-content/comment-content.module';

@Module({
  imports: [TypeOrmModule.forFeature([Content]), CommentContentModule],
  controllers: [ContentsController],
  providers: [ContentsService],
  exports: [ContentsService],
})
export class ContentsModule {}

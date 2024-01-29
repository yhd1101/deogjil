import { Module } from '@nestjs/common';
import { SearchService } from './search.service';
import { SearchController } from './search.controller';
import { ContentsService } from '../contents/contents.service';
import { TalkcontentsService } from '../talkcontents/talkcontents.service';
import { ContentsModule } from '../contents/contents.module';
import { TalkcontentsModule } from '../talkcontents/talkcontents.module';

@Module({
  imports: [ContentsModule, TalkcontentsModule],
  controllers: [SearchController],
  providers: [SearchService],
})
export class SearchModule {}

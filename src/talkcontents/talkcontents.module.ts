import { Module } from '@nestjs/common';
import { TalkcontentsService } from './talkcontents.service';
import { TalkcontentsController } from './talkcontents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Talkcontent } from './entities/talkcontent.entity';
import { SearchModule } from '../search/search.module';

@Module({
  imports: [TypeOrmModule.forFeature([Talkcontent])],
  controllers: [TalkcontentsController],
  providers: [TalkcontentsService],
  exports: [TalkcontentsService],
})
export class TalkcontentsModule {}

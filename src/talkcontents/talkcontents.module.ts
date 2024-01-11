import { Module } from '@nestjs/common';
import { TalkcontentsService } from './talkcontents.service';
import { TalkcontentsController } from './talkcontents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Talkcontent } from './entities/talkcontent.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Talkcontent])],
  controllers: [TalkcontentsController],
  providers: [TalkcontentsService],
})
export class TalkcontentsModule {}

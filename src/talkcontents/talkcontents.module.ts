import { Module } from '@nestjs/common';
import { TalkcontentsService } from './talkcontents.service';
import { TalkcontentsController } from './talkcontents.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Talkcontent } from './entities/talkcontent.entity';
import { SearchModule } from '../search/search.module';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [TypeOrmModule.forFeature([Talkcontent]), ConfigModule.forRoot()],
  controllers: [TalkcontentsController],
  providers: [TalkcontentsService, ConfigService],
  exports: [TalkcontentsService],
})
export class TalkcontentsModule {}

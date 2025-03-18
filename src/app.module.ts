import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AppConfigModule } from './common/config/config.module';
import { UserModule } from './user/user.module';
import { AuthModule } from './auth/auth.module';
import { ContentsModule } from './contents/contents.module';
import { LikesModule } from './likes/likes.module';
import { TalkcontentsModule } from './talkcontents/talkcontents.module';
import { CommentContentModule } from './comment-content/comment-content.module';
import { CommentTalkContentModule } from './comment-talk-content/comment-talk-content.module';
import { SearchModule } from './search/search.module';
import { LikeTalkContentModule } from './like-talk-content/like-talk-content.module';
import { RedisModule } from './redis/redis.module';

@Module({
  imports: [
    AppConfigModule,
    DatabaseModule,
    UserModule,
    AuthModule,
    ContentsModule,
    LikesModule,
    TalkcontentsModule,
    CommentContentModule,
    CommentTalkContentModule,
    SearchModule,
    LikeTalkContentModule,
    RedisModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

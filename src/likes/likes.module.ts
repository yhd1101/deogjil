import { Module } from '@nestjs/common';
import { LikesService } from './likes.service';
import { LikesController } from './likes.controller';
import { Like } from './entities/like.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Content } from '../contents/entities/content.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Content])],
  controllers: [LikesController],
  providers: [LikesService],
})
export class LikesModule {}

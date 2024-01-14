import {
  BadRequestException,
  ConflictException,
  Injectable,
} from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Content } from '../contents/entities/content.entity';
import { Talkcontent } from '../talkcontents/entities/talkcontent.entity';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private likeRepository: Repository<Like>,
  ) {}

  async likeContent(user: User, createLikeDto: CreateLikeDto) {
    const newLike = await this.likeRepository.create({
      user,
      ...createLikeDto,
    });
    const lieks = await this.likeRepository.find({
      relations: ['user', 'content', 'talkContent'],
    });
    const userIds = lieks.map((like) => like.user.id);
    console.log(userIds);
    console.log(newLike.user.id);

    if (userIds.includes(newLike.user.id)) {
      if (newLike.content && newLike.talkContent) {
        throw new ConflictException('이미 좋아요를 했습니다.');
      }
    } else {
      await this.likeRepository.save(newLike);
      return newLike;
    }
  }
}

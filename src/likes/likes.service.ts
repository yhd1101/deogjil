import {
  BadRequestException,
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';

import { Repository, getConnection } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Content } from '../contents/entities/content.entity';
import { Talkcontent } from '../talkcontents/entities/talkcontent.entity';
import { CreateTalkLikeDto } from './dto/create-talkLike.dto';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private likeRepository: Repository<Like>,
  ) {}

  async createLike(user: User, createLikeDto: CreateLikeDto) {
    const newLike = this.likeRepository.create({
      user,
      ...createLikeDto,
    });

    const existingLike = await this.likeRepository.findOne({
      where: {
        user: { id: newLike.user.id },
        content: { id: newLike.content.id },
        talkContent: { id: newLike.talkContent.id },
      },
      relations: ['user', 'content', 'talkContent'],
    });
    console.log(existingLike);

    if (existingLike) {
      throw new ConflictException('already liked');
    }

    await this.likeRepository.save(newLike);
    return newLike;
  }
}

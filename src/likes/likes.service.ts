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

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private likeRepository: Repository<Like>,
  ) {}

  async likeContent(user: User, createLikeDto: CreateLikeDto) {
    const { content, talkContent } = createLikeDto;

    // 중복 좋아요 여부 확인
    const existingLikes = await this.likeRepository.find({
      relations: ['user'],
    });

    // 콘텐츠 ID가 중복되는 좋아요 확인
    const existingContentLike = existingLikes.find((like) => {
      return like.user.id === user.id && like.content === content;
    });

    // 토크 콘텐츠 ID가 중복되는 좋아요 확인
    const existingTalkContentLike = existingLikes.find((like) => {
      return like.user.id === user.id && like.talkContent === talkContent;
    });

    // 중복된 좋아요가 있는 경우 예외 발생
    if (existingContentLike) {
      throw new ConflictException('User already liked this content');
    }
    if (existingTalkContentLike) {
      throw new ConflictException('User already liked this content');
    }

    // 좋아요 생성 및 저장
    const newLike = this.likeRepository.create({
      user,
      ...createLikeDto,
    });
    await this.likeRepository.save(newLike);

    return newLike;
  }

  // async likeContent(user: User, createLikeDto: CreateLikeDto) {
  //   try {
  //     const newLike = this.likeRepository.create({
  //       user,
  //       ...createLikeDto,
  //     });
  //
  //     await this.likeRepository.save(newLike);
  //
  //     return newLike;
  //   } catch (error) {
  //     if (error.code === '23505') {
  //       throw new ConflictException('User already liked this content');
  //     }
  //     throw error; // 다른 예외는 그대로 throw
  //   }
  // }

  // async likeContent(user: User, createLikeDto: CreateLikeDto) {
  //   const { content, talkContent } = createLikeDto;
  //
  //   // 중복 좋아요 여부 확인
  //   const existingLike = await this.likeRepository.find({
  //     relations: ['user'],
  //   });
  //
  //   console.log(existingLike);
  //
  //   // 사용자의 좋아요가 이미 존재하는 경우
  //   if (existingLike) {
  //     console.log('*******!');
  //     // 콘텐츠 ID와 일치하는 경우
  //     // if (existingLike.content === content) {
  //     //   throw new ConflictException('User already liked this content');
  //     // }
  //     //
  //     // // 토크 콘텐츠 ID와 일치하는 경우
  //     // if (existingLike.talkContent === talkContent) {
  //     //   throw new ConflictException('User already liked this content');
  //     // }
  //   }
  //
  //   // 좋아요 생성 및 저장
  //   const newLike = this.likeRepository.create({
  //     user,
  //     ...createLikeDto,
  //   });
  //   await this.likeRepository.save(newLike);
  //
  //   return newLike;
  // }
}

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

  async likeContent(user: User, createLikeDto: CreateLikeDto) {
    const newLike = this.likeRepository.create({
      user,
      ...createLikeDto,
    });

    console.log(createLikeDto.content);
    // 사용자와 함께 연관된 좋아요를 로드하여 확인
    const existingLike = await this.likeRepository.find({
      relations: ['user', 'content', 'talkContent'],
    });

    const userIds = existingLike.map((like) => like.user.id);
    const contentsId = existingLike.map((like) => like.content.id);
    console.log(userIds);
    console.log('ddsad', contentsId);
    console.log('dq23123', newLike.user.id);
    console.log('12321312312', newLike.content.id);

    if (
      userIds.includes(newLike.user.id) &&
      contentsId.includes(newLike.content.id)
    ) {
      throw new ConflictException('User already liked this content');
    } else {
      await this.likeRepository.save(newLike);
      return newLike;
    }
  }

  async talkContentLike(user: User, createTalkLikeDto: CreateTalkLikeDto) {
    const newLike = this.likeRepository.create({
      user,
      ...createTalkLikeDto,
    });
    const existingLike = await this.likeRepository.find({
      relations: ['user', 'talkContent'],
    });
    console.log(existingLike);

    const userIds = existingLike.map((like) => like.user.id);
    console.log('dsads', userIds);
    const contentsId = existingLike.map((like) => like.talkContent.id);
    console.log('dsqq3123', contentsId);
    if (
      userIds.includes(newLike.user.id) &&
      contentsId.includes(newLike.talkContent.id)
    ) {
      throw new ConflictException('User already liked this talkContent');
    } else {
      await this.likeRepository.save(newLike);
      return newLike;
    }
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

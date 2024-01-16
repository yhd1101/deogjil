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
    // 사용자와 함께 연관된 좋아요를 로드하여 확인
    const existingLike = await this.likeRepository.find({
      relations: ['user', 'content', 'talkContent'],
    });
    const userIds = existingLike
      .map((like) => (like.user ? like.user.id : null))
      .filter((id) => id !== null);
    const contenteIDs = existingLike
      .map((like) => (like.content ? like.content.id : null)) // Content 객체 그대로 저장
      .filter((id) => id !== null);
    const talkContents = existingLike
      .map((like) => (like.talkContent ? like.talkContent.id : null)) // Content 객체 그대로 저장
      .filter((id) => id !== null);
    console.log(talkContents);

    console.log(newLike.talkContent.id);

    if (
      userIds.includes(newLike.user.id) &&
      talkContents.includes(newLike.talkContent.id)
    ) {
      throw new ConflictException('already liked');
    }

    if (
      userIds.includes(newLike.user.id) &&
      contenteIDs.includes(newLike.content.id)
    ) {
      throw new ConflictException('already liked');
    }
    await this.likeRepository.save(newLike);
    return newLike;
  }

  // async createLike(
  //   user: User,
  //   content: Content,
  //   talkContent: Talkcontent,
  // ): Promise<Like> {
  //   // Check if the user has already liked the content or talkContent
  //   const existingLike = await this.likeRepository.findOne({
  //     where: [
  //       { user, content },
  //       { user, talkContent },
  //     ],
  //   });
  //
  //   if (existingLike) {
  //     // Handle case where user has already liked the content or talkContent
  //     // For example, you can throw an exception or return an error response
  //     throw new Error('User has already liked the content or talkContent');
  //   }
  //
  //   // Create a new like
  //   const newLike = this.likeRepository.create({ user, content, talkContent });
  //   return this.likeRepository.save(newLike);
  // }
  // async talkContentLike(
  //   user: User,
  //   category: string,
  //   createLikeDto: CreateLikeDto,
  // ) {
  //   const { content, talkContent } = createLikeDto;
  //
  //   // content와 talkContent 모두 없는 경우 에러 처리 또는 다른 처리 로직 수행
  //   if (!content && !talkContent) {
  //     throw new BadRequestException(
  //       'Either content or talkContent must be provided',
  //     );
  //   }
  //
  //   // 중복 좋아요 체크 로직 추가
  //   const existingLike = await this.likeRepository.findOne({
  //     where: {
  //       user,
  //       [content ? 'content' : 'talkContent']: content || talkContent,
  //     },
  //     relations: ['user', 'content', 'talkContent'],
  //   });
  //
  //   if (existingLike) {
  //     throw new ConflictException('Already liked');
  //   }
  //
  //   // 중복이 아닌 경우 좋아요 저장 로직 수행
  //   const newLike = this.likeRepository.create({
  //     user,
  //     content: content || null,
  //     talkContent: talkContent || null,
  //   });
  //
  //   if (category === 'content') {
  //     newLike.content = content;
  //   } else if (category === 'talkContent') {
  //     newLike.talkContent = talkContent;
  //   }
  //
  //   await this.likeRepository.save(newLike);
  //
  //   return newLike;
  // }

  // async likeContent(
  //   user: User,
  //   category: string,
  //   createLikeDto: CreateLikeDto,
  // ) {
  //   const { content, talkContent } = createLikeDto;
  //
  //   if (!content && !talkContent) {
  //     throw new BadRequestException('No ContendId, talkContentId');
  //   }
  //   const existingLike = await this.likeRepository.findOne({
  //     where: {
  //       user,
  //       [content ? 'content' : 'talkContent']: content || talkContent,
  //     },
  //     relations: ['user', 'content', 'talkContent'],
  //   });
  //
  //   if (existingLike) {
  //     throw new ConflictException('liked already');
  //   }
  //
  //   const newLike = this.likeRepository.create({
  //     user,
  //     content: content ? { id: content } : null,
  //     talkContent: talkContent ? { id: talkContent } : null,
  //   });
  //
  //   if (category === 'content') {
  //     newLike.content = { category: content };
  //     // content에 대한 처리 로직 추가
  //     // 예: newLike.content = { id: content };
  //   } else if (category === 'talkContent') {
  //     // talkContent에 대한 처리 로직 추가
  //     // 예: newLike.talkContent = { id: talkContent };
  //   }
  // }

  async likeContent(user: User, createLikeDto: CreateLikeDto) {
    //
    // await this.likeRepository.save(newLike);
    // return newLike;
    // console.log('dq23123', newLike.user.id);
    // console.log('12321312312', newLike.content.id);
    // if (userIds.includes(newLike.user.id)) {
    //   console.log('******');
    //   // throw new ConflictException('User already liked this content');
    // } else {
    //   await this.likeRepository.save(newLike);
    //   return newLike;
    // }
  }
  //
  // async talkContentLike(user: User, createTalkLikeDto: CreateTalkLikeDto) {
  //   const newLike = this.likeRepository.create({
  //     user,
  //     ...createTalkLikeDto,
  //   });
  //   const existingLike = await this.likeRepository.find({
  //     relations: ['user', 'talkContent'],
  //   });
  //   console.log(existingLike);
  //
  //   const userIds = existingLike.map((like) => like.user.id);
  //   console.log('dsads', userIds);
  //   const contentsId = existingLike.map((like) => like.talkContent.id);
  //   console.log('dsqq3123', contentsId);
  //   if (
  //     userIds.includes(newLike.user.id) &&
  //     contentsId.includes(newLike.talkContent.id)
  //   ) {
  //     throw new ConflictException('User already liked this talkContent');
  //   } else {
  //     await this.likeRepository.save(newLike);
  //     return newLike;
  //   }
  // }

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

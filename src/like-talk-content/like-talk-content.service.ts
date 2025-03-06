import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLikeTalkContentDto } from './dto/create-like-talk-content.dto';
import { UpdateLikeTalkContentDto } from './dto/update-like-talk-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { LikeTalkContent } from './entities/like-talk-content.entity';
import { Repository } from 'typeorm';
import { Talkcontent } from '../talkcontents/entities/talkcontent.entity';
import { User } from '../user/entities/user.entity';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';
@Injectable()
export class LikeTalkContentService {
  constructor(
    @InjectRepository(LikeTalkContent)
    private likeTalkContentRepository: Repository<LikeTalkContent>,
    @InjectRepository(Talkcontent)
    private talkcontentRepository: Repository<Talkcontent>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createLike(
    user: User,
    createLikeTalkContentDto: CreateLikeTalkContentDto,
  ) {
    const contentId = createLikeTalkContentDto.content;
    const cacheKey = `likeTalkContent:${user.id}:${contentId}`;

    // 1️⃣ Redis 캐시에서 중복 요청 확인 (광클 방지)
    const isLiked = await this.cacheManager.get(cacheKey);
    if (isLiked) {
      throw new ConflictException('already liked');
    }

    // 2️⃣ DB에서 중복 좋아요 확인 (추가 안전장치)
    const likeExists = await this.likeTalkContentRepository
      .createQueryBuilder('likeTalkContent')
      .where('likeTalkContent.user = :userId', { userId: user.id })
      .andWhere('likeTalkContent.content = :contentId', { contentId })
      .getCount();

    if (likeExists > 0) {
      throw new ConflictException('already liked');
    }

    // 3️⃣ 좋아요 저장 (DB에 추가)
    const newLike = this.likeTalkContentRepository.create({
      user,
      ...createLikeTalkContentDto,
    });

    await this.likeTalkContentRepository.save(newLike);

    // 4️⃣ 좋아요 수 증가
    await this.talkcontentRepository
      .createQueryBuilder()
      .update(Talkcontent)
      .set({ likeCount: () => '"likeCount" + 1' })
      .where('id = :contentId', { contentId })
      .execute();

    // 5️⃣ Redis 캐시에 좋아요 저장 (TTL 60초 설정)
    await this.cacheManager.set(cacheKey, true, { ttl: 60 });

    return newLike;
  }

  async deleteLike(id: string) {
    try {
      // 1️⃣ 좋아요 데이터 조회
      const like = await this.likeTalkContentRepository.findOne({
        where: { content: { id } },
        relations: ['content'],
      });

      if (!like) {
        throw new NotFoundException('like not found');
      }

      const contentId = like.content.id;
      const cacheKey = `likeTalkContent:${like.user.id}:${contentId}`;

      // 2️⃣ 좋아요 삭제
      await this.likeTalkContentRepository.delete(like.id);

      // 3️⃣ 좋아요 수 감소
      await this.talkcontentRepository
        .createQueryBuilder()
        .update(Talkcontent)
        .set({ likeCount: () => '"likeCount" - 1' })
        .where('id = :contentId', { contentId })
        .execute();

      // 4️⃣ Redis 캐시 삭제
      await this.cacheManager.del(cacheKey);

      return 'cancel';
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new BadRequestException('Failed to delete content');
    }
  }

  // async createLike(
  //   user: User,
  //   createLikeTalkContentDto: CreateLikeTalkContentDto,
  // ) {
  //   const newLike = this.likeTalkContentRepository.create({
  //     user,
  //     ...createLikeTalkContentDto,
  //   });
  //   console.log('23', newLike);
  //
  //   const like = await this.likeTalkContentRepository
  //     .createQueryBuilder('likeTalkContent')
  //     .where('likeTalkContent.user = :userId', { userId: user.id })
  //     .andWhere('likeTalkContent.content = :contentId', {
  //       contentId: newLike.content,
  //     })
  //     .getCount();
  //
  //   //
  //   if (like > 0) {
  //     throw new ConflictException('already liked');
  //   }
  //
  //   const contentId = createLikeTalkContentDto.content;
  //   await this.likeTalkContentRepository.save(newLike);
  //
  //   await this.talkcontentRepository
  //     .createQueryBuilder()
  //     .update(Talkcontent)
  //     .set({ likeCount: () => '"likeCount" + 1' })
  //     .where('id = :contentId', { contentId })
  //     .execute();
  //
  //   return newLike;
  // }
  //
  // async deleteLike(id: string) {
  //   try {
  //     const like = await this.likeTalkContentRepository.findOne({
  //       where: { content: { id } },
  //       relations: ['content'],
  //     });
  //
  //     if (!like) {
  //       throw new NotFoundException('like not found');
  //     }
  //     const contentId = like.content.id;
  //     await this.likeTalkContentRepository.delete(like.id);
  //     await this.talkcontentRepository
  //       .createQueryBuilder()
  //       .update(Talkcontent)
  //       .set({ likeCount: () => '"likeCount" - 1' })
  //       .where('id = :contentId', { contentId })
  //       .execute();
  //     return 'cancel';
  //   } catch (error) {
  //     console.error('Error deleting content:', error);
  //     throw new BadRequestException('Failed to delete content');
  //   }
  // }
}

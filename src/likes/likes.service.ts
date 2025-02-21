import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateLikeDto } from './dto/create-like.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Content } from '../contents/entities/content.entity';
import { Like } from './entities/like.entity';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';
import * as IORedis from 'ioredis';

@Injectable()
export class LikesService {
  constructor(
    @InjectRepository(Like) private likeRepository: Repository<Like>,
    @InjectRepository(Content) private contentRepository: Repository<Content>,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  async createLike(user: User, createLikeDto: CreateLikeDto) {
    // 중복 좋아요 체크 (DB에서 확인)
    const existingCount = await this.likeRepository
      .createQueryBuilder('like')
      .where('like.user = :userId', { userId: user.id })
      .andWhere('like.content = :contentId', {
        contentId: createLikeDto.content,
      })
      .getCount();
    if (existingCount > 0) {
      throw new ConflictException('already liked');
    }

    // DB에 새 좋아요 기록 저장
    const newLike = this.likeRepository.create({
      user,
      ...createLikeDto,
    });
    await this.likeRepository.save(newLike);

    // Redis 원자적 연산으로 카운터 증가
    const client = this.cacheManager.store.getClient() as IORedis.Redis;
    const redisKey = `like:content:${createLikeDto.content}`;
    await client.incr(redisKey);

    return newLike;
  }

  async deleteLike(id: string) {
    const like = await this.likeRepository.findOne({
      where: { content: { id } },
      relations: ['content'],
    });
    if (!like) {
      throw new NotFoundException('like not found');
    }
    await this.likeRepository.delete(like.id);

    // Redis 원자적 연산으로 카운터 감소
    const client = this.cacheManager.store.getClient() as IORedis.Redis;
    const redisKey = `like:content:${like.content.id}`;
    await client.decr(redisKey);

    return 'like cancel';
  }
}

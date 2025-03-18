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

  // 좋아요 추가
  async createLike(user: User, createLikeDto: CreateLikeDto) {
    // 중복 좋아요 체크 (DB에서 확인)
    const existingCount = await this.likeRepository
      .createQueryBuilder('like')
      .where('like.user = :userId', { userId: user.id })
      .andWhere('like.content = :contentId', {
        contentId: createLikeDto.content, // 만약 createLikeDto.content가 Content 객체라면 아래와 같이 변경:
        // contentId: createLikeDto.content.id,
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

    // Redis 원자적 연산: 키 초기화 후 카운터 증가
    const client = this.cacheManager.store.getClient() as IORedis.Redis;
    // createLikeDto.content가 Content 객체라면, 여기서 content의 id를 사용해야 함:
    const redisKey = `like:content:${
      typeof createLikeDto.content === 'object'
        ? createLikeDto.content.id
        : createLikeDto.content
    }`;
    let existingValue = await client.get(redisKey);
    if (existingValue === null || isNaN(Number(existingValue))) {
      await client.set(redisKey, '0');
    }
    await client.incr(redisKey);

    // DB의 Content.likeCount 동시성 업데이트 (+1)
    // 만약 createLikeDto.content가 Content 객체라면, updateContentLikeCount에 ID를 전달합니다.
    const contentId =
      typeof createLikeDto.content === 'object'
        ? createLikeDto.content.id
        : createLikeDto.content;
    await this.updateContentLikeCount(contentId, 1);

    return newLike;
  }

  // 좋아요 취소
  async deleteLike(id: string) {
    console.log('id: ', id);
    const like = await this.likeRepository.findOne({
      where: { content: { id } },
      relations: ['content'],
    });
    console.log('like :', like);
    if (!like) {
      throw new NotFoundException('like not found');
    }
    await this.likeRepository.delete(like.id);

    const client = this.cacheManager.store.getClient() as IORedis.Redis;
    const redisKey = `like:content:${like.content.id}`;
    await client.decr(redisKey);

    await this.updateContentLikeCount(like.content.id, -1);

    return 'like cancel';
  }

  // 분산 락을 사용하여 Content.likeCount를 안전하게 업데이트하는 함수
  async updateContentLikeCount(contentId: string, increment: number) {
    const client = this.cacheManager.store.getClient() as IORedis.Redis;
    const lockKey = `lock:content:${contentId}`;
    // 분산 락: NX, PX 옵션을 사용할 때 타입 에러가 발생하면 any 캐스팅 사용
    const lock = await (client.set as any)(lockKey, 'locked', 'NX', 'PX', 1000);
    if (!lock) {
      throw new BadRequestException(
        '현재 다른 요청이 처리 중입니다. 잠시 후 다시 시도해주세요.',
      );
    }
    try {
      await this.contentRepository
        .createQueryBuilder()
        .update(Content)
        .set({ likeCount: () => `"likeCount" + ${increment}` })
        .where('id = :contentId', { contentId })
        .execute();
    } finally {
      await client.del(lockKey);
    }
  }

  // contentGetById: Redis에 저장된 최신 likeCount를 읽어 반
}

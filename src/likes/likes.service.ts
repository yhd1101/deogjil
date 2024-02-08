import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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
    @InjectRepository(Content) private contentRepository: Repository<Content>,
  ) {}

  async createLike(user: User, createLikeDto: CreateLikeDto) {
    const newLike = this.likeRepository.create({
      user,
      ...createLikeDto,
    });

    const likeCount = await this.likeRepository
      .createQueryBuilder('like')
      .where('like.user = :userId', { userId: user.id })
      .andWhere('like.content = :contentId', { contentId: newLike.content.id })
      .getCount();

    console.log(likeCount);

    if (likeCount > 0) {
      throw new ConflictException('already liked');
    }
    const contentId = createLikeDto.content.id;

    await this.likeRepository.save(newLike);

    await this.contentRepository
      .createQueryBuilder()
      .update(Content)
      .set({ likeCount: () => '"likeCount" + 1' })
      .where('id = :contentId', { contentId })
      .execute();

    return newLike;
  }

  async deleteLike(id: string) {
    try {
      const like = await this.likeRepository.findOne({
        where: { id },
        relations: ['content'],
      });
      if (!like) {
        throw new NotFoundException('like not found');
      }
      const contentId = like.content.id;
      await this.likeRepository.delete(id);
      await this.contentRepository
        .createQueryBuilder()
        .update(Content)
        .set({ likeCount: () => '"likeCount" - 1' })
        .where('id = :contentId', { contentId })
        .execute();

      return 'like cancel';
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new BadRequestException('Failed to delete content');
    }
  }
}

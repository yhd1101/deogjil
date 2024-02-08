import {
  BadRequestException,
  ConflictException,
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
import { Content } from '../contents/entities/content.entity';
@Injectable()
export class LikeTalkContentService {
  constructor(
    @InjectRepository(LikeTalkContent)
    private likeTalkContentRepository: Repository<LikeTalkContent>,
    @InjectRepository(Talkcontent)
    private talkcontentRepository: Repository<Talkcontent>,
  ) {}

  async createLike(
    user: User,
    createLikeTalkContentDto: CreateLikeTalkContentDto,
  ) {
    const newLike = this.likeTalkContentRepository.create({
      user,
      ...createLikeTalkContentDto,
    });

    const likeCount = await this.likeTalkContentRepository
      .createQueryBuilder('likeTalkContent')
      .where('likeTalkContent.user = :userId', { userId: user.id })
      .andWhere('like.talkContent = :talkContentId', {
        contentId: newLike.talkContent.id,
      })
      .getCount();

    if (likeCount > 0) {
      throw new ConflictException('already liked');
    }
    const contentId = createLikeTalkContentDto.talkcontent.id;

    await this.likeTalkContentRepository.save(newLike);

    await this.talkcontentRepository
      .createQueryBuilder()
      .update(Talkcontent)
      .set({ likeCount: () => '"likeCount" + 1' })
      .where('id = :talkContentId', { contentId })
      .execute();

    return newLike;
  }

  async deleteLike(id: string) {
    try {
      const like = await this.likeTalkContentRepository.findOne({
        where: { id },
        relations: ['talkContent'],
      });
      if (!like) {
        throw new NotFoundException('like not found');
      }
      const contentId = like.talkContent.id;
      await this.likeTalkContentRepository.delete(id);

      await this.talkcontentRepository
        .createQueryBuilder()
        .update(Talkcontent)
        .set({ likeCount: () => '"likeCount" - 1' })
        .where('id = :talkContentId', { contentId })
        .execute();

      return 'like cancel';
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new BadRequestException('Failed to delete content');
    }
  }
}

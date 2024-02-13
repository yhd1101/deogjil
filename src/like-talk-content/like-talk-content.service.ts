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
import { CreateLikeDto } from '../likes/dto/create-like.dto';
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
    console.log(newLike.talkContent.id);
    console.log('23', newLike);

    const like = await this.likeTalkContentRepository
      .createQueryBuilder('likeTalkContent')
      .where('likeTalkContent.user = :userId', { userId: user.id })
      .andWhere('likeTalkContent.talkContent = :talkContentId', {
        talkContentId: newLike.talkContent,
      })
      .getCount();

    console.log(like);
    //
    if (like > 0) {
      throw new ConflictException('already liked');
    }

    const contentId = newLike.talkContent;
    console.log(contentId);
    // //
    // const id = createLikeTalkContentDto.talkcontent.id;
    // console.log('id:', id);
    await this.likeTalkContentRepository.save(newLike);

    await this.talkcontentRepository
      .createQueryBuilder()
      .update(Talkcontent)
      .set({ likeCount: () => '"likeCount" + 1' })
      .where('id = :contentId', { contentId })
      .execute();

    return newLike;
  }

  async deleteLike(id: string) {
    try {
      const like = await this.likeTalkContentRepository.findOne({
        where: { id },
        relations: ['talkContent'],
      });
      console.log(like);

      if (!like) {
        throw new NotFoundException('like not found');
      }
      const contentId = like.talkContent.id;
      await this.likeTalkContentRepository.delete(id);
      await this.talkcontentRepository
        .createQueryBuilder()
        .update(Talkcontent)
        .set({ likeCount: () => '"likeCount" - 1' })
        .where('id = :contentId', { contentId })
        .execute();
      return 'cancel';
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new BadRequestException('Failed to delete content');
    }
  }
}

import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentTalkContentDto } from './dto/create-comment-talk-content.dto';
import { UpdateCommentTalkContentDto } from './dto/update-comment-talk-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentTalkContent } from './entities/comment-talk-content.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Talkcontent } from '../talkcontents/entities/talkcontent.entity';

@Injectable()
export class CommentTalkContentService {
  constructor(
    @InjectRepository(CommentTalkContent)
    private commentTalkContentRepository: Repository<CommentTalkContent>,
    @InjectRepository(Talkcontent)
    private readonly talkcontentRepository: Repository<Talkcontent>,
  ) {}

  async commentCreate(
    createCommentTalkContentDto: CreateCommentTalkContentDto,
    user: User,
  ) {
    const newComment = await this.commentTalkContentRepository.create({
      ...createCommentTalkContentDto,
      writer: user,
    });
    const contentId = createCommentTalkContentDto.talkContent;

    await this.commentTalkContentRepository.save(newComment);

    await this.talkcontentRepository
      .createQueryBuilder()
      .update(Talkcontent)
      .set({ commentCount: () => '"commentCount" + 1' }) // 댓글 개수 증가
      .where('id = :talkContentId', { contentId })
      .execute();
    return newComment;
  }

  async commentUpdate(
    id: string,
    updateCommentTalkContentDto: UpdateCommentTalkContentDto,
    user: User,
  ) {
    const comment = await this.commentTalkContentRepository.findOne({
      where: { id },
      relations: ['writer'],
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.writer.id !== user.id) {
      throw new ForbiddenException(
        'you do not have permission to update this comment',
      );
    }

    await this.commentTalkContentRepository.update(
      id,
      updateCommentTalkContentDto,
    );

    return 'updated comment';
  }

  async commentDelete(id: string, user: User) {
    const comment = await this.commentTalkContentRepository.findOne({
      where: { id },
      relations: ['writer'],
    });
    if (!comment) {
      throw new NotFoundException('Not Comment');
    }

    if (comment.writer.id !== user.id) {
      throw new ForbiddenException(
        ' you do not have permission to delete this comment',
      );
    }
    await this.commentTalkContentRepository.delete(id);
    return 'deleted';
  }
}

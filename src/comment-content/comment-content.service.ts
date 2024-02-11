import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateCommentContentDto } from './dto/create-comment-content.dto';
import { UpdateCommentContentDto } from './dto/update-comment-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { CommentContent } from './entities/comment-content.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { Content } from '../contents/entities/content.entity';

@Injectable()
export class CommentContentService {
  constructor(
    @InjectRepository(CommentContent)
    private commentContentRepository: Repository<CommentContent>,
    @InjectRepository(Content)
    private readonly contentRepository: Repository<Content>,
  ) {}

  async commentCreate(
    createCommentContentDto: CreateCommentContentDto,
    user: User,
  ) {
    const newComment = await this.commentContentRepository.create({
      ...createCommentContentDto,
      writer: user,
    });

    console.log(newComment);
    const contentId = createCommentContentDto.content;

    await this.commentContentRepository.save(newComment);

    // 해당 컨텐츠의 댓글 개수를 업데이트
    await this.contentRepository
      .createQueryBuilder()
      .update(Content)
      .set({ commentCount: () => '"commentCount" + 1' }) // 댓글 개수 증가
      .where('id = :contentId', { contentId })
      .execute();

    return newComment;
  }

  // async commentCreate(
  //   createCommentContentDto: CreateCommentContentDto,
  //   user: User,
  // ) {
  //   const newComment = await this.commentContentRepository.create({
  //     ...createCommentContentDto,
  //     writer: user,
  //   });
  //
  //   console.log(newComment);
  //   const contentId = createCommentContentDto.content;
  //
  //   await this.commentContentRepository.save(newComment);
  //   // 댓글 생성 후, 해당 컨텐츠의 댓글 개수를 업데이트
  //   return newComment;
  // }
  async commentUpdate(
    id: string,
    updateCommentContentDto: UpdateCommentContentDto,
    user: User,
  ) {
    const comment = await this.commentContentRepository.findOne({
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

    await this.commentContentRepository.update(id, updateCommentContentDto);

    return 'updated comment';
  }

  async commentDelete(id: string, user: User) {
    const comment = await this.commentContentRepository.findOne({
      where: { id },
      relations: ['writer', 'content'],
    });
    if (!comment) {
      throw new NotFoundException('Not Comment');
    }

    if (comment.writer.id !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }
    const contentId = comment.content.id;

    await this.commentContentRepository.delete(id);
    await this.contentRepository
      .createQueryBuilder()
      .update(Content)
      .set({ commentCount: () => '"commentCount" - 1' }) // 댓글 개수 증가
      .where('id = :contentId', { contentId })
      .execute();
    return 'deleted';
  }
}

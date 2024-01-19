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

@Injectable()
export class CommentContentService {
  constructor(
    @InjectRepository(CommentContent)
    private commentContentRepository: Repository<CommentContent>,
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

    await this.commentContentRepository.save(newComment);
    return newComment;
  }

  async commentUpdate(
    id: string,
    createCommentContentDto: CreateCommentContentDto,
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

    await this.commentContentRepository.update(id, createCommentContentDto);

    return 'updated comment';
  }

  async commentDelete(id: string, user: User) {
    const comment = await this.commentContentRepository.findOne({
      where: { id },
      relations: ['writer'],
    });
    if (!comment) {
      throw new NotFoundException('Not Comment');
    }

    if (comment.writer.id !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this comment',
      );
    }

    await this.commentContentRepository.delete(id);

    return 'deleted';
  }
}

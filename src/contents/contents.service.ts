import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { PageMetaDto } from '../common/dtos/page-meta.dto';
import { PageDto } from '../common/dtos/page.dto';
import { count } from 'rxjs';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content) private contentRepository: Repository<Content>,
  ) {}

  async contentCreate(createContentDto: CreateContentDto, user: User) {
    const newContent = await this.contentRepository.create({
      ...createContentDto,
      writer: user,
    });

    await this.contentRepository.save(newContent);

    return newContent;
  }

  async contentGetAll(
    pageOptionsDto: PageOptionsDto,
    searchQuery?: string,
  ): Promise<PageDto<Content>> {
    const queryBuilder =
      await this.contentRepository.createQueryBuilder('contents');
    queryBuilder.leftJoinAndSelect('contents.writer', 'writer');

    if (searchQuery) {
      queryBuilder.where(
        'contents.title LIKE :searchQuery OR contents.desc LIKE :searchQuery',
        { searchQuery: `%${searchQuery}%` },
      );
    }

    await queryBuilder
      .orderBy('contents.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);
    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Content>(entities, pageMetaDto);
  }

  async contentGetById(id: string) {
    const content1 = await this.contentRepository.findOne({
      where: { id },
      relations: ['like'],
    });
    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.writer', 'writer')
      .leftJoinAndSelect('content.comment', 'comment')
      .where('content.id= :id', { id })
      .getOne();

    const count = content1.like.length;
    return { content, likeCount: count };
  }

  async contentUpdateById(
    id: string,
    updateContentDto: UpdateContentDto,
    user: User,
  ) {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['writer'],
    });

    if (!content) {
      // 글이 없는 경우 NotFoundException을 던짐
      throw new NotFoundException('Content not found');
    }

    // 사용자가 글의 작성자인지 확인
    if (content.writer.id !== user.id) {
      // 권한이 없는 경우 ForbiddenException을 던짐
      throw new ForbiddenException(
        'You do not have permission to update this content',
      );
    }

    // 글을 수정
    await this.contentRepository.update(id, updateContentDto);

    return 'Updated content';
  }

  async contentDeleteById(id: string, user: User) {
    const content = await this.contentRepository.findOne({
      where: { id },
      relations: ['writer'],
    });
    if (!content) {
      throw new NotFoundException('Content Not Found');
    }

    if (content.writer.id !== user.id) {
      throw new ForbiddenException(
        'You do not have permission to delete this content',
      );
    }

    await this.contentRepository.delete(id);
    return 'deleted';
  }
}

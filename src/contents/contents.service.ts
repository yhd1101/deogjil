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

    const save = await this.contentRepository.save(newContent);

    return newContent;
  }

  // async contentGetAll(page: number = 1) {
  //   const take = 1;
  //   const queryBuilder = this.contentRepository.createQueryBuilder('content');
  //   queryBuilder.leftJoinAndSelect('content.writer', 'writer'); // 관계형
  //
  //   queryBuilder
  //     .orderBy('content.createdAt', pageOptionsDto.order)
  //     .skip(pageOptionsDto.skip)
  //     .take(pageOptionsDto.take);
  //
  //   const itemCount = await queryBuilder.getCount();
  //   const { entities } = await queryBuilder.getRawAndEntities();
  //
  //   const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
  //   return new PageDto(entities, pageMetaDto);
  // }

  async contentGetAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Content>> {
    const queryBuilder =
      await this.contentRepository.createQueryBuilder('contents');
    queryBuilder.leftJoinAndSelect('contents.writer', 'writer');

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
    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.writer', 'writer')
      .where('content.id= :id', { id })
      .getOne();
    return content;
  }

  async contentUpdateById(
    id: string,
    createContentDto: CreateContentDto,
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
    await this.contentRepository.update(id, createContentDto);

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
        'You do not have permission to update this content',
      );
    }

    await this.contentRepository.delete(id);
    return 'deleted';
  }
}

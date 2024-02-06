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
import { CommentContentService } from '../comment-content/comment-content.service';

@Injectable()
export class ContentsService {
  constructor(
    @InjectRepository(Content) private contentRepository: Repository<Content>,
    private readonly commentContentService: CommentContentService,
  ) {}

  async contentCreate(
    createContentDto: CreateContentDto,
    user: User,
    files: Express.Multer.File[],
  ) {
    console.log('dddd', files);
    const uploadedImageUrls = await this.uploadImg(files);
    console.log(uploadedImageUrls);
    const newContent = await this.contentRepository.create({
      ...createContentDto,
      writer: user,
      img: uploadedImageUrls,
    });
    console.log('21313123123', newContent);
    console.log('222');
    await this.contentRepository.save(newContent);

    return newContent;
  }

  async uploadImg(files: Express.Multer.File[]) {
    const imageUrls = [];

    // files가 undefined나 null인 경우 처리
    if (files) {
      // Object.values를 사용하여 객체를 배열로 변환
      const fileList = Object.values(files);

      // 각 파일에 대해 이미지 업로드 로직을 수행
      for (const file of fileList) {
        const fileName = `content/${file.filename}`;
        // 파일을 저장하거나 다른 로직 수행 가능
        // 여기에서는 이미지 URL을 생성하여 저장
        imageUrls.push(`http://localhost:8000//${fileName}`);
      }
    }
    console.log('ddd12', imageUrls);

    return imageUrls;
  }

  async contentGetAll(
    pageOptionsDto: PageOptionsDto,
    searchQuery?: string,
    sortType?: string,
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

    if (sortType === 'commentcount') {
      queryBuilder.addOrderBy('contents.commentCount', 'DESC');
    } else {
      queryBuilder.addOrderBy('contents.createdAt', pageOptionsDto.order);
    }

    // 페이지네이션 로직을 여기서 수행
    const [contentWithCommentCount, itemCount] = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getManyAndCount();

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Content>(contentWithCommentCount, pageMetaDto);
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

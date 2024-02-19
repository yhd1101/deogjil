import {
  BadRequestException,
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
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import * as path from 'path';
import { Like } from '../likes/entities/like.entity';

@Injectable()
export class ContentsService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;
  constructor(
    @InjectRepository(Content) private contentRepository: Repository<Content>,
    @InjectRepository(Like) private likeRepository: Repository<Like>,
    private readonly configService: ConfigService,
  ) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'), // process.env.AWS_S3_ACCESS_KEY
      secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }

  async contentCreate(
    createContentDto: CreateContentDto,
    user: User,
    files: Express.Multer.File[],
  ) {
    try {
      // 이미지 업로드 및 URL 가져오기
      const uploadedImageUrls = await Promise.all(
        files.map(async (file) => {
          const { key } = await this.uploadFileToS3('content', file);
          return this.getAwsS3FileUrl(key);
        }),
      );

      // 새로운 콘텐츠 생성
      const newContent = await this.contentRepository.create({
        ...createContentDto,
        writer: user,
        img: uploadedImageUrls, // 이미지 URL을 img 필드에 추가
      });

      // 콘텐츠 저장
      await this.contentRepository.save(newContent);

      return newContent;
    } catch (error) {
      // 오류 처리
      console.error('Error creating content:', error);
      throw new BadRequestException('Failed to create content');
    }
  }

  async uploadFileToS3(
    folder: string,
    file: Express.Multer.File,
  ): Promise<{
    key: string;
    s3Object: PromiseResult<AWS.S3.PutObjectOutput, AWS.AWSError>;
    contentType: string;
  }> {
    try {
      const key = `${folder}/${Date.now()}_${path.basename(
        file.originalname,
      )}`.replace(/ /g, '');

      const s3Object = await this.awsS3
        .putObject({
          Bucket: this.S3_BUCKET_NAME,
          Key: key,
          Body: file.buffer,
          ACL: 'public-read',
          ContentType: file.mimetype,
        })
        .promise();
      return { key, s3Object, contentType: file.mimetype };
    } catch (error) {
      throw new BadRequestException(`File upload failed : ${error}`);
    }
  }
  async deleteS3Object(
    key: string,
    callback?: (err: AWS.AWSError, data: AWS.S3.DeleteObjectOutput) => void,
  ): Promise<void> {
    try {
      await this.awsS3
        .deleteObject(
          {
            Bucket: this.S3_BUCKET_NAME,
            Key: key,
          },
          callback,
        )
        .promise();
    } catch (error) {
      throw new BadRequestException(`Failed to delete file : ${error}`);
    }
  }

  public getAwsS3FileUrl(objectKey: string) {
    return `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${objectKey}`;
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

  // async contentGetAll(
  //   pageOptionsDto: PageOptionsDto,
  //   searchQuery?: string,
  //   sortType?: string,
  //   tag?: string,
  //   user?: { id: string },
  // ): Promise<PageDto<Content>> {
  //   const queryBuilder =
  //     await this.contentRepository.createQueryBuilder('contents');
  //   queryBuilder.leftJoinAndSelect('contents.writer', 'writer');
  //   if (tag) {
  //     queryBuilder.andWhere(':tag = ANY(contents.tag)', {
  //       tag,
  //     });
  //   }
  //   if (searchQuery) {
  //     console.log(searchQuery);
  //     queryBuilder.where(
  //       'contents.title LIKE :searchQuery OR contents.desc LIKE :searchQuery OR :searchQuery = ANY(contents.tag)',
  //       { searchQuery: `%${searchQuery}%` },
  //     );
  //     queryBuilder.andWhere(':searchQuery = ANY(contents.tag)', {
  //       searchQuery,
  //     });
  //   }
  //
  //   switch (sortType) {
  //     case 'like':
  //       queryBuilder.addOrderBy('contents.likeCount', 'DESC');
  //       break;
  //     case 'commentcount':
  //       queryBuilder.addOrderBy('contents.commentCount', 'DESC');
  //       break;
  //     default:
  //       queryBuilder.addOrderBy('contents.createdAt', pageOptionsDto.order);
  //       break;
  //   }
  //   let contentWithCommentCount: Content[] = [];
  //   let itemCount = 0;
  //
  //   if (user) {
  //     // 좋아요 정보 가져오기
  //     const likes = await this.likeRepository.find({
  //       where: { user: { id: user.id } },
  //       relations: ['content'],
  //     });
  //
  //     // 좋아요 정보 매핑
  //     const contentsWithLikes = likes.map((like) => {
  //       const content = like.content;
  //       content.isLiked = true;
  //       return content;
  //     });
  //
  //     itemCount = contentsWithLikes.length;
  //
  //     // 페이징 적용
  //     contentWithCommentCount = contentsWithLikes.slice(
  //       pageOptionsDto.skip,
  //       pageOptionsDto.skip + pageOptionsDto.take,
  //     );
  //   } else {
  //     // 사용자가 없는 경우
  //     [contentWithCommentCount, itemCount] = await queryBuilder
  //       .skip(pageOptionsDto.skip)
  //       .take(pageOptionsDto.take)
  //       .getManyAndCount();
  //   }
  //
  //   const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
  //   return new PageDto<Content>(contentWithCommentCount, pageMetaDto);
  // }
  async contentGetAll(
    pageOptionsDto: PageOptionsDto,
    searchQuery?: string,
    sortType?: string,
    tag?: string,
    user?: { id: string },
  ): Promise<PageDto<Content>> {
    const queryBuilder =
      await this.contentRepository.createQueryBuilder('contents');
    queryBuilder.leftJoinAndSelect('contents.writer', 'writer');
    if (tag) {
      queryBuilder.andWhere(':tag = ANY(contents.tag)', {
        tag,
      });
    }
    if (searchQuery) {
      console.log(searchQuery);
      queryBuilder.where(
        'contents.title LIKE :searchQuery OR contents.desc LIKE :searchQuery OR :searchQuery = ANY(contents.tag)',
        { searchQuery: `%${searchQuery}%` },
      );
      queryBuilder.andWhere(':searchQuery = ANY(contents.tag)', {
        searchQuery,
      });
    }

    switch (sortType) {
      case 'like':
        queryBuilder.addOrderBy('contents.likeCount', 'DESC');
        break;
      case 'commentcount':
        queryBuilder.addOrderBy('contents.commentCount', 'DESC');
        break;
      default:
        queryBuilder.addOrderBy('contents.createdAt', pageOptionsDto.order);
        break;
    }

    let contentWithCommentCount: Content[] = [];
    let itemCount = 0;

    if (user) {
      const likes = await this.likeRepository.find({
        where: { user: { id: user.id } },
        relations: ['content'],
      });

      const contentIdsWithLikes = likes.map((like) => like.content.id);

      [contentWithCommentCount, itemCount] = await queryBuilder
        .skip(pageOptionsDto.skip)
        .take(pageOptionsDto.take)
        .getManyAndCount();

      contentWithCommentCount.forEach((content) => {
        content.isLiked = contentIdsWithLikes.includes(content.id);
      });
    } else {
      // 사용자가 없는 경우
      [contentWithCommentCount, itemCount] = await queryBuilder
        .skip(pageOptionsDto.skip)
        .take(pageOptionsDto.take)
        .getManyAndCount();
    }

    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Content>(contentWithCommentCount, pageMetaDto);
  }

  async contentGetById(id: string, user: User) {
    const content = await this.contentRepository
      .createQueryBuilder('content')
      .leftJoinAndSelect('content.writer', 'writer')
      .leftJoinAndSelect('content.comment', 'comment')
      .leftJoinAndSelect('comment.writer', 'commentWriter') // Add this line to join comment.writer
      .where('content.id= :id', { id })
      .orderBy('comment.createdAt', 'DESC')
      .getOne();
    if (user) {
      const likes = await this.likeRepository.find({
        where: { user: { id: user.id } },
        relations: ['content'],
      });
      content.isLiked = likes.some((like) => like.content.id === content.id);
    }

    return { content };
  }

  async contentUpdateById(
    id: string,
    updateContentDto: UpdateContentDto,
    user: User,
    files: Express.Multer.File[],
  ) {
    try {
      const currentDateTime = new Date();
      const content = await this.contentRepository.findOne({
        where: { id },
        relations: ['writer'],
      });

      if (!content) {
        throw new NotFoundException('Content not found');
      }

      if (content.writer.id !== user.id) {
        throw new ForbiddenException(
          'You do not have permission to update this content',
        );
      }

      // files가 제공된 경우에만 이미지 삭제 및 업로드 수행
      if (files && files.length > 0) {
        await Promise.all(
          content.img.map(async (imageUrl) => {
            try {
              const key = this.extractS3KeyFromUrl(imageUrl);
              await this.deleteS3Object(key);
            } catch (error) {
              console.error('Error deleting S3 object:', error);
            }
          }),
        );

        // files가 제공된 경우에만 새로운 이미지 업로드
        const uploadedImageUrls = await Promise.all(
          files.map(async (file) => {
            const { key, contentType } = await this.uploadFileToS3(
              'content',
              file,
            );
            return this.getAwsS3FileUrl(key);
          }),
        );
        // 이미지 URL로 업데이트
        await this.contentRepository.update(
          { id },
          {
            ...updateContentDto,
            img: uploadedImageUrls,
            updatedAt: new Date(currentDateTime.getTime() + 9 * 60 * 60 * 1000),
          },
        );
      } else {
        // files가 없는 경우에는 이미지 업로드 및 삭제 로직 생략
        // 이미지 URL로 업데이트
        await this.contentRepository.update(
          { id },
          {
            ...updateContentDto,
            updatedAt: new Date(currentDateTime.getTime() + 9 * 60 * 60 * 1000),
          },
        );
      }

      // updatedAt 갱신

      // await this.contentRepository.save(content);

      return 'Updated content';
    } catch (error) {
      console.error('Error updating content:', error);
      throw new BadRequestException('Failed to update content');
    }
  }

  private extractS3KeyFromUrl(url: string): string {
    const urlParts = url.split('/');
    const contentIndex = urlParts.indexOf('content');
    return urlParts.slice(contentIndex).join('/');
  }

  async contentDeleteById(id: string, user: User) {
    try {
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
      await Promise.all(
        content.img.map(async (imageUrl) => {
          try {
            const key = this.extractS3KeyFromUrl(imageUrl);
            console.log(key);
            await this.deleteS3Object(key);
          } catch (error) {
            console.error('Error deleting S3 object:', error);
          }
        }),
      );

      await this.contentRepository.delete(id);
      return 'deleted';
    } catch (error) {
      console.error('Error deleting content:', error);
      throw new BadRequestException('Failed to delete content');
    }
  }
}

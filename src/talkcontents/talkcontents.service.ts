import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTalkcontentDto } from './dto/create-talkcontent.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Talkcontent } from './entities/talkcontent.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { PageDto } from '../common/dtos/page.dto';
import { PageMetaDto } from '../common/dtos/page-meta.dto';
import { UpdateTalkcontentDto } from './dto/update-talkcontent.dto';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import * as path from 'path';
import { Content } from '../contents/entities/content.entity';

@Injectable()
export class TalkcontentsService {
  private readonly awsS3: AWS.S3;
  private readonly S3_BUCKET_NAME: string;
  constructor(
    @InjectRepository(Talkcontent)
    private talkcontentRepository: Repository<Talkcontent>,
    private readonly configService: ConfigService,
  ) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'), // process.env.AWS_S3_ACCESS_KEY
      secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }

  async talkContentCreate(
    createTalkcontentDto: CreateTalkcontentDto,
    user: User,
    files: Express.Multer.File[],
  ) {
    try {
      const uploadedImageUrls = await Promise.all(
        files.map(async (file) => {
          const { key, contentType } = await this.uploadFileToS3(
            'talkContents',
            file,
          );
          return this.getAwsS3FileUrl(key);
        }),
      );
      const newTalkContent = await this.talkcontentRepository.create({
        ...createTalkcontentDto,
        writer: user,
        img: uploadedImageUrls,
      });

      await this.talkcontentRepository.save(newTalkContent);
      return newTalkContent;
    } catch (error) {
      console.error('Error creating Talkcontent:', error);
      throw new BadRequestException('Failed to create Talkcontent');
    }
  }

  async talkContentGetAll(
    pageOptionsDto: PageOptionsDto,
    searchQuery?: string,
    sortType?: string,
    tag?: string,
  ): Promise<PageDto<Talkcontent>> {
    const queryBuilder =
      await this.talkcontentRepository.createQueryBuilder('talkContents');
    queryBuilder.leftJoinAndSelect('talkContents.writer', 'writer');
    if (tag) {
      queryBuilder.andWhere(':paramTag = ANY(talkContents.tag)', {
        paramTag: tag,
      });
    }

    if (searchQuery) {
      queryBuilder.where(
        'talkContents.title LIKE :searchQuery OR talkContents.desc LIKE :searchQuery OR :searchQuery = ANY(talkContents.tag)',
        { searchQuery: `%${searchQuery}%` },
      );
      queryBuilder.andWhere(':searchQuery = ANY(talkContents.tag)', {
        searchQuery,
      });
    }

    switch (sortType) {
      case 'like':
        queryBuilder.addOrderBy('talkContents.likeCount', 'DESC');
        break;
      case 'commentcount':
        queryBuilder.addOrderBy('talkContents.commentCount', 'DESC');
        break;
      default:
        queryBuilder.addOrderBy('talkContents.createdAt', pageOptionsDto.order);
        break;
    }
    // 페이지네이션 로직을 여기서 수행
    const [contentWithCommentCount, itemCount] = await queryBuilder
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take)
      .getManyAndCount();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Talkcontent>(contentWithCommentCount, pageMetaDto);
  }

  async talkContentGetById(id: string) {
    const talkContet = await this.talkcontentRepository.findOne({
      where: { id },
      relations: ['like'],
    });
    const talkContent = await this.talkcontentRepository
      .createQueryBuilder('talkContent')
      .leftJoinAndSelect('talkContent.writer', 'writer')
      .leftJoinAndSelect('talkContent.comment', 'comment')
      .where('talkContent.id= :id', { id })
      .getOne();

    return { talkContent };
  }

  async talkContentUpdateById(
    id: string,
    updateTalkcontentDto: UpdateTalkcontentDto,
    user: User,
    files: Express.Multer.File[],
  ) {
    const content = await this.talkcontentRepository.findOne({
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
            'talkContents',
            file,
          );
          return this.getAwsS3FileUrl(key);
        }),
      );

      // 이미지 URL로 업데이트
      await this.talkcontentRepository.update(id, {
        ...updateTalkcontentDto,
        img: uploadedImageUrls,
      });
    } else {
      // files가 없는 경우에는 이미지 업로드 및 삭제 로직 생략
      await this.talkcontentRepository.update(id, updateTalkcontentDto);
    }
  }

  async tallContentDeleteById(id: string, user: User) {
    const content = await this.talkcontentRepository.findOne({
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
    await this.talkcontentRepository.delete(id);
    return 'deleted';
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

  public getAwsS3FileUrl(objectKey: string) {
    return `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${objectKey}`;
  }

  private extractS3KeyFromUrl(url: string): string {
    const urlParts = url.split('/');
    const contentIndex = urlParts.indexOf('talkContents');
    return urlParts.slice(contentIndex).join('/');
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
}

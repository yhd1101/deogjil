import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { UpdateUserDto } from './dto/update-user.dto';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { PromiseResult } from 'aws-sdk/lib/request';
import * as path from 'path';
import { CACHE_MANAGER } from '@nestjs/common/cache';
import { Cache } from 'cache-manager';
import { Content } from '../contents/entities/content.entity';
import { Talkcontent } from '../talkcontents/entities/talkcontent.entity';

@Injectable()
export class UserService {
  private readonly awsS3: AWS.S3;
  public readonly S3_BUCKET_NAME: string;
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Content) private contentRepository: Repository<Content>,
    @InjectRepository(Talkcontent)
    private talkcontentRepository: Repository<Talkcontent>,
  ) {
    this.awsS3 = new AWS.S3({
      accessKeyId: this.configService.get('AWS_S3_ACCESS_KEY'),
      secretAccessKey: this.configService.get('AWS_S3_SECRET_KEY'),
      region: this.configService.get('AWS_S3_REGION'),
    });
    this.S3_BUCKET_NAME = this.configService.get('AWS_S3_BUCKET_NAME');
  }

  async CreateUser(createUserDto: CreateUserDto) {
    const user = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (user) {
      throw new BadRequestException('user email exits');
    }
    const newSignup = await this.userRepository.create(createUserDto);
    await this.userRepository.save(newSignup);
    return newSignup;
  }
  async getUserInfo(id: string) {
    const profile = await this.userRepository.findOne({
      where: { id },
      relations: ['content', 'talkContent'],
    });
    return profile;
  }

  //user찾기 (by id)
  async getUserById(id: string) {
    const user = await this.userRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('No user Id');
    }
    return user;
  }

  async deleteByUser(id: string) {
    const user = await this.userRepository.findOne({
      where: { id },
      relations: [
        'like.content',
        'likeTalkContent.content',
        'commetComment.content',
        'commentTalkComment.content',
      ],
    });
    if (!user) {
      throw new NotFoundException('No user');
    }
    await Promise.all(
      user.commetComment.map(async (comment) => {
        // commetComment의 content의 commentCount를 -1 해줍니다.
        await this.contentRepository
          .createQueryBuilder()
          .update(Content)
          .set({ commentCount: () => '"commentCount" - 1' })
          .where('id = :contentId', { contentId: comment.content.id })
          .execute();

        // commetComment
      }),
    );

    await Promise.all(
      user.commentTalkComment.map(async (comment) => {
        await this.talkcontentRepository
          .createQueryBuilder()
          .update(Talkcontent)
          .set({ commentCount: () => '"commentCount" - 1' })
          .where('id = :contentId', { contentId: comment.content.id })
          .execute();

        // commentTalkComment를 삭제합니다.
      }),
    ); // 사용자가 좋아요한 항목을 모두 가져와서 각 항목의 likeCount를 -1 해줍니다.
    await Promise.all(
      user.like.map(async (like) => {
        await this.contentRepository
          .createQueryBuilder()
          .update(Content)
          .set({ likeCount: () => '"likeCount" - 1' })
          .where('id = :contentId', { contentId: like.content.id })
          .execute();
      }),
    );
    await Promise.all(
      user.likeTalkContent.map(async (likeTalkContent) => {
        // talkContent의 likeCount를 -1 해줍니다.
        await this.talkcontentRepository
          .createQueryBuilder()
          .update(Talkcontent)
          .set({ likeCount: () => '"likeCount" - 1' })
          .where('id = :contentId', { contentId: likeTalkContent.content.id })
          .execute();
      }),
    );

    // 사용자 엔티티를 삭제합니다.
    await this.userRepository.delete(id);

    return 'deleted';
  }

  async addToBlacklist(token: string) {
    const cacheKey = `token:${token}`; // 토큰을 기반으로한 캐시 키 생성
    await this.cacheManager.set(cacheKey, token); // 토큰을 값으로 설정
  }

  async isTokenBlacklisted(token: string): Promise<boolean> {
    const cacheKey = `token:${token}`; // 토큰을 기반으로한 캐시 키 생성
    const result = await this.cacheManager.get(cacheKey); // 캐시에서 값을 가져옴
    return result !== null;
  }
  async updateUser(
    id: string,
    updateUserDto: UpdateUserDto,
    file: Express.Multer.File,
  ) {
    const currentDateTime = new Date();
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException('no user');
    }
    const isNicknameDuplicate = await this.checkNicknameDuplicate(
      updateUserDto.nickname,
    );
    if (isNicknameDuplicate) {
      throw new BadRequestException(
        'Nickname is already in use. Please choose a different one.',
      );
    }
    if (file) {
      if (user.profileImg) {
        const keyToDelete = this.extractS3KeyFromUrl(user.profileImg);
        await this.deleteS3Object(keyToDelete);
      }
      // 파일 업로드 처리
      const { key, contentType } = await this.uploadFileToS3('user', file);
      const newImageUrl = this.getAwsS3FileUrl(key);
      await this.userRepository.update(
        { id },
        {
          ...updateUserDto,
          profileImg: newImageUrl,
          updatedAt: new Date(currentDateTime.getTime() + 9 * 60 * 60 * 1000),
        },
      );
    } else {
      await this.userRepository.update(
        { id },
        {
          ...updateUserDto,
          updatedAt: new Date(currentDateTime.getTime() + 9 * 60 * 60 * 1000),
        },
      );
    }
    return 'updated user';
  }

  async checkNicknameDuplicate(nickname: string): Promise<boolean> {
    const existingUser = await this.userRepository.findOne({
      where: { nickname },
    });

    return !!existingUser;
  }

  //email로 찾기
  async getUserByEmail(email: string) {
    const user = await this.userRepository.findOneBy({ email });
    if (!user) {
      throw new NotFoundException('No user Email');
    }
    return user;
  }

  async setCurrentRefreshToken(refreshToken: string, userId: string) {
    const saltValue = await bcrypt.genSalt(10);
    const currentHashedRefreshToken = await bcrypt.hash(
      refreshToken,
      saltValue,
    );
    await this.userRepository.update(userId, {
      currentHashedRefreshToken,
    });
  }

  //리프레시토큰 검증 함수
  async getUserIfRefreshTokenMatches(refreshToken: string, userId: string) {
    const user = await this.getUserById(userId);
    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.currentHashedRefreshToken,
    );
    if (isRefreshTokenMatching) return user;
  }

  //로그아웃시 실행되는 함수
  async removeRefreshToken(userId: string) {
    return this.userRepository.update(userId, {
      currentHashedRefreshToken: null,
    });
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
  private extractS3KeyFromUrl(url: string): string {
    const urlParts = url.split('/');
    const contentIndex = urlParts.indexOf('content');
    return urlParts.slice(contentIndex).join('/');
  }

  public getAwsS3FileUrl(objectKey: string) {
    return `https://${this.S3_BUCKET_NAME}.s3.amazonaws.com/${objectKey}`;
  }
}

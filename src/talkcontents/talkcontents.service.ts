import {
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

@Injectable()
export class TalkcontentsService {
  constructor(
    @InjectRepository(Talkcontent)
    private talkcontentRepository: Repository<Talkcontent>,
  ) {}

  async talkContentCreate(
    createTalkcontentDto: CreateTalkcontentDto,
    user: User,
  ) {
    const newTalkContent = await this.talkcontentRepository.create({
      ...createTalkcontentDto,
      writer: user,
    });

    await this.talkcontentRepository.save(newTalkContent);
    return newTalkContent;
  }

  async talkContentGetAll(
    pageOptionsDto: PageOptionsDto,
  ): Promise<PageDto<Talkcontent>> {
    const queryBuilder =
      await this.talkcontentRepository.createQueryBuilder('talkContents'); //db에 쿼리를직접 해줌
    queryBuilder.leftJoinAndSelect('talkContents.writer', 'writer');

    await queryBuilder
      .orderBy('talkContents.createdAt', pageOptionsDto.order)
      .skip(pageOptionsDto.skip)
      .take(pageOptionsDto.take);
    const itemCount = await queryBuilder.getCount();
    const { entities } = await queryBuilder.getRawAndEntities();
    const pageMetaDto = new PageMetaDto({ itemCount, pageOptionsDto });
    return new PageDto<Talkcontent>(entities, pageMetaDto);
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

    const count = talkContet.like.length;
    return { talkContent, likeCount: count };
  }

  async talkContentUpdateById(
    id: string,
    updateTalkcontentDto: UpdateTalkcontentDto,
    user: User,
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

    await this.talkcontentRepository.update(id, updateTalkcontentDto);
    return 'Updated talkContent';
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
    await this.talkcontentRepository.delete(id);
    return 'deleted';
  }
}

import { Injectable } from '@nestjs/common';
import { CreateTalkcontentDto } from './dto/create-talkcontent.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Talkcontent } from './entities/talkcontent.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

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

  async talkContentGetAll() {
    const queryBuilder =
      await this.talkcontentRepository.createQueryBuilder('talkContents'); //db에 쿼리를직접 해줌
    queryBuilder.leftJoinAndSelect('talkContents.writer', 'writer'); //관계형
    const { entities } = await queryBuilder.getRawAndEntities();
    return entities;
  }

  async talkContentGetById(id: string) {
    const talkContent = await this.talkcontentRepository
      .createQueryBuilder('talkContent')
      .leftJoinAndSelect('talkContent.writer', 'writer')
      .where('talkContent.id= :id', { id })
      .getOne();
    return talkContent;
  }

  async talkContentUpdateById(
    id: string,
    createTalkContentDto: CreateTalkcontentDto,
  ) {
    await this.talkcontentRepository.update(id, createTalkContentDto);

    return 'updated content';
  }

  async tallContentDeleteById(id: string) {
    await this.talkcontentRepository.delete({ id });
    return 'deleted';
  }
}

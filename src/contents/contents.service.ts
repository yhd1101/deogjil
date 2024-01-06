import { Injectable } from '@nestjs/common';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Content } from './entities/content.entity';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';

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

  async contentGetAll() {
    //?옵션 있어도그만없어도그만
    const queryBuilder =
      await this.contentRepository.createQueryBuilder('contents'); //db에 쿼리를직접 해줌
    queryBuilder.leftJoinAndSelect('contents.writer', 'writer'); //관계형
    const { entities } = await queryBuilder.getRawAndEntities();
    return entities;
  }
}

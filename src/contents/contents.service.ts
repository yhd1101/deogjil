import { Injectable } from '@nestjs/common';
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

    await this.contentRepository.save(newContent);

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

  async contentGetAll(page: number = 1): Promise<any> {
    const take = 8;

    const [contents, itemCount] = await this.contentRepository.findAndCount({
      take,
      skip: (page - 1) * take,
      relations: ['writer'], // Assuming 'writer' is the relation in your Content entity
      order: { createdAt: 'ASC' }, // Adjust the order as per your requirements
    });

    return {
      data: contents,
      meta: {
        itemCount,
        page,
        pageCount: Math.ceil(itemCount / take),
        hasPreviousPage: page > 1,
        hasNextPage: page < Math.ceil(itemCount / take),
      },
    };
  }
}

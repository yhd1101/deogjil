import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { SearchService } from './search.service';
import { CreateSearchDto } from './dto/create-search.dto';
import { UpdateSearchDto } from './dto/update-search.dto';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { PageDto } from '../common/dtos/page.dto';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  // @Get()
  // async search(
  //   @Query('query') query: string,
  //   @Query() pageOptionsDto: PageOptionsDto,
  // ): Promise<PageDto<any>> {
  //   const result = await this.searchService.search(query, pageOptionsDto);
  //   return result;
  // }
}

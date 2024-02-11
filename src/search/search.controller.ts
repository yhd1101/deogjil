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
import { ApiTags } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  async search(
    @Query('searchQuery') searchQuery?: string,
    @Query() pageOptionsDto?: PageOptionsDto,
  ): Promise<PageDto<any>> {
    const result = await this.searchService.search(pageOptionsDto, searchQuery);
    return result;
  }
}

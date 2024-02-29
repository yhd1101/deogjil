import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { PageDto } from '../common/dtos/page.dto';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';

@ApiTags('search')
@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Get()
  @ApiOperation({
    summary: '검색기능 Test',
    description: '전체검색 searchQuery=입력값, tag=태그값 입력 Test',
  })
  @ApiQuery({ name: 'searchQuery', required: false, description: '검색 유형' })
  @ApiQuery({ name: 'tag', required: false, description: '태그' })
  async search(
    @Query('searchQuery') searchQuery?: string,
    @Query('tag') tag?: string,
    @Query() pageOptionsDto?: PageOptionsDto,
  ): Promise<PageDto<any>> {
    const result = await this.searchService.search(
      pageOptionsDto,
      searchQuery,
      tag,
    );
    return result;
  }
}

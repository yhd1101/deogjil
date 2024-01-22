import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Query,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { ContentsService } from './contents.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { PageDto } from '../common/dtos/page.dto';
import { Content } from './entities/content.entity';

@ApiTags('Content')
@Controller('content')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post('/create')
  @ApiBody({ type: CreateContentDto })
  @ApiOperation({
    summary: '덕풀 글쓰기',
    description: '글쓰는기능 이미지 등등',
  })
  @ApiResponse({
    description: 'create content',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  async createContent(
    @Req() req: RequestWithUserInterface,
    @Body() createContentDto: CreateContentDto,
  ) {
    const newContent = await this.contentsService.contentCreate(
      createContentDto,
      req.user,
    );
    return newContent;
  }

  @Get()
  @ApiOperation({ summary: '글전체목록', description: '전체 글 조회' })
  async getAllContent(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query('search') searchQuery?: string,
  ): Promise<PageDto<Content>> {
    return await this.contentsService.contentGetAll(
      pageOptionsDto,
      searchQuery,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '글 상세페이지',
    description: '글 상세페이지 불러옴',
  })
  async getContentById(@Param('id') id: string) {
    try {
      const content = await this.contentsService.contentGetById(id);
      return content;
    } catch (err) {
      throw new NotFoundException('No Content');
    }
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: '글 수정', description: '글을 수정해줌' })
  async updateContentById(
    @Body() updateContentDto: UpdateContentDto,
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
  ) {
    console.log('dddd', id);
    // 현재 사용자 정보를 서비스 레이어로 전달
    return await this.contentsService.contentUpdateById(
      id,
      updateContentDto,
      req.user,
    );
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: '글 삭제', description: '글을 삭제함' })
  async deleteContentById(
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
  ) {
    return await this.contentsService.contentDeleteById(id, req.user);
  }
}

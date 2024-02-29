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
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { ContentsService } from './contents.service';
import { CreateContentDto } from './dto/create-content.dto';
import { UpdateContentDto } from './dto/update-content.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { PageDto } from '../common/dtos/page.dto';
import { Content } from './entities/content.entity';
import { FilesInterceptor } from '@nestjs/platform-express';
import { JwtOptionalAuthGuard } from '../auth/guards/jwtOptional-auth.guard';

@ApiTags('Content')
@Controller('content')
export class ContentsController {
  constructor(private readonly contentsService: ContentsService) {}

  @Post('/create')
  @ApiConsumes('multipart/form-data')
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
  @UseInterceptors(FilesInterceptor('files'))
  async createContent(
    @Req() req: RequestWithUserInterface,
    @Body() createContentDto: CreateContentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const newContent = await this.contentsService.contentCreate(
      createContentDto,
      req.user,
      files,
    );
    return newContent;
  }

  @Get()
  @ApiOperation({
    summary: '글전체목록',
    description:
      '전체 글 조회 sortType= like(좋아요 많은순), sortType=commentcount (댓글많은순)',
  })
  @UseGuards(JwtOptionalAuthGuard)
  @ApiQuery({ name: 'search', required: false, description: '검색 유형' })
  @ApiQuery({ name: 'sortType', required: false, description: '정렬 유형' })
  @ApiQuery({ name: 'tag', required: false, description: '태그' })
  async getAllContent(
    @Req() req: RequestWithUserInterface,
    @Query() pageOptionsDto: PageOptionsDto,
    @Query('search') searchQuery?: string,
    @Query('sortType') sortType?: string,
    @Query('tag') tag?: string,
  ): Promise<PageDto<Content>> {
    const user = req.user;
    return await this.contentsService.contentGetAll(
      pageOptionsDto,
      searchQuery,
      sortType,
      tag,
      user,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '글 상세페이지',
    description: '글 상세페이지  불러옴',
  })
  @UseGuards(JwtOptionalAuthGuard)
  async getContentById(
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
  ) {
    try {
      const user = req.user;
      const content = await this.contentsService.contentGetById(id, user);
      return content;
    } catch (err) {
      throw new NotFoundException('No Content');
    }
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @UseInterceptors(FilesInterceptor('files'))
  @ApiOperation({ summary: '글 수정', description: '글을 수정해줌' })
  async updateContentById(
    @Body() updateContentDto: UpdateContentDto,
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    console.log('dddd', req.user);
    // 현재 사용자 정보를 서비스 레이어로 전달
    return await this.contentsService.contentUpdateById(
      id,
      updateContentDto,
      req.user,
      files,
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

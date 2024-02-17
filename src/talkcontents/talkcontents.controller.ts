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
  Put,
  NotFoundException,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { TalkcontentsService } from './talkcontents.service';
import { CreateTalkcontentDto } from './dto/create-talkcontent.dto';
import { UpdateTalkcontentDto } from './dto/update-talkcontent.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { PageDto } from '../common/dtos/page.dto';
import { Talkcontent } from './entities/talkcontent.entity';
import { CreateContentDto } from '../contents/dto/create-content.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { multerOptions } from '../common/utils/multer.options';

@ApiTags('talkContents')
@Controller('talkcontents')
export class TalkcontentsController {
  constructor(private readonly talkcontentsService: TalkcontentsService) {}

  @Post('/create')
  @ApiBody({ type: CreateTalkcontentDto })
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
    @Body() createTalkcontentDto: CreateTalkcontentDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    const newContent = await this.talkcontentsService.talkContentCreate(
      createTalkcontentDto,
      req.user,
      files,
    );
    return newContent;
  }

  @Get()
  @ApiOperation({
    summary: '덕질토크 전체조회',
    description: '덕질토크 전체조회해줌',
  })
  @ApiQuery({ name: 'search', required: false, description: '검색 유형' })
  @ApiQuery({ name: 'sortType', required: false, description: '정렬 유형' })
  @ApiQuery({ name: 'tag', required: false, description: '태그' })
  async getAllTalkContents(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query('search') searchQuery?: string,
    @Query('sortType') sortType?: string,
    @Query('tag') tag?: string,
  ): Promise<PageDto<Talkcontent>> {
    return await this.talkcontentsService.talkContentGetAll(
      pageOptionsDto,
      searchQuery,
      sortType,
      tag,
    );
  }

  @Get(':id')
  @ApiOperation({
    summary: '글 상세페이지',
    description: '글 상세페이지 불러옴',
  })
  async getTalkContentById(@Param('id') id: string) {
    try {
      const content = await this.talkcontentsService.talkContentGetById(id);
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
  async updateTalkContentById(
    @Body() updateTalkcontentDto: UpdateTalkcontentDto,
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
    @UploadedFiles() files: Array<Express.Multer.File>,
  ) {
    return await this.talkcontentsService.talkContentUpdateById(
      id,
      updateTalkcontentDto,
      req.user,
      files,
    );
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: '글 삭제', description: '글을 삭제함' })
  async deleteTalkContentById(
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
  ) {
    return await this.talkcontentsService.tallContentDeleteById(id, req.user);
  }
}

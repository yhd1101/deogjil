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
} from '@nestjs/common';
import { TalkcontentsService } from './talkcontents.service';
import { CreateTalkcontentDto } from './dto/create-talkcontent.dto';
import { UpdateTalkcontentDto } from './dto/update-talkcontent.dto';
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
import { Talkcontent } from './entities/talkcontent.entity';
import { CreateContentDto } from '../contents/dto/create-content.dto';

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
  async createContent(
    @Req() req: RequestWithUserInterface,
    @Body() createTalkcontentDto: CreateTalkcontentDto,
  ) {
    const newContent = await this.talkcontentsService.talkContentCreate(
      createTalkcontentDto,
      req.user,
    );
    return newContent;
  }

  @Get()
  @ApiOperation({
    summary: '덕질토크 전체조회',
    description: '덕질토크 전체조회해줌',
  })
  async getAllTalkContents(
    @Query() pageOptionsDto: PageOptionsDto,
    @Query('search') searchQuery?: string,
  ): Promise<PageDto<Talkcontent>> {
    return await this.talkcontentsService.talkContentGetAll(
      pageOptionsDto,
      searchQuery,
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
  @ApiOperation({ summary: '글 수정', description: '글을 수정해줌' })
  async updateTalkContentById(
    @Body() updateTalkcontentDto: UpdateTalkcontentDto,
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
  ) {
    return await this.talkcontentsService.talkContentUpdateById(
      id,
      updateTalkcontentDto,
      req.user,
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

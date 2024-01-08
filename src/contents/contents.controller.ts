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
  async getAllContent(@Query('page') page: number) {
    return await this.contentsService.contentGetAll(page);
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

  @Put(':id')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: '글 수정', description: '글을 수정해줌' })
  async updateContentById(
    @Body() createContentDto: CreateContentDto,
    @Param('id') id: string,
  ) {
    try {
      return await this.contentsService.contentUpdateById(id, createContentDto);
    } catch (err) {
      throw new NotFoundException('No Content');
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: '글 삭제', description: '글을 삭제함' })
  async deleteContentById(@Param('id') id: string) {}
}

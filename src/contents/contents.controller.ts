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
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';

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
  @UseGuards(JwtAuthGuard)
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
  async getAllContent() {
    return await this.contentsService.contentGetAll();
  }
}

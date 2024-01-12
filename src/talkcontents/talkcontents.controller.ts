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
} from '@nestjs/common';
import { TalkcontentsService } from './talkcontents.service';
import { CreateTalkcontentDto } from './dto/create-talkcontent.dto';
import { UpdateTalkcontentDto } from './dto/update-talkcontent.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';
import { PageOptionsDto } from '../common/dtos/page-options.dto';
import { PageDto } from '../common/dtos/page.dto';
import { Talkcontent } from './entities/talkcontent.entity';

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
  ): Promise<PageDto<Talkcontent>> {
    return await this.talkcontentsService.talkContentGetAll(pageOptionsDto);
  }
}

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
}

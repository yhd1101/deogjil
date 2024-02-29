import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LikeTalkContentService } from './like-talk-content.service';
import { CreateLikeTalkContentDto } from './dto/create-like-talk-content.dto';
import { UpdateLikeTalkContentDto } from './dto/update-like-talk-content.dto';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateLikeDto } from '../likes/dto/create-like.dto';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';

@ApiTags('likeTalkContent')
@Controller('liketalkcontent')
export class LikeTalkContentController {
  constructor(
    private readonly likeTalkContentService: LikeTalkContentService,
  ) {}

  @Post('create')
  @ApiBody({ type: CreateLikeTalkContentDto })
  @ApiOperation({
    summary: '덕질토크 좋아요기능',
    description: '덕질토크좋아요기능',
  })
  @ApiOperation({
    description: 'Like',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  async likeContent(
    @Req() req: RequestWithUserInterface,
    @Body() createLikeTalkContentDto: CreateLikeTalkContentDto,
  ) {
    console.log(createLikeTalkContentDto);
    const likeCount = await this.likeTalkContentService.createLike(
      req.user,
      createLikeTalkContentDto,
    );
    return likeCount;
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '덕질토크 좋아요취소',
    description: '덕질토크 좋아요취소 likeid 입력',
  })
  async likeCancel(@Param('contentId') contentId: string) {
    await this.likeTalkContentService.deleteLike(contentId);
  }
}

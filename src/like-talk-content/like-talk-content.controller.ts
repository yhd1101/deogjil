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
import { LikeTalkContentService } from './like-talk-content.service';
import { CreateLikeTalkContentDto } from './dto/create-like-talk-content.dto';
import { UpdateLikeTalkContentDto } from './dto/update-like-talk-content.dto';
import { ApiBearerAuth, ApiBody, ApiOperation } from '@nestjs/swagger';
import { CreateLikeDto } from '../likes/dto/create-like.dto';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';

@Controller('like-talk-content')
export class LikeTalkContentController {
  constructor(
    private readonly likeTalkContentService: LikeTalkContentService,
  ) {}

  @Post('create')
  @ApiBody({ type: CreateLikeDto })
  @ApiOperation({
    summary: '덕질토크 좋아요기능',
    description: '좋아요기능',
  })
  @ApiOperation({
    description: 'duck talk like',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  async like(
    @Req() req: RequestWithUserInterface,
    @Body() createLikeTalkContentDto: CreateLikeTalkContentDto,
  ) {
    const like = await this.likeTalkContentService.createLike(
      req.user,
      createLikeTalkContentDto,
    );
    return like;
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '덕질토크 좋아요취소',
    description: '덕질토크 좋아요취소',
  })
  async likeCancel(@Param('id') id: string) {
    await this.likeTalkContentService.deleteLike(id);
  }
}

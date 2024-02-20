import {
  Controller,
  Post,
  Body,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { LikesService } from './likes.service';
import { CreateLikeDto } from './dto/create-like.dto';
import { UpdateLikeDto } from './dto/update-like.dto';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';
import { ApiBearerAuth, ApiBody, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Like')
@Controller('like')
export class LikesController {
  constructor(private readonly likesService: LikesService) {}

  @Post('create')
  @ApiBody({ type: CreateLikeDto })
  @ApiOperation({
    summary: '덕질자랑 좋아요기능',
    description: '덕질자랑좋아요기능',
  })
  @ApiOperation({
    description: 'Like',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  async likeContent(
    @Req() req: RequestWithUserInterface,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    const likeCount = await this.likesService.createLike(
      req.user,
      createLikeDto,
    );
    return likeCount;
  }
  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({
    summary: '좋아요 취소',
    description: ' 좋아요취소 like id 입력',
  })
  async likeDelete(@Param('contentId') contentId: string) {
    console.log('ddd', contentId);
    await this.likesService.deleteLike(contentId);
  }
}

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
    summary: '좋아요기능',
    description: '좋아요기능',
  })
  @ApiOperation({
    description: 'like',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  async likeContent(
    @Req() req: RequestWithUserInterface,
    @Body() createLikeDto: CreateLikeDto,
  ) {
    console.log(createLikeDto);
    const likeCount = await this.likesService.likeContent(
      req.user,
      createLikeDto,
    );
    return likeCount;
  }
}

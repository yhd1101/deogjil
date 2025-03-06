import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from '@nestjs/common';
import { CommentTalkContentService } from './comment-talk-content.service';
import { CreateCommentTalkContentDto } from './dto/create-comment-talk-content.dto';
import { UpdateCommentTalkContentDto } from './dto/update-comment-talk-content.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';

@ApiTags('commentTalkContent')
@Controller('commentTalkContent')
export class CommentTalkContentController {
  constructor(
    private readonly commentTalkContentService: CommentTalkContentService,
  ) {}

  @Post('/create')
  @ApiBody({ type: CreateCommentTalkContentDto })
  @ApiOperation({
    summary: '덕질토크 글쓰기 댓글',
    description: '댓글작성',
  })
  @ApiResponse({
    description: 'create talkContent Comment',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  async createComment(
    @Req() req: RequestWithUserInterface,
    @Body() createCommentTalkContentDto: CreateCommentTalkContentDto,
  ) {
    const newComment = await this.commentTalkContentService.commentCreate(
      createCommentTalkContentDto,
      req.user,
    );
    return newComment;
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: '댓글수정', description: '댓글수정' })
  async updateComment(
    @Body() updateCommentTalkContentDto: UpdateCommentTalkContentDto,
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
  ) {
    return await this.commentTalkContentService.commentUpdate(
      id,
      updateCommentTalkContentDto,
      req.user,
    );
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: '댓글삭제', description: '댓글삭제' })
  async deleteComment(
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
  ) {
    return await this.commentTalkContentService.commentDelete(id, req.user);
  }
}

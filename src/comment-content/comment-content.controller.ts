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
  Put,
} from '@nestjs/common';
import { CommentContentService } from './comment-content.service';
import { CreateCommentContentDto } from './dto/create-comment-content.dto';
import { UpdateCommentContentDto } from './dto/update-comment-content.dto';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';

@ApiTags('CommentContent')
@Controller('commentContent')
export class CommentContentController {
  constructor(private readonly commentContentService: CommentContentService) {}

  @Post('/create')
  @ApiBody({ type: CreateCommentContentDto })
  @ApiOperation({
    summary: '덕질자랑 글쓰기 댓글',
    description: '댓글작성',
  })
  @ApiResponse({
    description: 'create content Comment',
  })
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  async createComment(
    @Req() req: RequestWithUserInterface,
    @Body() createCommentContentDto: CreateCommentContentDto,
  ) {
    const newComment = await this.commentContentService.commentCreate(
      createCommentContentDto,
      req.user,
    );

    return newComment;
  }

  @Patch(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: '댓글수정', description: '댓글수정' })
  async updateComment(
    @Body() updateCommentContentDto: UpdateCommentContentDto,
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
  ) {
    return await this.commentContentService.commentUpdate(
      id,
      updateCommentContentDto,
      req.user,
    );
  }

  @Get('/c')
  async commentGetAll() {
    const data = await this.commentContentService.commentGetAll();
    return data;
  }

  @Delete(':id')
  @ApiBearerAuth('access-token')
  @UseGuards(JwtAccessAuthGuard)
  @ApiOperation({ summary: '댓글삭제', description: '댓글삭제' })
  async deleteComment(
    @Param('id') id: string,
    @Req() req: RequestWithUserInterface,
  ) {
    return await this.commentContentService.commentDelete(id, req.user);
  }
}

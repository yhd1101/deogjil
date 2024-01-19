import { PartialType } from '@nestjs/swagger';
import { CreateCommentContentDto } from './create-comment-content.dto';

export class UpdateCommentContentDto extends PartialType(CreateCommentContentDto) {}

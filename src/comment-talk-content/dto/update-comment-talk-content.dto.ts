import { PartialType } from '@nestjs/swagger';
import { CreateCommentTalkContentDto } from './create-comment-talk-content.dto';

export class UpdateCommentTalkContentDto extends PartialType(CreateCommentTalkContentDto) {}

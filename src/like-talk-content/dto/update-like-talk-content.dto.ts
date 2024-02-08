import { PartialType } from '@nestjs/swagger';
import { CreateLikeTalkContentDto } from './create-like-talk-content.dto';

export class UpdateLikeTalkContentDto extends PartialType(CreateLikeTalkContentDto) {}

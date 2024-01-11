import { PartialType } from '@nestjs/swagger';
import { CreateTalkcontentDto } from './create-talkcontent.dto';

export class UpdateTalkcontentDto extends PartialType(CreateTalkcontentDto) {}

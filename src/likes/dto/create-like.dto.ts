import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Content } from '../../contents/entities/content.entity';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

export class CreateLikeDto {
  @ApiProperty({
    description: 'insert contentId',
    default: 'contentId',
  })
  content?: Content;
}

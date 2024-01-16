import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Content } from '../../contents/entities/content.entity';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

export class CreateLikeDto {
  @ApiProperty({
    description: 'insert contentId',
    default: 'contentId',
    required: false,
  })
  @IsOptional()
  content?: Content;

  @ApiProperty({
    description: 'insert talkContent',
    default: 'talkContent',
    required: false,
  })
  @IsOptional()
  talkContent?: Talkcontent;
}

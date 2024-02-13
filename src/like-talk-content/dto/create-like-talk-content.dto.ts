import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

export class CreateLikeTalkContentDto {
  @ApiProperty({
    description: 'insert contentId',
    default: 'talkContentId',
  })
  talkcontent: Talkcontent;
}

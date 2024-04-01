import { ApiProperty } from '@nestjs/swagger';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

export class CreateLikeTalkContentDto {
  @ApiProperty({
    description: 'insert contentId',
    default: 'talkContentId',
  })
  content: Talkcontent;
}

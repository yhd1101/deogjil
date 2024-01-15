import { ApiProperty } from '@nestjs/swagger';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

export class CreateTalkLikeDto {
  @ApiProperty({
    description: 'insert talkcontentId',
    default: 'talkContentId',
  })
  talkContent: Talkcontent;
}

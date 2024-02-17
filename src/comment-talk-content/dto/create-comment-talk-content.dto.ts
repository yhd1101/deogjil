import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

export class CreateCommentTalkContentDto {
  @ApiProperty({
    description: 'insert desc',
    default: 'Good',
  })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({
    description: 'insert talkContentId',
    default: 'talkContentId',
  })
  @IsString()
  @IsNotEmpty()
  content: Talkcontent;
}

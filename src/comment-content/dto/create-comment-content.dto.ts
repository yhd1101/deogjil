import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';
import { Content } from '../../contents/entities/content.entity';

export class CreateCommentContentDto {
  @ApiProperty({
    description: 'insert desc',
    default: 'Good',
  })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({
    description: 'insert contentID',
    default: 'contentid',
  })
  content: Content;
}

import { ApiProperty } from '@nestjs/swagger';
import { Content } from '../../contents/entities/content.entity';

export class CreateLikeDto {
  @ApiProperty({
    description: 'insert contentId',
    default: 'contentId',
  })
  content?: Content;
}

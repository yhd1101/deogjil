import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { Content } from '../../contents/entities/content.entity';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

export class CreateLikeDto {
  @ApiProperty({
    description: 'insert contentId',
    example: { id: null }, // 예제 값 설정
    required: false,
  })
  @IsOptional()
  content?: Content;
}

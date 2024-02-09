import { ApiProperty } from '@nestjs/swagger';
import { IsOptional } from 'class-validator';
import { Talkcontent } from '../../talkcontents/entities/talkcontent.entity';

export class CreateLikeTalkContentDto {
  @ApiProperty({
    description: 'insert contentId',
    example: { id: 'id' }, // 예제 값 설정
  })
  @IsOptional()
  talkcontent: Talkcontent;
}

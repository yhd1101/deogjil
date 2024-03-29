import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class CreateContentDto {
  @ApiProperty({
    description: 'insert Title',
    default: 'title',
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'insert Descroption',
    default: 'default',
  })
  @IsString()
  desc: string;

  @ApiProperty({
    description: 'insert tag',
    default: ['Marble'],
  })
  public tag?: string[];

  @ApiProperty({
    type: 'array',
    items: {
      type: 'string',
      format: 'binary', // 이 부분이 파일 업로드를 나타냅니다.
    },
    description: 'Files to upload',
  })
  public files: any[];
}

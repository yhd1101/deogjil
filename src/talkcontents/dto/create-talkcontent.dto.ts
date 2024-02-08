import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateTalkcontentDto {
  @ApiProperty({
    description: 'insert Title',
    default: 'title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'insert Description',
    default: 'default',
  })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({
    description: 'insert tag',
    default: ['Marble'],
  })
  @IsArray()
  public tag?: string[];
}

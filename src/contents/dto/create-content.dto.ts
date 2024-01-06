import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsString } from 'class-validator';

export class CreateContentDto {
  @ApiProperty({
    description: 'insert Title',
    default: 'title',
  })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({
    description: 'insert Descroption',
    default: 'default',
  })
  @IsString()
  @IsNotEmpty()
  desc: string;

  @ApiProperty({
    description: 'insert Image',
    default: ['img'],
  })
  @IsArray()
  img?: string[];

  @ApiProperty({
    description: 'insert tag',
    default: ['Marble'],
  })
  @IsArray()
  public tag?: string[];
}

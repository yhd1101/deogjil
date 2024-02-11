import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { Provider } from '../entities/provider.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'name',
    default: 'name',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    description: 'email',
    default: 'email@gmail.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'insert password',
    default: 'a1234567!',
  }) //swag적용
  @IsString()
  @MinLength(7) //최소 7자리
  //최소 8 자, 최소 하나의 문자, 하나의 숫자 및 하나의 특수 문자 :
  @Matches(/^(?=.*[A-Za-z])(?=.*\d)(?=.*[$@$!%*#?&])[A-Za-z\d$@$!%*#?&]{8,}$/)
  password?: string;

  @ApiProperty({
    description: 'provider',
    default: 'kakao',
  })
  @IsString()
  @IsOptional()
  provider?: Provider;

  @ApiProperty({
    description: 'profile image URL',
    example: null,
  })
  @IsOptional()
  profileImg?: string;

  @ApiProperty({
    description: 'nickname',
    example: null,
    nullable: true,
  })
  @IsOptional()
  nickname?: string;
}

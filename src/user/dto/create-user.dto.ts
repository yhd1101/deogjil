import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';
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
    description: 'provider',
    default: 'kakao',
  })
  @IsString()
  @IsOptional()
  provider?: Provider;

  @ApiProperty()
  @IsOptional()
  profileImg: string;
}

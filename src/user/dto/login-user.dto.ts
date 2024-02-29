import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class LoginUserDto {
  @ApiProperty({
    description: 'insert email',
    default: 'abcd@google.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'insert password',
    default: 'a1234567@',
  })
  @IsString()
  password?: string;
}

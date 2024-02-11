import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
    }),
    TypeOrmModule.forFeature([User]),
    ConfigModule.forRoot(),
  ],
  controllers: [UserController],
  providers: [UserService, ConfigService],
  exports: [UserService],
})
export class UserModule {}

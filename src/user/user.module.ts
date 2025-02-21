import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as multer from 'multer';
import { Content } from '../contents/entities/content.entity';
import { Talkcontent } from '../talkcontents/entities/talkcontent.entity';
@Module({
  imports: [
    MulterModule.register({
      dest: './upload',
      storage: multer.memoryStorage(),
    }),
    TypeOrmModule.forFeature([User, Content, Talkcontent]),
    ConfigModule.forRoot(),
  ],
  controllers: [UserController],
  providers: [UserService, ConfigService],
  exports: [UserService],
})
export class UserModule {}

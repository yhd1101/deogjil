import {
  Controller,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UserService } from './user.service';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';
import { Express } from 'express';
import { JwtAccessAuthGuard } from '../auth/guards/jwtAccess-auth.guard';
import LocalFilesInterceptors from '../common/interceptors/localFiles.interceptors';
import { ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  // uploadImg(@UploadedFile() files: Array<Express.Multer.File>) {
  //   console.log(files);
  // }
}

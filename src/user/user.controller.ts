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
  @Post('avatar')
  @UseGuards(JwtAccessAuthGuard)
  @UseInterceptors(
    LocalFilesInterceptors({
      fieldName: 'file',
      path: '/avatars',
    }),
  )
  async addAvatar(
    @Req() req: RequestWithUserInterface,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) {
      // file 객체가 없을 경우 에러를 처리하거나 적절한 응답을 반환할 수 있습니다.
      return { error: 'No file uploaded' };
    }

    const uploadResult = await this.userService.addAvatar(req.user.id, {
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype,
    });

    return uploadResult;
  }
}

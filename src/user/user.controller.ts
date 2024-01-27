import { Controller, Req, UploadedFile } from '@nestjs/common';
import { UserService } from './user.service';
import { RequestWithUserInterface } from '../auth/requestWithUser.interface';
import { Express } from 'express';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

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
    return this.userService.addAvatar(req.user.id, {
      path: file.path,
      filename: file.originalname,
      mimetype: file.mimetype,
    });
  }
}

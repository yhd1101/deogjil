import { Controller } from '@nestjs/common';
import { LocalFilesService } from './local-files.service';

@Controller('local-files')
export class LocalFilesController {
  constructor(private readonly localFilesService: LocalFilesService) {}
}

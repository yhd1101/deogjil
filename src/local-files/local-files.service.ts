import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LocalFile } from './entities/local-file.entity';
import { Repository } from 'typeorm';

@Injectable()
export class LocalFilesService {
  constructor(
    @InjectRepository(LocalFile)
    private localFileRepository: Repository<LocalFile>,
  ) {}

  async saveLocalFileData(fileData: LocalFileDto) {
    const newFile = await this.localFileRepository.create(fileData);
    await this.localFileRepository.save(newFile);
    return newFile;
  }
}

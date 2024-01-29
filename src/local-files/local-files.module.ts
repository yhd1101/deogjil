import { Module } from '@nestjs/common';
import { LocalFilesService } from './local-files.service';
import { LocalFilesController } from './local-files.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LocalFile } from './entities/local-file.entity';

@Module({
  imports: [TypeOrmModule.forFeature([LocalFile])],
  controllers: [LocalFilesController],
  providers: [LocalFilesService],
  exports: [LocalFilesService],
})
export class LocalFilesModule {}

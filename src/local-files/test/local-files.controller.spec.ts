import { Test, TestingModule } from '@nestjs/testing';
import { LocalFilesController } from '../local-files.controller';
import { LocalFilesService } from '../local-files.service';

describe('LocalFilesController', () => {
  let controller: LocalFilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LocalFilesController],
      providers: [LocalFilesService],
    }).compile();

    controller = module.get<LocalFilesController>(LocalFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

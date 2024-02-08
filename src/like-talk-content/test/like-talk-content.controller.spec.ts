import { Test, TestingModule } from '@nestjs/testing';
import { LikeTalkContentController } from '../like-talk-content.controller';
import { LikeTalkContentService } from '../like-talk-content.service';

describe('LikeTalkContentController', () => {
  let controller: LikeTalkContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LikeTalkContentController],
      providers: [LikeTalkContentService],
    }).compile();

    controller = module.get<LikeTalkContentController>(
      LikeTalkContentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

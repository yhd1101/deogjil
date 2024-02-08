import { Test, TestingModule } from '@nestjs/testing';
import { LikeTalkContentService } from '../like-talk-content.service';

describe('LikeTalkContentService', () => {
  let service: LikeTalkContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LikeTalkContentService],
    }).compile();

    service = module.get<LikeTalkContentService>(LikeTalkContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

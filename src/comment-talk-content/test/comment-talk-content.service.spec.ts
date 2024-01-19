import { Test, TestingModule } from '@nestjs/testing';
import { CommentTalkContentService } from '../comment-talk-content.service';

describe('CommentTalkContentService', () => {
  let service: CommentTalkContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentTalkContentService],
    }).compile();

    service = module.get<CommentTalkContentService>(CommentTalkContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

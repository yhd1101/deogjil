import { Test, TestingModule } from '@nestjs/testing';
import { CommentContentService } from '../comment-content.service';

describe('CommentContentService', () => {
  let service: CommentContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CommentContentService],
    }).compile();

    service = module.get<CommentContentService>(CommentContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CommentTalkContentController } from '../comment-talk-content.controller';
import { CommentTalkContentService } from '../comment-talk-content.service';

describe('CommentTalkContentController', () => {
  let controller: CommentTalkContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentTalkContentController],
      providers: [CommentTalkContentService],
    }).compile();

    controller = module.get<CommentTalkContentController>(
      CommentTalkContentController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

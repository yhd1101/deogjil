import { Test, TestingModule } from '@nestjs/testing';
import { CommentContentController } from '../comment-content.controller';
import { CommentContentService } from '../comment-content.service';

describe('CommentContentController', () => {
  let controller: CommentContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentContentController],
      providers: [CommentContentService],
    }).compile();

    controller = module.get<CommentContentController>(CommentContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

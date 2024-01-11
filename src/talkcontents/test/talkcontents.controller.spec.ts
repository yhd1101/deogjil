import { Test, TestingModule } from '@nestjs/testing';
import { TalkcontentsController } from '../talkcontents.controller';
import { TalkcontentsService } from '../talkcontents.service';

describe('TalkcontentsController', () => {
  let controller: TalkcontentsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TalkcontentsController],
      providers: [TalkcontentsService],
    }).compile();

    controller = module.get<TalkcontentsController>(TalkcontentsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

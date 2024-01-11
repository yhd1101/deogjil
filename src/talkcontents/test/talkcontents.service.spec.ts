import { Test, TestingModule } from '@nestjs/testing';
import { TalkcontentsService } from '../talkcontents.service';

describe('TalkcontentsService', () => {
  let service: TalkcontentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [TalkcontentsService],
    }).compile();

    service = module.get<TalkcontentsService>(TalkcontentsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

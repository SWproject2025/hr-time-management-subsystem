import { Test, TestingModule } from '@nestjs/testing';
import { CalcDraftService } from './calc-draft.service';

describe('CalcDraftService', () => {
  let service: CalcDraftService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CalcDraftService],
    }).compile();

    service = module.get<CalcDraftService>(CalcDraftService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { CalcDraftController } from './calc-draft.controller';
import { CalcDraftService } from './calc-draft.service';

describe('CalcDraftController', () => {
  let controller: CalcDraftController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalcDraftController],
      providers: [CalcDraftService],
    }).compile();

    controller = module.get<CalcDraftController>(CalcDraftController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

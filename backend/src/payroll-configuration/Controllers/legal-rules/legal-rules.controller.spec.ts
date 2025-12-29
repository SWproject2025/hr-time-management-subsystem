import { Test, TestingModule } from '@nestjs/testing';
import { LegalRulesController } from './legal-rules.controller';

describe('LegalRulesController', () => {
  let controller: LegalRulesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LegalRulesController],
    }).compile();

    controller = module.get<LegalRulesController>(LegalRulesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { InsuranceBracketController } from './insurance-bracket.controller';

describe('InsuranceBracketController', () => {
  let controller: InsuranceBracketController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InsuranceBracketController],
    }).compile();

    controller = module.get<InsuranceBracketController>(InsuranceBracketController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

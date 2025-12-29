import { Test, TestingModule } from '@nestjs/testing';
import { SigningBonusController } from './signing-bonus.controller';

describe('SigningBonusController', () => {
  let controller: SigningBonusController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SigningBonusController],
    }).compile();

    controller = module.get<SigningBonusController>(SigningBonusController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

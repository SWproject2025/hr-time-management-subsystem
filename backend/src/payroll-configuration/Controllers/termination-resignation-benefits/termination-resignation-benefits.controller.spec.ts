import { Test, TestingModule } from '@nestjs/testing';
import { TerminationResignationBenefitsController } from './termination-resignation-benefits.controller';

describe('TerminationResignationBenefitsController', () => {
  let controller: TerminationResignationBenefitsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TerminationResignationBenefitsController],
    }).compile();

    controller = module.get<TerminationResignationBenefitsController>(TerminationResignationBenefitsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

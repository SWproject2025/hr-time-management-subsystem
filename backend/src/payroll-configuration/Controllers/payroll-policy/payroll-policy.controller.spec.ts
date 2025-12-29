import { Test, TestingModule } from '@nestjs/testing';
import { PayrollPolicyController } from './payroll-policy.controller';

describe('PayrollPolicyController', () => {
  let controller: PayrollPolicyController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayrollPolicyController],
    }).compile();

    controller = module.get<PayrollPolicyController>(PayrollPolicyController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

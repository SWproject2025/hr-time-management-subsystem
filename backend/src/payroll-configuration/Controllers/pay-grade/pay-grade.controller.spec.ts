import { Test, TestingModule } from '@nestjs/testing';
import { PayGradeController } from './pay-grade.controller';

describe('PayGradeController', () => {
  let controller: PayGradeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayGradeController],
    }).compile();

    controller = module.get<PayGradeController>(PayGradeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

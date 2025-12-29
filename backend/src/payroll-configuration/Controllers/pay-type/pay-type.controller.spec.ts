import { Test, TestingModule } from '@nestjs/testing';
import { PayTypeController } from './pay-type.controller';

describe('PayTypeController', () => {
  let controller: PayTypeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PayTypeController],
    }).compile();

    controller = module.get<PayTypeController>(PayTypeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

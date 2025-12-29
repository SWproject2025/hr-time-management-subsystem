import { Test, TestingModule } from '@nestjs/testing';
import { CompanyWideSettingsController } from './company-wide-settings.controller';

describe('CompanyWideSettingsController', () => {
  let controller: CompanyWideSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompanyWideSettingsController],
    }).compile();

    controller = module.get<CompanyWideSettingsController>(CompanyWideSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

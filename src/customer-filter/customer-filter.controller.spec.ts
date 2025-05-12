import { Test, TestingModule } from '@nestjs/testing';
import { CustomReportController } from './customer-filter.controller';
import { CustomReportService } from './customer-filter.service';

describe('CustomerFilterController', () => {
  let controller: CustomReportController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CustomReportController],
      providers: [CustomReportService],
    }).compile();

    controller = module.get<CustomReportController>(CustomReportController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});

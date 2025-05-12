import { Test, TestingModule } from '@nestjs/testing';
import { CustomReportService } from './customer-filter.service';

describe('CustomerFilterService', () => {
  let service: CustomReportService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CustomReportService],
    }).compile();

    service = module.get<CustomReportService>(CustomReportService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

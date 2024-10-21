import { Test, TestingModule } from '@nestjs/testing';
import { LongitudesService } from './longitudes.service';

describe('LongitudesService', () => {
  let service: LongitudesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LongitudesService],
    }).compile();

    service = module.get<LongitudesService>(LongitudesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

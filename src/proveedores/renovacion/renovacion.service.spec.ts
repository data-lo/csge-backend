import { Test, TestingModule } from '@nestjs/testing';
import { RenovacionService } from './renovacion.service';

describe('RenovacionService', () => {
  let service: RenovacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RenovacionService],
    }).compile();

    service = module.get<RenovacionService>(RenovacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

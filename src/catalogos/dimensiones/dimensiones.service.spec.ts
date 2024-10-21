import { Test, TestingModule } from '@nestjs/testing';
import { DimensionesService } from './dimensiones.service';

describe('DimensionesService', () => {
  let service: DimensionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DimensionesService],
    }).compile();

    service = module.get<DimensionesService>(DimensionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ActivacionService } from './activacion.service';

describe('ActivacionService', () => {
  let service: ActivacionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ActivacionService],
    }).compile();

    service = module.get<ActivacionService>(ActivacionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

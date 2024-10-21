import { Test, TestingModule } from '@nestjs/testing';
import { FormatosService } from './formatos.service';

describe('FormatosService', () => {
  let service: FormatosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FormatosService],
    }).compile();

    service = module.get<FormatosService>(FormatosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

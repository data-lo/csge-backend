import { Test, TestingModule } from '@nestjs/testing';
import { ImpresionesService } from './impresiones.service';

describe('ImpresionesService', () => {
  let service: ImpresionesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ImpresionesService],
    }).compile();

    service = module.get<ImpresionesService>(ImpresionesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

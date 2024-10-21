import { Test, TestingModule } from '@nestjs/testing';
import { ContratosModificatoriosService } from './contratos_modificatorios.service';

describe('ContratosModificatoriosService', () => {
  let service: ContratosModificatoriosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ContratosModificatoriosService],
    }).compile();

    service = module.get<ContratosModificatoriosService>(ContratosModificatoriosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

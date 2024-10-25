import { Test, TestingModule } from '@nestjs/testing';
import { ServicioContratadoService } from './servicio_contratado.service';

describe('ServicioContratadoService', () => {
  let service: ServicioContratadoService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ServicioContratadoService],
    }).compile();

    service = module.get<ServicioContratadoService>(ServicioContratadoService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

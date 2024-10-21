import { Test, TestingModule } from '@nestjs/testing';
import { CaracteristicasService } from './caracteristicas.service';

describe('CaracteristicasService', () => {
  let service: CaracteristicasService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CaracteristicasService],
    }).compile();

    service = module.get<CaracteristicasService>(CaracteristicasService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});

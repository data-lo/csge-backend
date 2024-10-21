import { Test, TestingModule } from '@nestjs/testing';
import { CaracteristicasController } from './caracteristicas.controller';
import { CaracteristicasService } from './caracteristicas.service';

describe('CaracteristicasController', () => {
  let controller: CaracteristicasController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CaracteristicasController],
      providers: [CaracteristicasService],
    }).compile();

    controller = module.get<CaracteristicasController>(CaracteristicasController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
